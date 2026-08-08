import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useRef } from "react";
import { ChevronRight, ChevronLeft, Plus, Star } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";

const products = [
  {
    id: 1,
    name: "Surf Excel Matic Top Load Detergent Liquid Refill | Tough Dried...",
    image:
      "https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/df221966-8c05-4ada-8ad9-350a3f4ecabf/Surf-Excel-Matic-Top-Load-Detergent-Liquid-Refill-Tough-Dried-Stain-Removal.jpg",
    pack: "1 pack (2 kg)",
    price: 319,
    mrp: 355,
    discount: 36,
    rating: 4.8,
    ratingCount: "15.9k",
    tag: null,
    badge: "NEW PACK",
  },
  {
    id: 2,
    name: "Ariel Power Gel Liquid Detergent for Top load washing machine",
    image:
       "https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/1aaed251-649d-4120-a1ac-d26cc2aceed8/Ariel-Power-Gel-Liquid-Detergent-for-Top-load-washing-machine.jpeg",
    pack: "1 pc (950 g)",
    price: 199,
    mrp: 205,
    discount: 6,
    rating: 4.8,
    ratingCount: "1.4k",
    tag: null,
    badge: null,
  },
  {
    id: 3,
    name: "Wheel Detergent Powder Power Benificial Go With Extra Pack",
    image:
       "https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-2400-2400,pr-true,f-auto,q-40,dpr-2/cms/product_variant/5483b6fe-08ad-42fe-8554-0d77e903ef64/Wheel-Detergent-Powder.jpeg",
    pack: "1 pack (4 kg)",
    price: 258,
    mrp: null,
    discount: null,
    rating: 4.7,
    ratingCount: "20.7k",
    tag: null,
    badge: null,
  },
  {
    id: 4,
    name: "Morelight Detergent Liquid | Pouch",
    image:
      "https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/ac3bdf47-15c2-40b5-ad36-46b70b578802/Morelight-Detergent-Liquid-Pouch.jpeg",
    pack: "1 pack (5 L)",
    price: 396,
    mrp: 599,
    discount: 203,
    rating: 5,
    ratingCount: "7.3k",
    tag: null,
    badge: "5L Mega Pack",
  },
  {
    id: 5,
    name: "Modern Kitchen Butter Murukku | Crunchy & Buttery",
    image:
      "https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-2250-2250,pr-true,f-auto,q-40,dpr-2/cms/product_variant/eb2e7f94-8357-4507-b1ea-f664cce86fcc/Bingo-Original-Style-Chilli-Sprinkled-Flat-Cut-Spicy-Potato-Chips-Pack-for-Snacks.jpeg",
    pack: "1 pack (5 kg)",
    price: 65,
    mrp: 75,
    discount: 10,
    rating: 4.9,
    ratingCount: "56.9k",
    tag: null,
    badge: "NEW PACK",
  },
  {
    id: 6,
    name: "Tide Naturals Lemon And Chandan Detergent Powder",
    image:
       "https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/5de40ef8-5270-47c4-8317-0826a5ba5672/Tide-Naturals-Lemon-And-Chandan-Detergent-Powder.jpg",
    pack: "1 pack (3 kg)",
    price: 260,
    mrp: null,
    discount: null,
    rating: 4.6,
    ratingCount: "3.4k",
    tag: "Super Saver Pack",
    badge: null,
  },
  {
    id: 7,
    name: "Tide Naturals Lemon And Chandan Detergent Powder",
    image:
       "https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/01c1fe49-4974-42ab-a384-60e41e64e57e/Pantene-Miracle-Rescue-Biotin-Strength-Conditioner.jpeg",
    pack: "1 pack (3 kg)",
    price: 260,
    mrp: null,
    discount: null,
    rating: 4.6,
    ratingCount: "3.4k",
    tag: "Super Saver Pack",
    badge: null,
  },
  {
    id: 8,
    name: "Tide Naturals Lemon And Chandan Detergent Powder",
    image:
       "https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-3125-3125,pr-true,f-auto,q-40,dpr-2/cms/product_variant/d7be0405-1cfe-4170-b935-0f17573770dc/Parachute-Coconut-Oil.jpeg",
    pack: "1 pack (3 kg)",
    price: 260,
    mrp: null,
    discount: null,
    rating: 4.6,
    ratingCount: "3.4k",
    tag: "Super Saver Pack",
    badge:null,
  },
];

export default function ProductCardSlider({ title = "All Items" }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className="w-full mt-8 mb-8">
      <div className="max-w-full mx-auto px-4 relative">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
          {title}
        </h2>

        <Swiper
          modules={[Navigation]}
          spaceBetween={14}
          slidesPerView={2.2}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
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
          ref={prevRef}
          aria-label="Previous"
          className="
            hidden lg:flex
            absolute top-[38%] -left-4
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
            absolute top-[38%] -right-4
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
      style={{marginBottom:"10px"}}
    >
      {/* Image area */}
      <div className="relative w-full h-full aspect-square bg-gray-50 p-3">
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
          className="
            w-full h-full object-cover
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
            px-3  rounded-sm
            shadow-sm
            hover:bg-pink-50
            active:scale-95
            transition-all duration-150
            cursor-pointer
          "
          style={{padding:"3.5px"}}
        >
          <Plus size={14} strokeWidth={3} />
          ADD
        </button>
      </div>

      {/* Info area */}
      <div className="flex flex-col px-3 pb-3 pt-2 flex-1">
        {/* Price row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.discount ? (
            <>
              <span className="bg-green-700 text-white text-xs font-bold px-1.5 py-0.5 rounded" style={{padding:"3px"}}>
                ₹{item.price}
              </span>
              <span className="text-gray-400 text-xs line-through">
                ₹{item.mrp}
              </span>
            </>
          ) : (
            <span className="bg-green-700 text-white text-xs font-bold px-1.5 py-0.5 rounded" style={{padding:"3px"}}>
              ₹{item.price}
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