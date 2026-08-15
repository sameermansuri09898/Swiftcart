from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import AddToCart, Products
from .CartSerializer import CartItemSerializer, AddToCartSerializer


class CartView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    # 1. GET: Fetch User Cart Items & Grand Total
    def get(self, request):
        cart_items = AddToCart.objects.filter(user=request.user).select_related('product')
        serializer = CartItemSerializer(cart_items, many=True)

        grand_total = sum(item.total_price for item in cart_items)

        return Response({
            "success": True,
            "cart_count": cart_items.count(),
            "grand_total": round(grand_total, 2),
            "items": serializer.data
        }, status=status.HTTP_200_OK)

    # 2. POST: Add Product to Cart / Increment Quantity
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        product_id = serializer.validated_data['product_id']  # this is now a UUID
        quantity = serializer.validated_data['quantity']

        # CHANGED: lookup by uuid, not internal integer id —
        # matches what the frontend actually has access to.
        product = get_object_or_404(Products, uuid=product_id)

        if not product.is_available or product.stock <= 0:
            return Response({"error": "This product is currently out of stock."}, status=status.HTTP_400_BAD_REQUEST)

        cart_item, created = AddToCart.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            if cart_item.quantity + quantity > product.stock:
                return Response({
                    "error": f"Cannot add more. Stock limit is {product.stock} items."
                }, status=status.HTTP_400_BAD_REQUEST)

            cart_item.quantity += quantity
            cart_item.save()

        return Response({
            "message": "Product added to cart successfully!",
            "data": CartItemSerializer(cart_item).data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    # 3. PATCH: Update Item Quantity Direct (e.g., set quantity = 3)
    def patch(self, request):
        cart_id = request.data.get('cart_id')
        new_quantity = request.data.get('quantity')

        if not cart_id or new_quantity is None:
            return Response({"error": "cart_id and quantity are required."}, status=status.HTTP_400_BAD_REQUEST)

        cart_item = get_object_or_404(AddToCart, id=cart_id, user=request.user)

        if int(new_quantity) <= 0:
            cart_item.delete()
            return Response({"message": "Item removed from cart."}, status=status.HTTP_200_OK)

        if int(new_quantity) > cart_item.product.stock:
            return Response({
                "error": f"Only {cart_item.product.stock} items available in stock."
            }, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = new_quantity
        cart_item.save()

        return Response({
            "message": "Cart updated.",
            "data": CartItemSerializer(cart_item).data
        }, status=status.HTTP_200_OK)

    # 4. DELETE: Remove Item from Cart
    def delete(self, request):
        cart_id = request.data.get('cart_id')
        clear_all = request.data.get('clear_all', False)

        if clear_all:
            AddToCart.objects.filter(user=request.user).delete()
            return Response({"message": "Cart cleared successfully!"}, status=status.HTTP_200_OK)

        if not cart_id:
            return Response({"error": "cart_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        cart_item = get_object_or_404(AddToCart, id=cart_id, user=request.user)
        cart_item.delete()

        return Response({"message": "Item removed from cart successfully!"}, status=status.HTTP_200_OK)