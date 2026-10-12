import logging
import math
import uuid
from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from Account.models import BuyerShipping
from Delivery.models import (
    DeliveryAssignment,
    PartnerLocation,
    RiderEarning,
      # <-- agar ShopLocation kisi aur app mein hai toh import path badal do
)

from Products.services.cloudnary_images import get_pr_small_url

from .CartSerializer import AddToCartSerializer, CartItemSerializer
from .models import AddToCart, OrderItem, Orders
from Products.models import ShopLocation,Products
from .Serializers import CheckoutSerializer, OrderSerializer

logger = logging.getLogger(__name__)

TWO_PLACES = Decimal("0.01")
EARTH_RADIUS_KM = 6371


# ==================================================
# Helpers
# ==================================================
def money(value) -> Decimal:
    """Kisi bhi value ko 2 decimal places ke Decimal mein convert karta hai."""
    return Decimal(str(value)).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def haversine_km(lat1, lon1, lat2, lon2) -> Decimal:
    """Do coordinates ke beech ki distance (KM), Decimal mein."""
    lat1, lon1, lat2, lon2 = map(
        math.radians, (float(lat1), float(lon1), float(lat2), float(lon2))
    )
    dlat, dlon = lat2 - lat1, lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    distance = EARTH_RADIUS_KM * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return money(distance)


def get_rate_per_km() -> Decimal:
    return Decimal(str(getattr(settings, "DELIVERY_RATE_PER_KM", "10.00")))


def get_min_fee() -> Decimal:
    return Decimal(str(getattr(settings, "DELIVERY_MIN_FEE", "20.00")))


def get_max_distance_km() -> Decimal:
    return Decimal(str(getattr(settings, "DELIVERY_MAX_DISTANCE_KM", "3000000.00")))


def calculate_delivery_fee(distance_km: Decimal) -> Decimal:
    """distance x rate per km, lekin minimum fee se kam nahi."""
    fee = money(distance_km * get_rate_per_km())
    return max(fee, money(get_min_fee()))


def generate_order_id() -> str:
    return f"KS{uuid.uuid4().hex[:8].upper()}"


class CheckoutError(Exception):
    """Business-rule error jo user ko 4xx ke saath dikhana hai."""

    def __init__(self, message, http_status=status.HTTP_400_BAD_REQUEST):
        super().__init__(message)
        self.message = message
        self.http_status = http_status


# ==================================================
# Cart
# ==================================================
class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # 1. GET: user ka cart + grand total
    def get(self, request):
        cart_items = AddToCart.objects.filter(user=request.user).select_related("product")
        serializer = CartItemSerializer(cart_items, many=True)

        grand_total = money(sum(Decimal(str(i.total_price)) for i in cart_items))

        return Response(
            {
                "success": True,
                "cart_count": len(cart_items),
                "grand_total": float(grand_total),
                "items": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # 2. POST: product add karo / quantity badhao
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        product_id = serializer.validated_data["product_id"]  # UUID
        quantity = serializer.validated_data["quantity"]

        product = get_object_or_404(Products, uuid=product_id)

        if not product.is_available or product.stock <= 0:
            return Response(
                {"error": "This product is currently out of stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity > product.stock:
            return Response(
                {"error": f"Only {product.stock} items available in stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item, created = AddToCart.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={"quantity": quantity},
        )

        if not created:
            if cart_item.quantity + quantity > product.stock:
                return Response(
                    {"error": f"Cannot add more. Stock limit is {product.stock} items."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            cart_item.quantity += quantity
            cart_item.save()

        return Response(
            {
                "message": "Product added to cart successfully!",
                "data": CartItemSerializer(cart_item).data,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    # 3. PATCH: quantity directly set karo
    def patch(self, request):
        cart_id = request.data.get("cart_id")
        new_quantity = request.data.get("quantity")

        if not cart_id or new_quantity is None:
            return Response(
                {"error": "cart_id and quantity are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            new_quantity = int(new_quantity)
        except (TypeError, ValueError):
            return Response(
                {"error": "quantity must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item = get_object_or_404(AddToCart, id=cart_id, user=request.user)

        if new_quantity <= 0:
            cart_item.delete()
            return Response({"message": "Item removed from cart."}, status=status.HTTP_200_OK)

        if new_quantity > cart_item.product.stock:
            return Response(
                {"error": f"Only {cart_item.product.stock} items available in stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item.quantity = new_quantity
        cart_item.save()

        return Response(
            {"message": "Cart updated.", "data": CartItemSerializer(cart_item).data},
            status=status.HTTP_200_OK,
        )

    # 4. DELETE: item hatao ya poora cart clear karo
    def delete(self, request):
        cart_id = request.data.get("cart_id")
        clear_all = request.data.get("clear_all", False)

        if clear_all:
            AddToCart.objects.filter(user=request.user).delete()
            return Response({"message": "Cart cleared successfully!"}, status=status.HTTP_200_OK)

        if not cart_id:
            return Response(
                {"error": "cart_id is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        cart_item = get_object_or_404(AddToCart, id=cart_id, user=request.user)
        cart_item.delete()

        return Response(
            {"message": "Item removed from cart successfully!"}, status=status.HTTP_200_OK
        )


# ==================================================
# Checkout
# ==================================================
def lock_nearest_available_rider(shop):
    """
    Shop ke sabse nearby available rider ko lock karke return karta hai.
    select_for_update se do orders ek hi rider ko assign nahi honge.
    Sirf transaction.atomic ke andar call karo.
    """
    locations = (
        PartnerLocation.objects
        .select_related("rider")
        .filter(rider__is_available=True)
    )

    ranked = sorted(
        (
            (
                haversine_km(shop.latitude, shop.longitude, loc.latitude, loc.longitude),
                loc.rider_id,
            )
            for loc in locations
        ),
        key=lambda pair: pair[0],
    )

    rider_model = PartnerLocation._meta.get_field("rider").related_model

    for _, rider_id in ranked:
        rider = (
            rider_model.objects
            .select_for_update()
            .filter(pk=rider_id, is_available=True)
            .first()
        )
        if rider:
            return rider

    return None


class CheckoutOrderView(CreateAPIView):
    """
    Order place karta hai.
    Delivery fee = shop se customer address tak ki distance x rate per km
    (server par calculate hoti hai, frontend se nahi li jaati).
    """

    serializer_class = CheckoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                payload = self._place_order(request.user, serializer.validated_data)
        except CheckoutError as exc:
            return Response({"message": exc.message}, status=exc.http_status)
        except Exception:
            logger.exception("Checkout failed for user_id=%s", request.user.id)
            return Response(
                {"message": "Order place nahi ho paya. Kripya dobara try karein."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(payload, status=status.HTTP_201_CREATED)

    def _place_order(self, user, data):
        # ---------- Cart ----------
        cart_items = list(AddToCart.objects.select_related("product").filter(user=user))
        if not cart_items:
            raise CheckoutError("Cart is empty")

        for item in cart_items:
            product = item.product
            if not product.is_available or product.stock < item.quantity:
                raise CheckoutError(
                    f"'{product.name}' ka stock kam hai ya available nahi hai."
                )

        # ---------- Address ----------
        address = get_object_or_404(BuyerShipping, id=data["address_id"], user=user)

        if address.latitude is None or address.longitude is None:
            raise CheckoutError("Is address ki location (latitude/longitude) missing hai.")

        # ---------- Shop ----------
        shop = ShopLocation.objects.first()
        if shop is None:
            raise CheckoutError(
                "SHop Location is Not Valid.", status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # ---------- Distance & delivery fee ----------
        distance_km = haversine_km(
            shop.latitude, shop.longitude, address.latitude, address.longitude
        )

        max_distance = get_max_distance_km()
        if distance_km > max_distance:
            raise CheckoutError(
                f"Not Servicable ({max_distance} km)."
            )

        delivery_fee = calculate_delivery_fee(distance_km)

        # ---------- Bill ----------
        subtotal = money(sum(Decimal(str(i.total_price)) for i in cart_items))
        total_amount = subtotal + delivery_fee

        # ---------- Rider ----------
        rider = lock_nearest_available_rider(shop)
        if rider is None:
            raise CheckoutError(
                "Partnar Are not Available.",
                status.HTTP_409_CONFLICT,
            )

        # ---------- Order ----------
        order = Orders.objects.create(
            user=user,
            address=address,
            order_id=generate_order_id(),
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total_amount=total_amount,
            payment_method=data["payment_method"],
            payment_status="Pending",
            status="accepted",
            delivery_partner=rider,
        )

        # ---------- Order items (snapshot) ----------
        order_items = []
        for item in cart_items:
            product = item.product
            image_url = get_pr_small_url(product.image.public_id) if product.image else ""
            order_items.append(
                OrderItem(
                    order=order,
                    product=product,
                    product_name=product.name,
                    product_image=image_url,
                    quantity=item.quantity,
                    price=money(product.final_price()),
                )
            )
        OrderItem.objects.bulk_create(order_items)

        # ---------- Rider assignment & earning ----------
        rider.is_available = False
        rider.save(update_fields=["is_available"])

        DeliveryAssignment.objects.create(order=order, rider=rider, status="assigned")

        RiderEarning.objects.create(
            rider=rider,
            order=order,
            delivery_fee=delivery_fee,
            tip=Decimal("0.00"),
        )

        # ---------- Clear cart ----------
        AddToCart.objects.filter(user=user).delete()

        return {
            "message": "Order placed successfully",
            "order_id": order.order_id,
            "status": order.status,
            "assigned_rider": rider.fullName,
            "distance_km": float(distance_km),
            "rate_per_km": float(get_rate_per_km()),
            "subtotal": float(subtotal),
            "delivery_fee": float(delivery_fee),
            "total_amount": float(total_amount),
        }


# ==================================================
# Orders
# ==================================================
class OrderListView(APIView):
    """User ke saare past orders."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = (
            Orders.objects
            .filter(user=request.user)
            .order_by("-created_at")
            .prefetch_related("items")
        )
        return Response(OrderSerializer(orders, many=True).data, status=status.HTTP_200_OK)


class OrderDetailView(APIView):
    """Ek specific order ki detail."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Orders, order_id=order_id, user=request.user)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class ActiveOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1. Check karein agar Logged-in user Customer hai
        order = Orders.objects.filter(user=user).exclude(status="delivered").first()

        # 2. Agar Customer ka order nahi hai, to check karein kya ye assigned Rider hai
        if not order:
            order = Orders.objects.filter(
                delivery_partner__user=user
            ).exclude(status="delivered").first()

        if not order:
            return Response({"has_active_order": False, "message": "Not found any Order Active"}, status=404)

        return Response({
            "has_active_order": True,
            "order_id": str(order.order_id),
            "status": order.status,
            # Agar customer delivery coordinates send karne hain
            "customer_latitude": getattr(order, "delivery_latitude", 28.6280),
            "customer_longitude": getattr(order, "delivery_longitude", 77.2189),
        })        