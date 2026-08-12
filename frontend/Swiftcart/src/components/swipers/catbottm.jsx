import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ShoppingBag,
  Soup,
  Home,
  Panda,
  Headphones,
  Shirt,
  Carrot,
  Smartphone,
} from "lucide-react";

export default function CatSliderBottom() {
  
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("All");

  const category_data = [
    { icon: <ShoppingBag />, name: "All", slug: "all" },
    { icon: <Soup />, name: "Cafe", slug: "cafe" },
    { icon: <Home />, name: "Home", slug: "home" },
    { icon: <Panda />, name: "Pets", slug: "pets" },
    { icon: <Headphones />, name: "Electronics", slug: "electronics" },
    { icon: <Shirt />, name: "Fashion", slug: "fashion" },
    { icon: <Carrot />, name: "Grocery", slug: "grocery" },
    { icon: <Smartphone />, name: "Mobiles", slug: "mobiles" },
  ];

  return (
    <div className="w-full bg-white border-b border-gray-100 mt-3 mb-3 md:mt-4 md:mb-4">
      <Swiper
        spaceBetween={8}
        slidesOffsetBefore={0}
        slidesOffsetAfter={0}
        breakpoints={{
          320: { slidesPerView: 4.2, spaceBetween: 4 },
          480: { slidesPerView: 5.2, spaceBetween: 8 },
          768: { slidesPerView: 7, spaceBetween: 10 },
          1024: { slidesPerView: 9, spaceBetween: 12 },
          1280: { slidesPerView: 15, spaceBetween: 14 },
        }}
        className="!py-3"
      >
        {category_data.map((item, index) => {
          const isActive = activeCategory === item.name;

          return (
            <SwiperSlide key={index} style={{ width: "auto" }}>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory(item.name);
                  navigate(`/category/${item.slug}`);
                }}
                className="group flex flex-col items-center justify-center gap-1.5 px-1 outline-none select-none cursor-pointer"
              >
                <span
                  className={`
                    flex items-center justify-center
                    w-12 h-12 md:w-14 md:h-14
                    rounded-2xl border
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-violet-50 border-violet-500 text-violet-600 shadow-sm"
                        : "bg-gray-50 border-gray-100 text-gray-500 group-hover:border-violet-200 group-hover:text-violet-500"
                    }
                  `}
                >
                  {React.cloneElement(item.icon, {
                    size: 22,
                    strokeWidth: isActive ? 2.2 : 1.8,
                  })}
                </span>

                <span
                  className={`
                    text-[11px] md:text-xs
                    font-medium whitespace-nowrap
                    transition-colors duration-200
                    ${
                      isActive
                        ? "text-violet-600 font-semibold"
                        : "text-gray-600 group-hover:text-violet-500"
                    }
                  `}
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