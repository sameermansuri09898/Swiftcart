from django.urls import path
from .views import BulkProductUploadView,ProductListView
urlpatterns = [
  path('products/bulk-upload/',BulkProductUploadView.as_view()),
  path("products/AllCategorys/",ProductListView.as_view(),name="product-list"),
]