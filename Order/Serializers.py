from rest_framework import serializers
from .models import Orders, OrderItem, AddToCart, BuyerShipping

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price', 'total_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Orders
        fields = [
            'id', 
            'order_id', 
            'user', 
            'address', 
            'delivery_partner', 
            'status', 
            'subtotal', 
            'delivery_fee', 
            'total_amount', 
            'payment_method', 
            'payment_status', 
            'payment_id', 
            'created_at', 
            'delivered_at', 
            'items'
        ]
        read_only_fields = ['order_id', 'user', 'subtotal', 'total_amount', 'status', 'payment_status', 'created_at']

class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.IntegerField(required=True)
    payment_method = serializers.ChoiceField(choices=["COD", "Razorpay", "UPI"], default="COD")
    