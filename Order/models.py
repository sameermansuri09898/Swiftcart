from django.db import models
from django.conf import settings
from Products.models import Products

class AddToCart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart_items")
    product = models.ForeignKey(Products, on_delete=models.CASCADE, related_name="in_carts")
    quantity = models.PositiveIntegerField(default=1) # Fixed lowercase 'quantity'
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.quantity})"

    @property
    def total_price(self):
     return round(
        self.product.final_price() * self.quantity,
        2
    )