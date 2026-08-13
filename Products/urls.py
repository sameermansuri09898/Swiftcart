from django.urls import path
# from .views import BulkProductUploadView,ProductListView
from .import views
urlpatterns = [
  path('categories/',views.categoryViews.as_view(),name = 'category-list'),
  path('products/bulk-upload/',views.BulkProductUploadView.as_view()),
  path("products/",views.ProductListView.as_view(),name="product-list"),
]