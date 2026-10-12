import uuid
from datetime import datetime

def generate_order_id():
    """
    Generates a unique professional order ID.
    Format: ORD-YYYYMMDD-XXXXXX (e.g., ORD-20261003-9A2B4C)
    """
    date_str = datetime.now().strftime('%Y%m%d')
    unique_suffix = uuid.uuid4().hex[:6].upper()
    return f"ORD-{date_str}-{unique_suffix}"