from django.contrib import admin
from .models import Categorys,Products

@admin.register(Categorys)
class CategorysAdmin(admin.ModelAdmin):
  list_display =['name']
# Register your models here.

@admin.register(Products)
class ProductsAdmin(admin.ModelAdmin):
  list_display =['name','product_key']
# Register your models here.
