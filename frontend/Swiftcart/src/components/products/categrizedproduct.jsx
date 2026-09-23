import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import "swiper/css";

import ProductCard, { ProductCardSkeleton } from "./categoriesproductcard";

/* ------------------------------------------------------------------ */
/*  API CONFIG                                                          */
/* ------------------------------------------------------------------ */

const API_BASE_URL = "http://127.0.0.1:8000/Products/products/";

/* ------------------------------------------------------------------ */
/*  API FETCHING — pulls every page, then groups products by category  */
/* ------------------------------------------------------------------ */

async function fetchAllProducts() {
  const firstRes = await fetch(`${API_BASE_URL}?page=1`);
  if (!firstRes.ok) throw new Error(`API error: ${firstRes.status}`);
  const firstData = await firstRes.json();

  const totalPages = firstData.total_pages || 1;
  let allResults = [...(firstData.results || [])];

  if (totalPages > 1) {
    const pageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    const pages = await Promise.all(
      pageNumbers.map((page) =>
        fetch(`${API_BASE_URL}?page=${page}`).then((r) => {
          if (!r.ok) throw new Error(`API error on page ${page}: ${r.status}`);
          return r.json();
        })
      )
    );
    pages.forEach((p) => {
      allResults = allResults.concat(p.results || []);
    });
  }

  return allResults;
}

function groupByCategory(products) {
  const map = new Map();

  products.forEach((product) => {
    const id = product.category ?? "uncategorized";
    const title = product.category_name || "Other";

    if (!map.has(id)) {
      map.set(id, { id, title, products: [] });
    }
    map.get(id).products.push(product);
  });

  return Array.from(map.values());
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE COMPONENT                                                */
/* ------------------------------------------------------------------ */

export default function CategorySections() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const products = await fetchAllProducts();
        if (!isMounted) return;
        setSections(groupByCategory(products));
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load products");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // ---- Loading: show skeleton rows instead of a blank spinner screen ----
  if (loading) {
    return (
      <div className="w-full bg-gray-50 py-4 min-h-screen">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonSlider key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex flex-col items-center justify-center gap-2 py-20 px-4 text-center">
        <p className="text-red-600 font-semibold">Couldn't load products</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center py-20">
        <p className="text-sm text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 py-4 min-h-screen">
      {sections.map((section) => (
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
/*  PRODUCT SLIDER ROW                                                 */
/* ------------------------------------------------------------------ */

function ProductSlider({ title, products }) {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateEdges = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <section className="max-w-[1440px] mx-auto px-0.5 lg:px-2">
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
                  badge={item.stock > 0 && item.stock < 5 ? "LOW STOCK" : null}
                />
              </SwiperSlide>
            ))}
          </Swiper>

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
              ${isBeginning ? "opacity-0 pointer-events-none" : "opacity-100 hover:scale-105"}
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
              ${isEnd ? "opacity-0 pointer-events-none" : "opacity-100 hover:scale-105"}
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
/*  SKELETON SLIDER ROW — shown while the API request is in flight     */
/* ------------------------------------------------------------------ */

function SkeletonSlider() {
  return (
    <section className="max-w-[1440px] mx-auto px-0.5 lg:px-2">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-40 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
        </div>

        <div className="flex gap-3 overflow-hidden -mx-1 px-1 py-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-[46%] xs:w-[30%] sm:w-[18%] md:w-[15%] lg:w-[13%] xl:w-[11%]"
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}