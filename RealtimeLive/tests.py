from django.test import TestCase

# Create your tests here.
re_path(
        r"ws/order/track/(?P<order_id>[\w-]+)/$",
        consumers.OrderTrackingConsumer.as_asgi()
    ),