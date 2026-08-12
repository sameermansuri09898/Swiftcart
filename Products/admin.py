from django.contrib import admin
from .models import Categorys

@admin.register(Categorys)
class CategorysAdmin(admin.ModelAdmin):
  list_display =['name']
# Register your models here.
