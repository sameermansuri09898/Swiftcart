import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiMapPin,
  FiNavigation,
  FiX,
  FiLogOut,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SearchBar from "./searchbar.jsx";
import locationImg from "../../assets/location.png";
import { useCart } from "../services/CartContext.jsx";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("Select Location");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { cartCount, openCart } = useCart();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      setIsLoggedIn(!!token);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");

    try {
      await fetch("http://127.0.0.1:8000/account/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsLoggedIn(false);
      navigate("/authentications");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-20 flex items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-6 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-left focus:outline-none"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-amber-500 tracking-tight font-serif">
                Swiftcart
              </h1>
            </button>

            <div className="hidden md:flex flex-col items-start justify-center">
              <p className="font-bold text-base lg:text-lg text-slate-900 leading-tight">
                ⚡ Delivery in minutes*
              </p>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-1 text-xs lg:text-sm text-slate-600 hover:text-amber-600 font-medium transition-colors"
              >
                <FiMapPin className="text-amber-500 shrink-0" />
                <span className="truncate max-w-[150px]">{location}</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:block flex-1 max-w-2xl">
            <SearchBar />
          </div>

          <div className="flex items-center gap-6 md:gap-8 shrink-0">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-rose-600 transition-colors"
              >
                <FiLogOut className="w-6 h-6 md:w-7 md:h-7 text-rose-500" />
                <span className="text-xs font-semibold">Logout</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/authentications")}
                className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-amber-600 transition-colors"
              >
                <FiUser className="w-6 h-6 md:w-7 md:h-7" />
                <span className="text-xs font-semibold">Login</span>
              </button>
            )}

            {/* Cart trigger — opens CartDrawer, shows live count */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-amber-600 transition-colors relative"
            >
              <span className="relative">
                <FiShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </span>
              <span className="text-xs font-semibold">Cart</span>
            </button>
          </div>
        </div>

        <div className="lg:hidden px-4 pb-3 pt-1 space-y-2">
          <div className="group flex items-center w-full h-11 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-amber-500 transition-all">
            <div className="flex items-center justify-center pl-3.5 pr-2">
              <FiSearch className="text-lg text-slate-400" />
            </div>
            <input
              type="text"
              placeholder='Search "milk, bread, snacks"'
              className="flex-1 h-full pr-4 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-amber-600"
          >
            <FiMapPin className="text-amber-500" />
            <span>{location}</span>
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white w-full md:w-[500px] rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg md:text-xl font-bold text-slate-900">
                Select Delivery Location
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center h-12 rounded-xl border border-slate-200 bg-slate-50 px-3.5 focus-within:border-amber-500 focus-within:bg-white transition-all">
                <FiSearch className="text-slate-400 text-lg shrink-0" />
                <input
                  type="text"
                  placeholder="Search a new address or pincode"
                  className="ml-2.5 flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div className="mt-5 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <FiNavigation size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        Use My Current Location
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Enable location for faster checkout
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setLocation("Current Location");
                      setOpen(false);
                    }}
                    className="border border-amber-500 text-amber-600 hover:bg-amber-50 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors shrink-0"
                  >
                    Enable
                  </button>
                </div>

                {/* form add settup */}

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <FiNavigation size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        Set Formal Location
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Use Formal location for faster checkout
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setLocation("Current Location");
                      setOpen(false);
                      navigate('/address')
                    }}
                    className="border border-amber-500 text-amber-600 hover:bg-amber-50 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors shrink-0"
                  >
                    Set-Now
                  </button>
                </div>

                <div className="flex justify-center mt-6">
                  <img
                    src={locationImg}
                    alt="location visual"
                    className="w-40 md:w-48 object-contain"
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