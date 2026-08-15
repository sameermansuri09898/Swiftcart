import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const CartContext = createContext(null);

const API_BASE = "http://127.0.0.1:8000/Orders/cart/";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const applyResponse = (data) => {
    setItems(data.items || []);
    setCartCount(data.cart_count || 0);
    setGrandTotal(data.grand_total || 0);
  };

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_BASE, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        applyResponse(data);
      } else {
        setError(data.error || data.detail || "Couldn't load your cart.");
      }
    } catch (err) {
      setError("Couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("access_token")) fetchCart();
  }, [fetchCart]);

  // Add product (or bump quantity if it already exists)
  // NOTE: uses product.id (integer PK) to match `product_id` on the backend.
  // If your backend's AddToCartSerializer expects the UUID instead, swap
  // this to `product.uuid` — check the 400 response body in DevTools -> Network
  // to see exactly which field/value it's rejecting.
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      const productId = product.uuid ?? product.id;

      if (productId === undefined || productId === null) {
        setError("This product is missing an id — can't add it to cart.");
        return;
      }

      setCartCount((c) => c + quantity); // optimistic bump for instant feedback
      try {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ product_id: productId, quantity }),
        });
        const data = await res.json();
        if (res.ok) {
          await fetchCart();
        } else {
          console.error("Add to cart failed:", data);
          setError(
            data.error ||
              data.product_id?.[0] ||
              data.detail ||
              "Couldn't add item to cart."
          );
          await fetchCart(); // resync, undo optimistic count
        }
      } catch (err) {
        setError("Couldn't reach the server.");
        await fetchCart();
      }
    },
    [fetchCart]
  );

  // Set an exact quantity for a cart line (used by the +/- stepper)
  const updateQuantity = useCallback(
    async (cartId, newQuantity) => {
      const prevItems = items;
      setItems((cur) =>
        newQuantity <= 0
          ? cur.filter((i) => i.id !== cartId)
          : cur.map((i) => (i.id === cartId ? { ...i, quantity: newQuantity } : i))
      );

      try {
        const res = await fetch(API_BASE, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ cart_id: cartId, quantity: newQuantity }),
        });
        const data = await res.json();
        if (res.ok) {
          await fetchCart();
        } else {
          console.error("Update quantity failed:", data);
          setError(data.error || data.detail || "Couldn't update quantity.");
          setItems(prevItems);
        }
      } catch (err) {
        setError("Couldn't reach the server.");
        setItems(prevItems);
      }
    },
    [items, fetchCart]
  );

  const removeItem = useCallback(
    async (cartId) => {
      const prevItems = items;
      setItems((cur) => cur.filter((i) => i.id !== cartId));
      try {
        const res = await fetch(API_BASE, {
          method: "DELETE",
          headers: authHeaders(),
          body: JSON.stringify({ cart_id: cartId }),
        });
        if (res.ok) {
          await fetchCart();
        } else {
          const data = await res.json().catch(() => ({}));
          console.error("Remove item failed:", data);
          setItems(prevItems);
          setError(data.error || "Couldn't remove item.");
        }
      } catch (err) {
        setItems(prevItems);
        setError("Couldn't reach the server.");
      }
    },
    [items, fetchCart]
  );

  const clearCart = useCallback(async () => {
    const prevItems = items;
    setItems([]);
    setCartCount(0);
    setGrandTotal(0);
    try {
      const res = await fetch(API_BASE, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ clear_all: true }),
      });
      if (!res.ok) {
        setItems(prevItems);
        setError("Couldn't clear cart.");
        await fetchCart();
      }
    } catch (err) {
      setItems(prevItems);
      setError("Couldn't reach the server.");
    }
  }, [items, fetchCart]);

  // helper: quantity currently in cart for a given product uuid/id
  const getQuantityFor = useCallback(
    (productKey) => {
      const line = items.find(
        (i) => i.product?.uuid === productKey || i.product?.id === productKey
      );
      return line ? line.quantity : 0;
    },
    [items]
  );

  const getCartIdFor = useCallback(
    (productKey) => {
      const line = items.find(
        (i) => i.product?.uuid === productKey || i.product?.id === productKey
      );
      return line ? line.id : null;
    },
    [items]
  );

  const value = {
    items,
    cartCount,
    grandTotal,
    loading,
    error,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getQuantityFor,
    getCartIdFor,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}