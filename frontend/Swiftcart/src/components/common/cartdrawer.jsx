import React from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, AlertCircle, Loader2 } from "lucide-react";
import { useCart } from "../services/CartContext";

const formatINR = (value) =>
  Math.round(Number(value) || 0).toLocaleString("en-IN");

function CartLine({ item, onIncrement, onDecrement, onRemove }) {
  const { product, quantity, total_price } = item;
  const atStockLimit = quantity >= Number(product.stock);

  return (
    <div className="flex gap-3 py-4 border-b border-slate-100 last:border-b-0">
      <div className="w-16 h-16 shrink-0 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
        {product.pr_small_url ? (
          <img
            src={product.pr_small_url}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <ShoppingBag className="w-5 h-5 text-slate-300" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
            {product.name}
          </h4>
          {product.package_quantity && (
            <p className="text-xs text-slate-500 mt-0.5">
              {Number(product.package_quantity)} {product.package_unit}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div
            className="flex items-center gap-1 bg-emerald-600 text-white font-bold rounded-md h-7 px-1 text-xs"
            role="group"
            aria-label={`Quantity for ${product.name}`}
          >
            <button
              type="button"
              onClick={() => onDecrement(item)}
              aria-label="Decrease quantity"
              className="flex items-center justify-center w-5 h-full rounded hover:bg-emerald-700 active:scale-90 transition-all"
            >
              <Minus size={12} strokeWidth={2.5} />
            </button>
            <span className="min-w-[1.1rem] text-center tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => onIncrement(item)}
              disabled={atStockLimit}
              aria-label="Increase quantity"
              className="flex items-center justify-center w-5 h-full rounded hover:bg-emerald-700 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={12} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              ₹{formatINR(total_price)}
            </span>
            <button
              type="button"
              onClick={() => onRemove(item)}
              aria-label={`Remove ${product.name} from cart`}
              className="text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {atStockLimit && (
          <p className="text-[11px] text-amber-600 mt-1">
            Max stock reached ({product.stock} available)
          </p>
        )}
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const {
    items,
    cartCount,
    grandTotal,
    loading,
    error,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const handleIncrement = (item) => updateQuantity(item.id, item.quantity + 1);
  const handleDecrement = (item) => updateQuantity(item.id, item.quantity - 1);
  const handleRemove = (item) => removeItem(item.id);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={`fixed inset-0 z-[110] bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 z-[120] h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Your Cart
              {cartCount > 0 && (
                <span className="ml-1.5 text-sm font-semibold text-slate-400">
                  ({cartCount})
                </span>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5">
          {loading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Loading your cart…</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Your cart is empty</p>
                <p className="text-xs text-slate-500 mt-1">
                  Add items to get started — delivery in minutes.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="mt-2 text-sm font-semibold text-amber-600 hover:text-amber-700"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartLine
                  key={item.id}
                  item={item}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onRemove={handleRemove}
                />
              ))}

              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-slate-400 hover:text-rose-500 my-3 transition-colors"
              >
                Clear cart
              </button>
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 px-5 py-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">Grand total</span>
              <span className="text-xl font-bold text-slate-900">
                ₹{formatINR(grandTotal)}
              </span>
            </div>
            <button
              type="button"
              className="w-full h-12 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-sm transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}