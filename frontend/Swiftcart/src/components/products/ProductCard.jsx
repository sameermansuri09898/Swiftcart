import { Plus, Star, ImageOff } from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Helpers — map real API fields into display values                  */
/* ------------------------------------------------------------------ */

const formatINR = (value) =>
  Math.round(Number(value) || 0).toLocaleString("en-IN");

function getPricing(product) {
  const mrp = Number(product.price_inr) || 0;
  const finalPrice = Number(product.final_price) || 0;
  const hasDiscount = mrp > finalPrice;
  const discountAmount = hasDiscount ? Math.round(mrp - finalPrice) : 0;

  return {
    mrp: hasDiscount ? formatINR(mrp) : null,
    price: formatINR(finalPrice),
    discountAmount: hasDiscount ? discountAmount : null,
  };
}

/* ------------------------------------------------------------------ */
/*  PRODUCT CARD                                                       */
/* ------------------------------------------------------------------ */

export default function ProductCard({ product, onAdd, badge }) {
  const [imgError, setImgError] = useState(false);
  const { mrp, price, discountAmount } = getPricing(product);
  const outOfStock = !product.is_available || Number(product.stock) <= 0;

  return (
    <article
      className="
        group relative flex flex-col
        w-full h-full
        bg-white rounded-2xl
        border border-gray-100
        hover:shadow-lg hover:border-gray-200
        transition-all duration-300
        overflow-visible
      "
    >
      {/* Image area */}
      <div className="relative w-full aspect-square rounded-t-2xl overflow-hidden bg-gray-50 p-4 flex items-center justify-center">
        {badge && (
          <span
            className="
              absolute top-2 left-2 z-10
              bg-blue-600 text-white
              text-[9px] font-bold uppercase
              px-2 py-0.5 rounded
              tracking-wide
            "
          >
            {badge}
          </span>
        )}

        {!imgError && product.pr_small_url ? (
          <img
            src={product.pr_small_url}
            alt={product.name || "Product"}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`
              w-full h-full object-contain
              transition-transform duration-300
              group-hover:scale-105
              ${outOfStock ? "opacity-40 grayscale" : ""}
            `}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <ImageOff size={32} strokeWidth={1.5} />
            <span className="text-[10px] mt-1">No Image</span>
          </div>
        )}

        {outOfStock && (
          <span
            className="
              absolute inset-x-0 bottom-2 z-10
              mx-auto w-fit
              bg-gray-900/80 text-white
              text-[10px] font-semibold uppercase
              px-2.5 py-1 rounded-full
            "
          >
            Out of stock
          </span>
        )}

        {/* ADD button */}
        <button
          type="button"
          disabled={outOfStock}
          onClick={(e) => {
            e.stopPropagation();
            onAdd?.(product);
          }}
          className={`
            absolute -bottom-3 right-3 z-20
            flex items-center gap-0.5
            bg-white
            border
            text-xs font-bold
            rounded-lg
            shadow-md
            transition-all duration-150
            ${
              outOfStock
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-pink-500 text-pink-600 hover:bg-pink-50 active:scale-95 cursor-pointer"
            }
          `}
          style={{ padding: "6px 14px",marginBottom:"15px" }}
        >
          {!outOfStock && <Plus size={14} strokeWidth={3} />}
          ADD
        </button>
      </div>

      {/* Info area */}
      <div className="flex flex-col px-3 pb-3 pt-5 flex-1">
        {/* Price row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="bg-green-700 text-white text-sm font-bold rounded"
            style={{ padding: "3px 8px" }}
          >
            ₹{price}
          </span>
          {mrp && (
            <span className="text-gray-400 text-sm line-through">
              ₹{mrp}
            </span>
          )}
        </div>

        {discountAmount ? (
          <>
            <span className="text-green-600 text-xs font-semibold mt-1">
              ₹{discountAmount} OFF
            </span>
            <div className="border-t border-dashed border-gray-200 my-2" />
          </>
        ) : (
          <div className="h-2" />
        )}

        {/* Name */}
        <h3
          className="
            text-[14px] font-semibold text-gray-900
            leading-snug line-clamp-3
          "
        >
          {product.name}
        </h3>

        {/* Pack */}
        {product.package_quantity && (
          <p className="text-[12px] text-gray-500 mt-2">
            1 pack ({Number(product.package_quantity)}
            {product.package_unit})
          </p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1.5 mt-auto pt-2">
            <span className="flex items-center justify-center bg-green-700 rounded px-1 py-0.5">
              <Star size={9} className="text-white fill-white" />
            </span>
            <span className="text-[12px] font-semibold text-gray-800">
              {product.rating}
            </span>
            {product.ratingCount && (
              <span className="text-[12px] text-gray-400">
                ({product.ratingCount})
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}