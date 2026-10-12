from django.urls import re_path

from .consumer import OrderTrackingConsumer
from Products.consumers import BulkImportConsumer


websocket_urlpatterns = [

    re_path(
        r"ws/bulk-import/(?P<import_id>\d+)/$",
        BulkImportConsumer.as_asgi(),
    ),

    re_path(
        r"^ws/order/track/(?P<order_id>[\w-]+)/?$",
        OrderTrackingConsumer.as_asgi(),
    ),
]