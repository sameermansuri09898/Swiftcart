import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import {
  ShoppingBag,
  Soup,
  Home,
  Dog,
  Headphones,
  Shirt,
  Carrot,
  Smartphone,
} from "lucide-react";

export default function CatSliderBottom() {
  const [activeCategory, setActiveCategory] = useState("All");

  const category_data = [
    { icon: <ShoppingBag />, name: "All" },
    { icon: <Soup />, name: "Cafe" },
    { icon: <Home />, name: "Home" },
    { icon: <Dog />, name: "Pets" },
    { icon: <Headphones />, name: "Electronics" },
    { icon: <Shirt />, name: "Fashion" },
    { icon: <Carrot />, name: "Grocery" },
    { icon: <Smartphone />, name: "Mobiles" },
  ];

  return (
    <nav className="w-full bg-white border-y border-gray-100 my-4 shadow-sm overflow-hidden">
      {/* Max-width wrapper prevents page width overflow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Swiper
          spaceBetween={12}
          slidesPerView="auto"
          freeMode={true}
          grabCursor={true}
          className="w-full py-2.5"
        >
          {category_data.map((item, index) => {
            const isActive = activeCategory === item.name;

            return (
              <SwiperSlide key={index} className="!w-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveCategory(item.name)}
                  className={`
                    relative flex items-center gap-2 px-3.5 py-2 rounded-xl
                    transition-all duration-200 outline-none select-none text-sm sm:text-base
                    ${
                      isActive
                        ? "text-violet-600 bg-violet-50/80 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium"
                    }
                  `}
                >
                  <span className="shrink-0">
                    {React.cloneElement(item.icon, {
                      size: 19,
                      strokeWidth: isActive ? 2.2 : 1.8,
                    })}
                  </span>

                  <span className="whitespace-nowrap md:text-lg">{item.name}</span>

                  {/* Clean Bottom Indicator inside button boundaries */}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full bg-violet-600" />
                  )}
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </nav>
  );
}