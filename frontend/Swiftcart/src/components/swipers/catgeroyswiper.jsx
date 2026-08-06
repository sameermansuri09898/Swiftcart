import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useRef } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";

const categories = [
  {
    id: 1,
    name: "Fruits & Vegetables",
    image:
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Dairy, Bread & Eggs",
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Atta, Rice, Oil & Dals",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Meat, Fish & Eggs",
    image:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Masala & Dry Fruits",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Breakfast & Sauces",
    image:
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "Packaged Food",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=300&auto=format&fit=crop",
  },
  {
    id: 8,
    name: "Zepto Cafe",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop",
  },
  {
    id: 9,
    name: "Tea, Coffee & More",
    image:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&auto=format&fit=crop",
  },
  {
    id: 10,
    name: "Ice Creams & More",
    image:
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&auto=format&fit=crop",
  },
  {
    id: 11,
    name: "Frozen Food",
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop",
  },
];

export default function ImageCategory() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (

    <section className="hidden md:block w-full mt-8 mb-8">
      <div className="max-w-7xl mx-auto px-4 relative">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={4}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          breakpoints={{
            640: { slidesPerView: 5 },
            768: { slidesPerView: 6 },
            1024: { slidesPerView: 8 },
            1280: { slidesPerView: 11 },
          }}
          className="w-full !py-2"
        >
          {categories.map((item) => (
            <SwiperSlide key={item.id}>
              <button
                type="button"
                className="group flex flex-col items-center w-full outline-none"
              >
                <div
                  className="
                    w-full aspect-square
                    rounded-2xl overflow-hidden
                    bg-gray-50 border border-gray-100
                    transition-all duration-300
                    group-hover:shadow-md group-hover:border-violet-200
                    cursor-pointer
                  "
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="
                      w-full h-full object-cover
                      transition-transform duration-300
                      group-hover:scale-105
                    "
                  />
                </div>

                <h3
                  className="
                    mt-3 text-sm font-semibold text-gray-800
                    text-center leading-snug
                    line-clamp-2
                  "
                >
                  {item.name}
                </h3>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Prev arrow */}
        <button
          ref={prevRef}
          aria-label="Previous"
          className="
            hidden lg:flex
            absolute top-[calc(50%-14px)] -left-4
            w-9 h-9 items-center justify-center
            rounded-full bg-white shadow-md border border-gray-200
            text-gray-700 hover:text-violet-600 hover:border-violet-300
            transition-all duration-200
            swiper-button-disabled:opacity-0 swiper-button-disabled:pointer-events-none
            z-10
          "
        >
          <ChevronLeft size={18} />
        </button>

        {/* Next arrow */}
        <button
          ref={nextRef}
          aria-label="Next"
          className="
            hidden lg:flex
            absolute top-[calc(50%-14px)] -right-4
            w-9 h-9 items-center justify-center
            rounded-full bg-black shadow-md
            text-white hover:bg-violet-600
            transition-all duration-200
            swiper-button-disabled:opacity-0 swiper-button-disabled:pointer-events-none
            z-10
          "
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}