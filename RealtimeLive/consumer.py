import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

# Model Imports (Apne app modules ke anusar modify karein)
from Order.models import Orders
from Delivery.models import PartnerLocation, DeliveryAssignment

logger = logging.getLogger(__name__)


class OrderTrackingConsumer(AsyncWebsocketConsumer):
    """
    Production-grade WebSocket consumer for real-time order tracking.
    Handles dual authorization (Customer & Rider), static destination payload,
    and continuous rider GPS stream.
    """

    async def connect(self):
        self.user = self.scope.get("user")

        # 1. Unauthenticated / Anonymous User Protection
        if not self.user or self.user.is_anonymous:
            logger.warning("Unauthenticated WebSocket connection attempt blocked.")
            await self.close(code=4001)
            return

        self.order_id = self.scope["url_route"]["kwargs"].get("order_id")
        if not self.order_id:
            await self.close(code=4000)
            return

        self.room_name = f"order_{self.order_id}"

        # 2. Authorization & Role Check (Single Optimized DB Call)
        auth_data = await self.check_authorization()
        if not auth_data["is_authorized"]:
            logger.warning(
                f"Unauthorized connection attempt by User ID {self.user.id} for Order ID {self.order_id}"
            )
            await self.close(code=4003)
            return

        # Store rider state on connection instance
        self.is_user_rider = auth_data["is_rider"]

        # 3. Join Order WebSocket Channel Group
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

        # 4. Send Initial Location Data (Customer Destination + Rider's Last Known Location)
        initial_data = await self.get_initial_data()
        if initial_data:
            await self.send(
                text_data=json.dumps(
                    {"type": "initial_location", **initial_data}
                )
            )

    async def disconnect(self, close_code):
        # Leave Channel Group
        if hasattr(self, "room_name"):
            await self.channel_layer.group_discard(
                self.room_name, self.channel_name
            )

    async def receive(self, text_data=None, bytes_data=None):
        """
        Receives continuous Lat/Lng stream from Rider app and broadcasts to group.
        """
        # Security Guard: Customer is not allowed to stream GPS
        if not self.is_user_rider:
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "error",
                        "message": "Only assigned rider can publish location updates.",
                    }
                )
            )
            return

        if not text_data:
            return

        try:
            data = json.loads(text_data)
            latitude = float(data["latitude"])
            longitude = float(data["longitude"])
            status = data.get("status", "ontheway")
            heading = data.get("heading")  # Optional: Compass direction (0-360 deg) for marker rotation

            # Geographic Bounds Validation
            if not (-90.0 <= latitude <= 90.0) or not (-180.0 <= longitude <= 180.0):
                raise ValueError("Coordinates are out of bounds.")

        except (KeyError, ValueError, json.JSONDecodeError) as e:
            logger.error(f"Invalid GPS data payload received from rider {self.user.id}: {e}")
            await self.send(
                text_data=json.dumps({"type": "error", "message": "Invalid coordinates payload format."})
            )
            return

        # Persist coordinates in Database
        await self.save_location(latitude, longitude, status)

        # Broadcast live coordinates to Order Room
        payload = {
            "type": "location_update",
            "latitude": latitude,
            "longitude": longitude,
            "status": status,
        }
        if heading is not None:
            payload["heading"] = heading

        await self.channel_layer.group_send(self.room_name, payload)

    async def location_update(self, event):
        """
        Broadcast handler for live map marker movement.
        """
        response = {
            "type": "live_location",
            "latitude": event["latitude"],
            "longitude": event["longitude"],
            "status": event["status"],
        }
        if "heading" in event:
            response["heading"] = event["heading"]

        await self.send(text_data=json.dumps(response))

    # =========================================================================
    # ASYNC DATABASE QUERIES & HELPERS
    # =========================================================================

    @database_sync_to_async
    def check_authorization(self) -> dict:
        """
        Combines authorization and rider detection into 1 query to reduce DB roundtrips.
        """
        try:
            order = Orders.objects.select_related(
                "user", "delivery_partner__user"
            ).get(order_id=self.order_id)

            is_customer = order.user == self.user
            is_rider = bool(
                order.delivery_partner and order.delivery_partner.user == self.user
            )

            return {
                "is_authorized": is_customer or is_rider,
                "is_rider": is_rider,
            }
        except Orders.DoesNotExist:
            return {"is_authorized": False, "is_rider": False}

    @database_sync_to_async
    def get_initial_data(self) -> dict | None:
        """
        Fetches static Customer delivery location along with Rider's current location.
        """
        try:
            order = Orders.objects.select_related(
                "delivery_partner", "address"
            ).get(order_id=self.order_id)

            # Resolve Customer Destination Coordinates
            dest_lat = None
            dest_lng = None

            if hasattr(order, "address") and order.address:
                dest_lat = float(order.address.latitude)
                dest_lng = float(order.address.longitude)
            elif hasattr(order, "delivery_latitude") and hasattr(order, "delivery_longitude"):
                dest_lat = float(order.delivery_latitude)
                dest_lng = float(order.delivery_longitude)

            payload = {
                "status": order.status,
                "destination": {
                    "latitude": dest_lat,
                    "longitude": dest_lng,
                } if dest_lat is not None else None,
                "rider": None,
            }

            # Resolve Rider Current Coordinates
            if order.delivery_partner:
                try:
                    location = PartnerLocation.objects.get(
                        rider=order.delivery_partner
                    )
                    assignment = DeliveryAssignment.objects.filter(
                        order=order
                    ).first()

                    payload["status"] = (
                        assignment.status if assignment else order.status
                    )
                    payload["rider"] = {
                        "latitude": float(location.latitude),
                        "longitude": float(location.longitude),
                    }
                except PartnerLocation.DoesNotExist:
                    pass

            return payload

        except Orders.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error generating initial tracking payload: {e}")
            return None

    @database_sync_to_async
    def save_location(self, lat: float, lng: float, status: str) -> bool:
        """
        Upserts live coordinates and updates order status.
        """
        try:
            order = Orders.objects.select_related("delivery_partner").get(
                order_id=self.order_id
            )
            if not order.delivery_partner:
                return False

            # Update live coordinates in PartnerLocation table
            PartnerLocation.objects.update_or_create(
                rider=order.delivery_partner,
                defaults={"latitude": lat, "longitude": lng},
            )

            # Update Assignment Status
            DeliveryAssignment.objects.filter(order=order).update(
                status=status
            )

            # Update Main Order Status
            if order.status != status:
                order.status = status
                order.save(update_fields=["status"])

            return True
        except Exception as e:
            logger.error(f"Error saving rider location for Order {self.order_id}: {e}")
            return False