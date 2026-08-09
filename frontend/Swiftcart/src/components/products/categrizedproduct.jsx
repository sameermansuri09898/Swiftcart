import { Swiper, SwiperSlide } from "swiper/react";
import { useRef, useState } from "react";
import { ChevronRight, ChevronLeft, Plus, Star } from "lucide-react";

import "swiper/css";

/* ------------------------------------------------------------------ */
/*  DATA — each category has its own array of 10+ products.            */
/*  Replace the `image` urls with your real product image urls.        */
/* ------------------------------------------------------------------ */

const categorySections = [
  {
    id: "detergents",
    title: "Detergents, Dishwash & more",
    products: buildProducts("Detergent", 10),
  },
  {
    id: "snacks",
    title: "Chips, Namkeen & Snacks",
    products: buildProducts("Snacks", 12),
  },
  {
    id: "beverages",
    title: "Cold Drinks & Juices",
    products: buildProducts("Beverage", 11),
  },
  {
    id: "personal-care",
    title: "Bath, Body & Personal Care",
    products: buildProducts("Personal Care", 10),
  },
  {
    id: "dairy",
    title: "Dairy, Bread & Eggs",
    products: buildProducts("Dairy", 10),
  },
];

/* dummy data generator so every category has 10+ items.
   swap `image` for real product photos in production. */
function buildProducts(label, count) {
  const imgs = [
    "https://images.unsplash.com/photo-1610557892470-55d587188c1e?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583947582880-88c73f8e8d2f?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&auto=format&fit=crop",
  ];

  return Array.from({ length: count }, (_, i) => {
    const hasDiscount = i % 3 !== 0;
    const mrp = 150 + i * 25;
    const discount = hasDiscount ? Math.round(mrp * 0.15) : null;

    return {
      id: `${label}-${i + 1}`,
      name: `${label} product ${i + 1} | premium pack for everyday use`,
      image: imgs[i % imgs.length],
      pack: `1 pack (${(i % 5) + 1} ${i % 2 === 0 ? "kg" : "pc"})`,
      price: hasDiscount ? mrp - discount : mrp,
      mrp: hasDiscount ? mrp : null,
      discount,
      rating: (4 + (i % 10) / 10).toFixed(1),
      ratingCount: `${(i + 1) * 1.2}k`,
      tag: i % 4 === 0 ? "Super Saver Pack" : null,
      badge: i % 5 === 0 ? "NEW PACK" : null,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  PAGE — stacks a slider per category, exactly like the Zepto home   */
/* ------------------------------------------------------------------ */

export default function CategorySections() {
  return (
    <div className="w-full">
      {categorySections.map((section) => (
        <ProductSlider
          key={section.id}
          title={section.title}
          products={section.products}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  REUSABLE SLIDER — one category row                                 */
/* ------------------------------------------------------------------ */

function ProductSlider({ title, products }) {
  // hold the actual Swiper instance instead of DOM refs — calling
  // slideNext()/slidePrev() directly on it is far more reliable than
  // wiring prevEl/nextEl, which breaks on re-renders (the "sometimes
  // works, sometimes doesn't" bug you were seeing).
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateEdges = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <section className="w-full mt-8 mb-8">
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            {title}
          </h2>
          <a
            href="#"
            className="text-xs md:text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            See all
          </a>
        </div>

        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateEdges(swiper);
          }}
          onSlideChange={updateEdges}
          onReachBeginning={updateEdges}
          onReachEnd={updateEdges}
          onResize={updateEdges}
          spaceBetween={14}
          slidesPerView={2.2}
          breakpoints={{
            480: { slidesPerView: 3.6, spaceBetween: 14 },
            640: { slidesPerView: 4.3, spaceBetween: 16 },
            768: { slidesPerView: 5.2, spaceBetween: 16 },
            1024: { slidesPerView: 6.2, spaceBetween: 18 },
            1280: { slidesPerView: 8, spaceBetween: 18 },
          }}
          className="w-full !py-2"
        >
          {products.map((item) => (
            <SwiperSlide key={item.id}>
              <ProductCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Prev arrow */}
        <button
          type="button"
          aria-label="Previous"
          disabled={isBeginning}
          onClick={() => swiperRef.current?.slidePrev()}
          className={`
            hidden lg:flex
            absolute top-[58%] -left-4
            w-9 h-9 items-center justify-center
            rounded-full bg-white shadow-md border border-gray-200
            text-gray-700 hover:text-violet-600 hover:border-violet-300
            transition-all duration-200
            z-10
            ${isBeginning ? "opacity-0 pointer-events-none" : "opacity-100"}
          `}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Next arrow */}
        <button
          type="button"
          aria-label="Next"
          disabled={isEnd}
          onClick={() => swiperRef.current?.slideNext()}
          className={`
            hidden lg:flex
            absolute top-[58%] -right-4
            w-9 h-9 items-center justify-center
            rounded-full bg-black shadow-md
            text-white hover:bg-violet-600
            transition-all duration-200
            z-10
            ${isEnd ? "opacity-0 pointer-events-none" : "opacity-100"}
          `}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PRODUCT CARD                                                       */
/* ------------------------------------------------------------------ */

function ProductCard({ item }) {
  return (
    <div
      className="
        group flex flex-col
        w-full h-full
        bg-white rounded-2xl
        border border-gray-100
        hover:shadow-lg hover:border-gray-200
        transition-all duration-300
        cursor-pointer
        overflow-hidden
      "
    >
      {/* Image area */}
      <div className="relative w-full aspect-square bg-gray-50 p-3">
        {item.badge && (
          <span
            className="
              absolute top-2 left-2 z-10
              bg-blue-600 text-white
              text-[9px] font-bold uppercase
              px-2 py-0.5 rounded
              tracking-wide
            "
          >
            {item.badge}
          </span>
        )}

        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="
            w-full h-full object-cover rounded-xl
            transition-transform duration-300
            group-hover:scale-105
          "
        />

        {/* ADD button */}
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="
            absolute bottom-2 right-2 z-10
            flex items-center gap-0.5
            bg-white
            border border-pink-500
            text-pink-600 text-xs font-bold
            rounded-md
            shadow-sm
            hover:bg-pink-50
            active:scale-95
            transition-all duration-150
            cursor-pointer
          "
          style={{ padding: "5px 10px" }}
        >
          <Plus size={14} strokeWidth={3} />
          ADD
        </button>
      </div>

      {/* Info area */}
      <div className="flex flex-col px-3 pb-3 pt-2 flex-1">
        {/* Price row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="bg-green-700 text-white text-xs font-bold rounded"
            style={{ padding: "3px 6px" }}
          >
            ₹{item.price}
          </span>
          {item.mrp && (
            <span className="text-gray-400 text-xs line-through">
              ₹{item.mrp}
            </span>
          )}
        </div>

        {item.discount && (
          <>
            <span className="text-red-500 text-[11px] font-semibold mt-1">
              ₹{item.discount} OFF
            </span>
            <div className="border-t border-dashed border-gray-200 my-1.5" />
          </>
        )}

        {/* Name */}
        <h3
          className="
            text-[13px] font-semibold text-gray-900
            leading-snug line-clamp-2
            mt-1
          "
        >
          {item.name}
        </h3>

        {/* Pack */}
        <p className="text-[11px] text-gray-500 mt-1.5">{item.pack}</p>

        {/* Super saver tag */}
        {item.tag && (
          <span
            className="
              inline-block w-fit
              bg-sky-50 text-sky-600
              text-[10px] font-medium
              px-2 py-0.5 rounded mt-1.5
            "
          >
            {item.tag}
          </span>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <span className="flex items-center justify-center bg-green-700 rounded px-1 py-0.5">
            <Star size={9} className="text-white fill-white" />
          </span>
          <span className="text-[11px] font-semibold text-gray-800">
            {item.rating}
          </span>
          <span className="text-[11px] text-gray-400">
            ({item.ratingCount})
          </span>
        </div>
      </div>
    </div>
  );
}