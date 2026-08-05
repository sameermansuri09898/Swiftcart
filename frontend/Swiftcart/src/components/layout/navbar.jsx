import { useState } from "react";
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiMapPin,
  FiNavigation,
  FiX,
} from "react-icons/fi";
import SearchBar from "./searchbar.jsx";

import locationImg from "../../assets/location.png";
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("Select Location");

  const saveLocation = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 mb-10">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-20 flex items-center justify-between gap-5">

          {/* Left */}
          <div className="flex items-center gap-5 shrink-0">

            <h1 className="text-4xl font-bold text-violet-700 tracking-tight">
              Swiftcart
            </h1>

            <div className="hidden md:block md:flex flex-col items-center gap-1">
              <p className="font-bold text-[21px] text-gray-900">
                ⚡Delivery in minutes*
              </p>

              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1 text-gray-600 hover:text-violet-700 font-medium"
              >
                <FiMapPin />
                {location}


              </button>
            </div>
          </div>

          {/* Search */}

          <SearchBar />

          {/* Right */}

          <div className="flex items-center gap-8 shrink-0">

            <button className="hidden md:flex flex-col items-center">
              <FiUser size={28} />
              <span className="text-sm">Login</span>
            </button>

            <button className="flex flex-col items-center">
              <FiShoppingCart size={28} />
              <span className="text-sm">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Search */}

        <div className="md:hidden px-4 pb-3">
          <div className="group flex items-center w-full h-14 rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-violet-400 focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-100">
            <div className="flex items-center justify-center w-14 h-full">
              <FiSearch className="text-[22px] text-gray-500" />
            </div>

            <input
              type="text"
              placeholder='Search for "cheese slices"'
              className="flex-1 h-full pr-5 bg-transparent text-[16px] text-gray-800 placeholder:text-gray-500 outline-none"
            />
          </div>

          <button
            onClick={() => setOpen(true)}
            className="mt-3 flex items-center gap-2 text-sm font-semibold"
          >
            <FiMapPin />
            {location}
          </button>
        </div>
      </header>

      {/* Popup */}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">

          {/* Modal */}
          <div
            className="
      bg-white 
      w-full
      md:w-[520px]
      md:max-w-lg
      rounded-t-3xl
      md:rounded-3xl
      overflow-hidden
      shadow-2xl
      animate-in
      slide-in-from-bottom
      duration-300
    "
          >

            {/* Header */}
            <div className="flex items-center justify-between px-5 md:px-6 py-5 border-b">

              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Your Location
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="
          w-9 h-9
          flex items-center justify-center
          rounded-full
          hover:bg-gray-100
          text-gray-500
        "
              >
                <FiX size={22} />
              </button>

            </div>


            {/* Body */}

            <div className="p-5">


              {/* Search Box */}

              <div
                className="
          flex items-center
          h-14
          rounded-xl
          border
          border-gray-200
          bg-gray-50
          px-4
          focus-within:border-violet-500
          focus-within:ring-4
          focus-within:ring-violet-100
        "
              >

                <FiSearch
                  className="text-gray-500 text-xl shrink-0"
                />

                <input
                  placeholder="Search a new address"
                  className="
            ml-3
            flex-1
            bg-transparent
            outline-none
            text-sm
            md:text-base
          "
                />

              </div>



              {/* Current Location Card */}

              <div className="mt-5 bg-gray-50 rounded-2xl p-4">


                <div
                  className="
            bg-white
            border
            rounded-2xl
            p-4
            flex
            items-center
            justify-between
            gap-4
          "
                >

                  <div className="flex items-center gap-3">


                    <div
                      className="
                w-12 h-12
                rounded-full
                bg-pink-100
                flex
                items-center
                justify-center
                shrink-0
              "
                    >

                      <FiNavigation
                        size={22}
                        className="text-pink-600"
                      />

                    </div>



                    <div>

                      <h3 className="
                font-semibold
                text-pink-600
                text-sm
                md:text-base
              ">
                        Use My Current Location
                      </h3>


                      <p className="
                text-xs
                md:text-sm
                text-gray-500
                mt-1
              ">
                        Enable location for better delivery experience
                      </p>


                    </div>


                  </div>



                  <button
                    className="
              border
              border-pink-500
              text-pink-600
              rounded-lg
              px-4
              py-2
              text-sm
              font-semibold
              hover:bg-pink-50
              transition
            "
                  >
                    Enable
                  </button>


                </div>


                {/* Image */}

                <div className="flex justify-center mt-8">

                  <img
                    src={locationImg}
                    alt="location"
                    className="
              w-48
              md:w-64
              object-contain
            "
                  />

                </div>


              </div>


            </div>

          </div>

        </div>
      )}
    </>
  );
}