import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package,
  Bell,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  User,
  Search,
} from "lucide-react";
import AddressSection from "./Address";

const LOGOUT_API_URL = "http://127.0.0.1:8000/account/logout/";
const PROFILE_API_URL = "http://127.0.0.1:8000/account/Profile/";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("addresses");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Profile data states
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // ── FETCH USER PROFILE ──────────────────────────────────────────────
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken =
          localStorage.getItem("token") || localStorage.getItem("access_token");

        if (!accessToken) {
          navigate("/authentications");
          return;
        }

        const response = await axios.get(PROFILE_API_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setUserData(response.data);
      } catch (err) {
        console.error("Profile Fetch Error:", err);
        setProfileError("Failed to load profile details.");
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/authentications");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // ── LOGOUT HANDLER ──────────────────────────────────────────────────
  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      const accessToken =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken && accessToken) {
        await axios.post(
          LOGOUT_API_URL,
          { refresh_token: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout API Error:", error?.response?.data || error.message);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("auth-change"));

      setIsLoggingOut(false);
      setShowLogoutModal(false);
      navigate("/authentications");
    }
  };

  const navItems = [
    { id: "orders", label: "My Orders", icon: Package, badge: 1 },
    { id: "notifications", label: "Notifications", icon: Bell, badge: 2 },
    { id: "wishlist", label: "Wishlist", icon: Heart, badge: 3 },
    { id: "addresses", label: "Saved Addresses", icon: MapPin },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "profile", label: "Account Settings", icon: Settings },
  ];

  // Avatar Generator
  const getAvatarUrl = () => {
    if (userData?.pr_small_url) return userData.pr_small_url;
    if (userData?.profile_image) {
      return userData.profile_image.startsWith("http")
        ? userData.profile_image
        : `https://res.cloudinary.com/qsvcve66/${userData.profile_image}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userData?.username || "User"
    )}&background=4f46e5&color=fff&bold=true`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-600 font-medium">
          <Loader2 className="animate-spin text-indigo-600" size={24} />
          <span>Loading Account Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* ── ECOMMERCE STORE HEADER BAR ──────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu size={22} />
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-600/20">
                S
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Store<span className="text-indigo-600">Pro</span>
              </span>
            </button>
          </div>

          {/* Right Header Navigation Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("notifications")}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Profile Brief in Navbar */}
            <div className="flex items-center gap-3">
              <img
                src={getAvatarUrl()}
                alt={userData?.username || "User"}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none capitalize">
                  {userData?.username}
                </p>
                <p className="text-[10px] text-indigo-600 font-semibold mt-1 capitalize flex items-center gap-1">
                  <ShieldCheck size={11} className="inline" />
                  {userData?.role || "Customer Account"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── DASHBOARD BODY CONTENT ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex gap-8 relative">
        
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          />
        )}

        {/* ── SIDEBAR NAVIGATION ──────────────────────────────────── */}
        <aside
          className={`fixed lg:sticky top-0 lg:top-20 left-0 bottom-0 lg:bottom-auto z-50 lg:z-10 w-72 h-screen lg:h-auto bg-white lg:bg-transparent p-6 lg:p-0 border-r lg:border-none border-slate-200 transition-transform duration-300 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } flex flex-col justify-between overflow-y-auto`}
        >
          <div className="space-y-6">
            
            {/* Mobile Header Close */}
            <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">
                Account Navigation
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-400 p-1 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile User Info Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <img
                src={getAvatarUrl()}
                alt={userData?.username || "User"}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-slate-900 truncate capitalize">
                  {userData?.username}
                </h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {userData?.email}
                </p>
                {userData?.mobile_number && (
                  <p className="text-[11px] text-indigo-600 font-semibold truncate mt-0.5">
                    {userData?.mobile_number}
                  </p>
                )}
              </div>
            </div>

            {/* Navigation Tab Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 font-bold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={isActive ? "text-indigo-400" : "text-slate-400"}
                      />
                      <span className="tracking-wide">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Logout Trigger */}
          <div className="pt-6 border-t border-slate-200/80 mt-8">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT SECTION ────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {profileError && (
            <div className="mb-6 flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium">
              <AlertCircle size={18} className="shrink-0 text-rose-500" />
              <span>{profileError}</span>
            </div>
          )}

          {/* Saved Addresses Section */}
          {activeTab === "addresses" && <AddressSection />}

          {/* Section Placeholders */}
          {activeTab !== "addresses" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                <ShoppingBag size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base capitalize">
                  {activeTab} Section
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Is feature ka update aane wala hai. Aap abhi apne saved addresses ko manage kar sakte hain.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── LOGOUT POPUP MODAL ────────────────────────────────────── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 text-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => !isLoggingOut && setShowLogoutModal(false)}
              disabled={isLoggingOut}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <LogOut size={22} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-wide">
                Confirm Logout
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to log out of your StorePro account?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <span>Yes, Logout</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}