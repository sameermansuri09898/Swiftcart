import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronRight, ChevronLeft, Plus, Star, ImageOff } from "lucide-react";

import "swiper/css";

/* ------------------------------------------------------------------ */
/*  SAMPLE DATA — matches your API response structure                  */
/* ------------------------------------------------------------------ */

function buildProducts(label, count) {
  const imgs = [
    "https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/79413751-6c51-44a4-b85a-280eb50464bf/Kurkure-Namkeen-Masala-Munch-Crunchy-Snacks.jpg",
  ];

  return Array.from({ length: count }, (_, i) => {
    const mrp = 150 + i * 25;
    const finalPrice = i % 3 !== 0 ? Math.round(mrp * 0.85) : mrp;
    const isAvailable = i !== 2; // sample 1 out-of-stock item

    return {
      uuid: `${label.toLowerCase()}-${i + 1}`,
      name: `${label} item ${i + 1} | Daily fresh & quality product`,
      pr_small_url: imgs[0],
      price_inr: mrp.toFixed(2),
      final_price: finalPrice,
      package_quantity: `${(i % 5) + 1}.00`,
      package_unit: i % 2 === 0 ? "kg" : "g",
      stock: isAvailable ? (i % 2 === 0 ? 3 : 20) : 0,
      is_available: isAvailable,
      rating: (4 + (i % 10) / 10).toFixed(1),
      ratingCount: `${((i + 1) * 1.2).toFixed(1)}k`,
    };
  });
}

const categorySections = [
  {
    id: "detergents",
    title: "Detergents, Dishwash & more",
    products: buildProducts("Detergent", 12),
  },
  {
    id: "snacks",
    title: "Chips, Namkeen & Snacks",
    products: buildProducts("Snacks", 12),
  },
  {
    id: "beverages",
    title: "Cold Drinks & Juices",
    products: buildProducts("Beverage", 12),
  },
  {
    id: "personal-care",
    title: "Bath, Body & Personal Care",
    products: buildProducts("Personal Care", 12),
  },
  {
    id: "dairy",
    title: "Dairy, Bread & Eggs",
    products: buildProducts("Dairy", 12),
  },
];

/* ------------------------------------------------------------------ */
/*  MAIN PAGE COMPONENT                                                */
/* ------------------------------------------------------------------ */

export default function CategorySections() {
  const handleAddToCart = (product) => {
    console.log("Added to cart:", product.name);
  };

  return (
    <div className="w-full bg-gray-50 py-4 min-h-screen">
      {categorySections.map((section) => (
        <ProductSlider
          key={section.id}
          title={section.title}
          products={section.products}
          onAdd={handleAddToCart}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PRODUCT SLIDER ROW                                                 */
/* ------------------------------------------------------------------ */

function ProductSlider({ title, products, onAdd }) {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateEdges = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <section className="w-full my-6">
      <div className="max-w-full mx-auto px-4 sm:px-6 relative">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
            {title}
          </h2>
          <a
            href="#"
            className="text-xs sm:text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
          >
            See all
          </a>
        </div>

        {/* Slider Container with padding to avoid shadow clipping */}
        <div className="relative px-1 -mx-1 overflow-hidden sm:overflow-visible">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              updateEdges(swiper);
            }}
            onSlideChange={updateEdges}
            onReachBeginning={updateEdges}
            onReachEnd={updateEdges}
            onResize={updateEdges}
            spaceBetween={12}
            slidesPerView={2}
            breakpoints={{
              480: { slidesPerView: 4.5, spaceBetween: 12 },
              640: { slidesPerView: 5.5, spaceBetween: 14 },
              768: { slidesPerView: 6.2, spaceBetween: 16 },
              1024: { slidesPerView: 7.2, spaceBetween: 16 },
              1280: { slidesPerView: 9, spaceBetween: 16 },
            }}
            className="w-full !py-3 !px-1"
          >
            {products.map((item) => (
              <SwiperSlide key={item.uuid} className="h-auto">
                <ProductCard
                  product={item}
                  badge={
                    item.stock > 0 && item.stock < 5 ? "LOW STOCK" : null
                  }
                  onAdd={onAdd}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Controls */}
          <button
            type="button"
            aria-label="Previous"
            disabled={isBeginning}
            onClick={() => swiperRef.current?.slidePrev()}
            className={`
              hidden md:flex
              absolute top-1/2 -left-4 -translate-y-1/2
              w-9 h-9 items-center justify-center
              rounded-full bg-white shadow-lg border border-gray-200
              text-gray-700 hover:text-violet-600 hover:border-violet-300
              transition-all duration-200 z-20 cursor-pointer
              ${
                isBeginning
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100 hover:scale-105"
              }
            `}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            aria-label="Next"
            disabled={isEnd}
            onClick={() => swiperRef.current?.slideNext()}
            className={`
              hidden md:flex
              absolute top-1/2 -right-4 -translate-y-1/2
              w-9 h-9 items-center justify-center
              rounded-full bg-gray-900 shadow-lg
              text-white hover:bg-violet-600
              transition-all duration-200 z-20 cursor-pointer
              ${
                isEnd
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100 hover:scale-105"
              }
            `}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  DYNAMIC PRODUCT CARD                                                */
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

function ProductCard({ product, onAdd, badge }) {
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
        overflow-visible select-none
      "
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square rounded-t-2xl overflow-hidden bg-gray-50 p-3 flex items-center justify-center">
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
            <ImageOff size={28} strokeWidth={1.5} />
            <span className="text-[10px] mt-1">No Image</span>
          </div>
        )}

        {outOfStock && (
          <span
            className="
              absolute inset-x-0 bottom-2 z-10
              mx-auto w-fit
              bg-gray-900/80 text-white
              text-[9px] font-semibold uppercase
              px-2 py-0.5 rounded-full
            "
          >
            Out of stock
          </span>
        )}

        {/* Floating ADD Button */}
        <button
          type="button"
          disabled={outOfStock}
          onClick={(e) => {
            e.stopPropagation();
            onAdd?.(product);
          }}
          className={`
            absolute -bottom-3 right-2.5 z-20
            flex items-center gap-0.5
            bg-white border
            text-xs font-bold
            rounded-lg shadow-md
            transition-all duration-150
            ${
              outOfStock
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-pink-500 text-pink-600 hover:bg-pink-50 active:scale-95 cursor-pointer"
            }
          `}
          style={{ padding: "5px 12px" ,marginBottom:"15px"}}
        >
          {!outOfStock && <Plus size={14} strokeWidth={3} />}
          ADD
        </button>
      </div>

      {/* Info Container */}
      <div className="flex flex-col px-3 pb-3 pt-4 flex-1 justify-between">
        <div>
          {/* Price Row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="bg-green-700 text-white text-xs font-bold rounded"
              style={{ padding: "2px 6px" }}
            >
              ₹{price}
            </span>
            {mrp && (
              <span className="text-gray-400 text-xs line-through">
                ₹{mrp}
              </span>
            )}
          </div>

          {/* Discount / Divider */}
          {discountAmount ? (
            <>
              <span className="block text-green-600 text-[11px] font-semibold mt-1">
                ₹{discountAmount} OFF
              </span>
              <div className="border-t border-dashed border-gray-200 my-1.5" />
            </>
          ) : (
            <div className="h-2" />
          )}

          {/* Name */}
          <h3
            className="
              text-[13px] font-semibold text-gray-900
              leading-snug line-clamp-2
            "
          >
            {product.name}
          </h3>

          {/* Pack */}
          {product.package_quantity && (
            <p className="text-[11px] text-gray-500 mt-1">
              1 pack ({Number(product.package_quantity)}
              {product.package_unit})
            </p>
          )}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mt-2 pt-1">
            <span className="flex items-center justify-center bg-green-700 rounded px-1 py-0.5">
              <Star size={9} className="text-white fill-white" />
            </span>
            <span className="text-[11px] font-semibold text-gray-800">
              {product.rating}
            </span>
            {product.ratingCount && (
              <span className="text-[11px] text-gray-400">
                ({product.ratingCount})
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}