from django.contrib import admin
from .models import AddToCart

@admin.register(AddToCart)

class AddToCartAdmin(admin.ModelAdmin):
  search_fields=['products']
# Register your models here.
