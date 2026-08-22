import React, { useState } from "react";
import { Plus, Minus, Star, ImageOff, Heart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. useNavigate Import Kiya
import { useCart } from "../services/CartContext.jsx";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const formatINR = (value) =>
  Math.round(Number(value) || 0).toLocaleString("en-IN");

function getPricing(product) {
  const mrp = Number(product?.price_inr) || 0;
  const finalPrice = Number(product?.final_price) || 0;
  const hasDiscount = mrp > finalPrice && mrp > 0;
  const discountAmount = hasDiscount ? Math.round(mrp - finalPrice) : 0;
  const discountPercent = hasDiscount
    ? Math.round(((mrp - finalPrice) / mrp) * 100)
    : 0;

  return {
    mrp: hasDiscount ? formatINR(mrp) : null,
    price: formatINR(finalPrice),
    discountAmount: hasDiscount ? discountAmount : null,
    discountPercent: hasDiscount ? discountPercent : null,
  };
}

/* ------------------------------------------------------------------ */
/*  Rating Pill                                                        */
/* ------------------------------------------------------------------ */
function RatingPill({ rating, ratingCount }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1 justify-end">
      <div className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/70 rounded px-1.5 py-0.5 text-[10px] font-bold">
        <span>{Number(rating).toFixed(1)}</span>
        <Star size={9} className="fill-emerald-600 text-emerald-600 shrink-0" />
      </div>
      {ratingCount ? (
        <span className="text-[10px] text-slate-400">({ratingCount})</span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Compact Qty Stepper                                               */
/* ------------------------------------------------------------------ */
function QtyStepper({ qty, onIncrement, onDecrement, disabled }) {
  return (
    <div
      className="flex items-center justify-between h-7 bg-emerald-600 text-white font-bold rounded-md shadow-xs px-0.5 text-xs min-w-[70px]"
      role="group"
      aria-label="Quantity"
      onClick={(e) => e.stopPropagation()} // Stop navigation when clicking stepper container
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
        disabled={disabled}
        aria-label="Decrease quantity"
        className="flex items-center justify-center w-5 h-full rounded hover:bg-emerald-700 active:scale-90 transition-all disabled:opacity-50"
      >
        <Minus size={12} strokeWidth={2.5} />
      </button>
      <span className="min-w-[1rem] text-center tabular-nums text-[11px]">{qty}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        disabled={disabled}
        aria-label="Increase quantity"
        className="flex items-center justify-center w-5 h-full rounded hover:bg-emerald-700 active:scale-90 transition-all disabled:opacity-50"
      >
        <Plus size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PRODUCT CARD — wired to the shared CartContext                    */
/* ------------------------------------------------------------------ */
export default function ProductCard({ product, badge, showWishlist = true }) {
  const navigate = useNavigate(); // 2. Navigation Hook Initialize Kiya
  const [imgError, setImgError] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [busy, setBusy] = useState(false);

  const { getQuantityFor, getCartIdFor, addToCart, updateQuantity } = useCart();

  const productKey = product?.uuid || product?.id;
  const qty = getQuantityFor(productKey);
  const cartId = getCartIdFor(productKey);

  const { mrp, price, discountAmount, discountPercent } = getPricing(product);
  const outOfStock = !product?.is_available || Number(product?.stock) <= 0;
  const atStockLimit = qty >= Number(product?.stock || 0);

  // 3. Card Click Handler (Navigates to detail page using product.slug)
  const handleCardClick = () => {
    if (product?.slug) {
      navigate(`/ProductDetail/${product.slug}/`);
    }
  };

  const handleAdd = async (e) => {
    e.stopPropagation(); // Stop card click
    if (outOfStock || busy) return;
    setBusy(true);
    await addToCart(product, 1);
    setBusy(false);
  };

  const handleIncrement = async () => {
    if (busy || atStockLimit || !cartId) return;
    setBusy(true);
    await updateQuantity(cartId, qty + 1);
    setBusy(false);
  };

  const handleDecrement = async () => {
    if (busy || !cartId) return;
    setBusy(true);
    await updateQuantity(cartId, qty - 1);
    setBusy(false);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation(); // Stop card click
    setWishlisted((w) => !w);
  };

  return (
    <article
      onClick={handleCardClick} // 4. Click event added to root card
      className="group relative flex flex-col w-full h-full bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-square bg-slate-50/50 p-2.5 flex items-center justify-center">
        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1 items-start">
          {badge && (
            <span className="bg-amber-500 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-xs tracking-tight">
              {badge}
            </span>
          )}
          {discountPercent > 0 && !badge && (
            <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist */}
        {showWishlist && (
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-1.5 right-1.5 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/80 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <Heart size={12} className={wishlisted ? "fill-rose-500 text-rose-500" : ""} />
          </button>
        )}

        {/* Product Image */}
        {!imgError && product?.pr_small_url ? (
          <img
            src={product.pr_small_url}
            alt={product?.name || "Product"}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${
              outOfStock ? "opacity-30 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <ImageOff size={24} strokeWidth={1.5} />
            <span className="text-[9px] mt-0.5 font-medium">No image</span>
          </div>
        )}

        {/* Out of stock label */}
        {outOfStock && (
          <span className="absolute inset-x-0 bottom-2 z-10 mx-auto w-fit bg-slate-900/85 backdrop-blur-xs text-white text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full shadow-xs">
            Out of stock
          </span>
        )}

        {/* Action Button (Add / Stepper) */}
        <div
          className="absolute bottom-1.5 right-1.5 z-20"
          onClick={(e) => e.stopPropagation()} // Stop navigation when clicking action area
        >
          {busy && qty === 0 ? (
            <div className="flex items-center justify-center h-7 w-12 rounded-md border border-emerald-200 bg-white">
              <Loader2 size={13} className="animate-spin text-emerald-600" />
            </div>
          ) : qty > 0 ? (
            <QtyStepper
              qty={qty}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              disabled={busy}
            />
          ) : (
            <button
              type="button"
              disabled={outOfStock}
              onClick={handleAdd}
              className={`flex items-center gap-0.5 font-bold text-[11px] h-7 px-2.5 rounded-md border shadow-2xs transition-all duration-150 ${
                outOfStock
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-white border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white active:scale-95 cursor-pointer"
              }`}
            >
              {!outOfStock && <Plus size={12} strokeWidth={2.5} />}
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>

      {/* Info Area */}
      <div className="flex flex-col p-2.5 flex-1 justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 h-8 group-hover:text-amber-600 transition-colors">
            {product?.name || "Untitled product"}
          </h3>

          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
            {product?.package_quantity
              ? `${Number(product.package_quantity)} ${product.package_unit || ""}`
              : "\u00A0"}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 items-center gap-y-0.5">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-900 leading-none">₹{price}</span>
            {mrp && (
              <span className="text-[10px] text-slate-400 line-through leading-none">
                ₹{mrp}
              </span>
            )}
          </div>

          <div className="text-right">
            {discountAmount && (
              <span className="text-[10px] font-bold text-emerald-600 leading-none">
                Save ₹{discountAmount}
              </span>
            )}
          </div>

          <div className="col-span-2 mt-1">
            <RatingPill rating={product?.rating} ratingCount={product?.ratingCount} />
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                          */
/* ------------------------------------------------------------------ */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col w-full h-full bg-white rounded-xl border border-slate-200/80 overflow-hidden animate-pulse">
      <div className="w-full aspect-square bg-slate-100" />
      <div className="flex flex-col p-2.5 gap-2 flex-1 justify-between">
        <div className="space-y-1.5">
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-2/3" />
        </div>
        <div className="pt-2 border-t border-slate-100 space-y-1">
          <div className="h-3.5 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}