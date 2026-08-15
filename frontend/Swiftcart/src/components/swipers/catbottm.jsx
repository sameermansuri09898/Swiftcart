import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function CatSliderBottom() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active category from URL params
  const activeCategoryId = searchParams.get("category");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/Products/categories/");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 py-3 flex gap-4 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 animate-pulse shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-200 rounded-2xl" />
            <div className="w-12 h-3 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-6 bg-white border-b border-slate-100 py-2">
      <Swiper
        spaceBetween={8}
        slidesPerView={4.2}
        breakpoints={{
          480: { slidesPerView: 5.2, spaceBetween: 10 },
          640: { slidesPerView: 6.5, spaceBetween: 12 },
          768: { slidesPerView: 8.5, spaceBetween: 12 },
          1024: { slidesPerView: 11, spaceBetween: 14 },
          1280: { slidesPerView: 13, spaceBetween: 16 },
        }}
        className="!py-1"
      >
        {categories.map((item) => {
          const isActive = String(activeCategoryId) === String(item.id);

          return (
            <SwiperSlide key={item.id}>
              <button
                type="button"
                onClick={() => {
                  navigate(`/product?category=${item.id}&page=1&page_size=40`);
                }}
                className="group w-full flex flex-col items-center justify-center gap-1.5 py-1 outline-none select-none cursor-pointer"
              >
                <span
                  className={`
                    flex items-center justify-center
                    w-12 h-12 md:w-14 md:h-14
                    rounded-2xl border overflow-hidden
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-amber-50 border-amber-500 shadow-sm ring-2 ring-amber-400/20"
                        : "bg-slate-50 border-slate-200 group-hover:border-amber-400 group-hover:bg-amber-50/50"
                    }
                  `}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span
                      className={`text-base md:text-lg font-bold ${
                        isActive ? "text-amber-600" : "text-slate-600 group-hover:text-amber-600"
                      }`}
                    >
                      {item.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>

                <span
                  className={`
                    text-[11px] md:text-xs text-center
                    leading-tight font-medium
                    transition-colors duration-200 line-clamp-1 max-w-[70px] md:max-w-[84px]
                    ${
                      isActive
                        ? "text-amber-600 font-semibold"
                        : "text-slate-600 group-hover:text-amber-600"
                    }
                  `}
                  title={item.name}
                >
                  {item.name}
                </span>
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}