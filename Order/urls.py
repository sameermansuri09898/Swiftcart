from django.urls import path

from .views import ActiveOrderView, CartView, CheckoutOrderView, OrderDetailView, OrderListView

urlpatterns = [
    # Cart: GET / POST / PATCH / DELETE
    path("cart/", CartView.as_view(), name="cart-management"),

    # Checkout: POST /Orders/create/
    path("create/", CheckoutOrderView.as_view(), name="create-order"),

    # Saare orders: GET /Orders/
    path("oders/", OrderListView.as_view(), name="order-list"),

    # Ek order ki detail: GET /Orders/KS8A2F91C3/
    # Yeh sabse neeche rakhna hai, warna "cart" aur "create" bhi order_id maan liye jayenge.
    path("<str:order_id>/", OrderDetailView.as_view(), name="order-detail"),
    path("active-order/",ActiveOrderView.as_view(), name="order-ActiveOrderView"),
]