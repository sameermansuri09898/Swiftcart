import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiMapPin,
  FiNavigation,
  FiX,
  FiLogOut,
  FiChevronDown,
  FiGrid,
  FiMenu,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SearchBar from "./searchbar.jsx";
import locationImg from "../../assets/location.png";
import { useCart } from "../services/CartContext.jsx";

export default function Navbar() {
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useState("Select Location");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const navigate = useNavigate();
  const { cartCount, openCart } = useCart();

  // Check authentication & role state
  const checkAuth = () => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role"); // e.g., 'driver', 'seller', 'customer'
    setIsLoggedIn(!!token);
    setUserRole(role || "customer");
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Role-Based Navigation Handler
  const handleAccountNavigation = () => {
    if (!isLoggedIn) {
      navigate("/authentications");
      return;
    }

    switch (userRole) {
      case "driver":
      case "rider":
        navigate("/rider/dashboard");
        break;
      case "seller":
        navigate("/seller/dashboard");
        break;
      case "customer":
      default:
        navigate("/UserDashboard");
        break;
    }
  };

  // Logout Handler
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
      localStorage.removeItem("role");
      setIsLoggedIn(false);
      setUserRole(null);
      setMobileMenuOpen(false);
      navigate("/authentications");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-20 flex items-center justify-between gap-4 md:gap-8">
          
          {/* Brand Logo & Location Indicator */}
          <div className="flex items-center gap-6 lg:gap-8 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-left focus:outline-none flex items-center gap-2 group"
            >
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-amber-500 transition-colors">
                Swift<span className="text-amber-500 group-hover:text-slate-900">cart</span>
              </span>
            </button>

            {/* Desktop Location Selector */}
            <div className="hidden md:flex items-center pl-6 border-l border-slate-200">
              <button
                type="button"
                onClick={() => setOpenLocationModal(true)}
                className="flex flex-col items-start text-left group focus:outline-none"
              >
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 group-hover:text-amber-600">
                  ⚡ Express Delivery
                </span>
                <div className="flex items-center gap-1 text-sm font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                  <FiMapPin className="text-amber-500 shrink-0" />
                  <span className="truncate max-w-[140px] lg:max-w-[180px]">
                    {location}
                  </span>
                  <FiChevronDown className="text-slate-400 text-xs" />
                </div>
              </button>
            </div>
          </div>

          {/* Central Search Bar (Desktop) */}
          <div className="hidden lg:block flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            
            {/* User Account Button */}
            <button
              type="button"
              onClick={handleAccountNavigation}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-amber-600 transition-all border border-transparent hover:border-slate-200"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                <FiUser size={18} />
              </div>
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-xs text-slate-400 font-medium">
                  {isLoggedIn ? "Welcome" : "Account"}
                </span>
                <span className="text-xs font-bold text-slate-800 capitalize">
                  {isLoggedIn ? (userRole ? `${userRole}` : "Dashboard") : "Sign In"}
                </span>
              </div>
            </button>

            {/* Shopping Cart Trigger */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <div className="relative">
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold leading-none border-2 border-amber-500">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-sm font-bold">Cart</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Location Bar */}
        <div className="lg:hidden px-4 pb-3 pt-1 space-y-2.5 border-t border-slate-100 bg-slate-50/50">
          <div className="w-full">
            <SearchBar />
          </div>

          <button
            type="button"
            onClick={() => setOpenLocationModal(true)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-amber-500 transition-colors"
          >
            <div className="flex items-center gap-1.5 truncate">
              <FiMapPin className="text-amber-500 shrink-0" />
              <span className="truncate">Deliver to: <strong className="text-slate-900">{location}</strong></span>
            </div>
            <span className="text-amber-600 font-semibold text-[11px]">Change</span>
          </button>
        </div>

        {/* Mobile Slide-down Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
            <button
              onClick={() => {
                handleAccountNavigation();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold text-sm"
            >
              <FiGrid className="text-amber-500" size={18} />
              <span>Dashboard ({userRole || 'Guest'})</span>
            </button>

            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 text-rose-600 font-semibold text-sm transition-colors"
              >
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Location Selection Modal */}
      {openLocationModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
          <div className="bg-white w-full md:w-[480px] rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl transition-all">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base md:text-lg font-bold text-slate-900">
                Change Delivery Address
              </h2>
              <button
                type="button"
                onClick={() => setOpenLocationModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              {/* Location Options */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setLocation("Current Location");
                    setOpenLocationModal(false);
                  }}
                  className="w-full bg-white border border-slate-200 hover:border-amber-500 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:shadow transition-all group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white text-amber-600 transition-colors">
                      <FiNavigation size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Use Current Location
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Detect using GPS for fast delivery
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform">
                    Detect →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpenLocationModal(false);
                    navigate('/address');
                  }}
                  className="w-full bg-white border border-slate-200 hover:border-amber-500 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:shadow transition-all group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white text-slate-600 transition-colors">
                      <FiMapPin size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Select Saved Address
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose or add a new delivery address
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform">
                    Manage →
                  </span>
                </button>
              </div>

              {/* Graphic Illustration */}
              <div className="flex justify-center pt-2">
                <img
                  src={locationImg}
                  alt="Location illustration"
                  className="w-36 md:w-40 object-contain opacity-90"
                />
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}