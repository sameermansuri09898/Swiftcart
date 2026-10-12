from django.contrib import admin
from django.utils.html import format_html
from .models import AddToCart, Orders, OrderItem


# ==============================================================================
# INLINE MODELS
# ==============================================================================

class OrderItemInline(admin.TabularInline):
    """
    Allows viewing and managing Order Items directly within the Order detail page.
    """
    model = OrderItem
    extra = 0
    raw_id_fields = ['product']
    readonly_fields = ['product_name', 'product_image_preview', 'price', 'quantity', 'get_total_price']
    fields = ['product', 'product_name', 'product_image_preview', 'price', 'quantity', 'get_total_price']

    def product_image_preview(self, obj):
        if obj.product_image:
            return format_html(
                '<img src="{}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px;" />',
                obj.product_image
            )
        return "-"
    product_image_preview.short_description = "Image"

    def get_total_price(self, obj):
        return f"₹{obj.total_price:.2f}"
    get_total_price.short_description = "Total Price"


# ==============================================================================
# MODEL ADMINS
# ==============================================================================

@admin.register(AddToCart)
class AddToCartAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'quantity', 'get_total_price', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'user__email', 'product__name']
    raw_id_fields = ['user', 'product']
    ordering = ['-created_at']

    def get_total_price(self, obj):
        return f"₹{obj.total_price:.2f}"
    get_total_price.short_description = "Calculated Total"


@admin.register(Orders)
class OrdersAdmin(admin.ModelAdmin):
    list_display = [
        'order_id', 
        'user', 
        'formatted_total', 
        'payment_method', 
        'colored_payment_status', 
        'colored_status', 
        'created_at'
    ]
    list_filter = ['status', 'payment_status', 'payment_method', 'created_at', 'delivered_at']
    search_fields = ['order_id', 'user__username', 'user__email', 'payment_id']
    raw_id_fields = ['user', 'address', 'delivery_partner']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ("Order Overview", {
            "fields": ("order_id", "user", "status", "delivered_at")
        }),
        ("Fulfillment & Delivery", {
            "fields": ("address", "delivery_partner")
        }),
        ("Financial Summary", {
            "fields": ("subtotal", "delivery_fee", "total_amount")
        }),
        ("Payment Details", {
            "fields": ("payment_method", "payment_status", "payment_id")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )

    # --- Custom Displays & Formatting ---

    def formatted_total(self, obj):
        return f"₹{obj.total_amount:.2f}"
    formatted_total.short_description = "Total Amount"

    def colored_status(self, obj):
        colors = {
            'pending': '#f39c12',     # Orange
            'accepted': '#3498db',    # Blue
            'packed': '#9b59b6',      # Purple
            'picked': '#1abc9c',      # Teal
            'ontheway': '#e67e22',    # Dark Orange
            'delivered': '#2ecc71',   # Green
            'cancelled': '#e74c3c',   # Red
        }
        color = colors.get(obj.status, '#333333')
        return format_html(
            '<span style="background-color: {}; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display()
        )
    colored_status.short_description = "Order Status"

    def colored_payment_status(self, obj):
        colors = {
            'Pending': '#f39c12',
            'Paid': '#2ecc71',
            'Failed': '#e74c3c',
        }
        color = colors.get(obj.payment_status, '#7f8c8d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.payment_status
        )
    colored_payment_status.short_description = "Payment Status"


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product_name', 'price', 'quantity', 'get_total_price']
    search_fields = ['order__order_id', 'product_name', 'product__name']
    raw_id_fields = ['order', 'product']
    readonly_fields = ['get_total_price']

    def get_total_price(self, obj):
        return f"₹{obj.total_price:.2f}"
    get_total_price.short_description = "Total"