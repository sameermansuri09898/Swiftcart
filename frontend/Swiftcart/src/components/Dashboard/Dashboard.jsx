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
} from "lucide-react";
import AddressSection from "./Address";

const LOGOUT_API_URL = "http://127.0.0.1:8000/account/logout/";
const PROFILE_API_URL = "http://127.0.0.1:8000/account/Profile/";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("addresses");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  // ── LOGOUT HANDLER (Django JWT Integration) ────────────────────────────
  const handleLogout = async () => {
    if (!window.confirm("Do you want to Logout?")) return;

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
      setIsLoggingOut(false);
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

  // Helper image URL generator (Cloudinary / Local URL handling)
  const getAvatarUrl = () => {
    if (userData?.pr_small_url) return userData.pr_small_url;
    if (userData?.profile_image) {
      return userData.profile_image.startsWith("http")
        ? userData.profile_image
        : `https://res.cloudinary.com/qsvcve66/${userData.profile_image}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userData?.username || "User"
    )}&background=6366f1&color=fff`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <Loader2 className="animate-spin text-indigo-600" size={24} />
          <span>Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu size={22} />
            </button>
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
                E
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Store<span className="text-indigo-600">Pro</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("notifications")}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Bell size={20} />
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
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
                <p className="text-[10px] text-slate-400 mt-0.5 capitalize">
                  {userData?.role || "Customer"} Verified Account
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex gap-8 relative">
        {/* MOBILE SIDEBAR OVERLAY */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}

        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-72 bg-white lg:bg-transparent p-6 lg:p-0 border-r lg:border-none border-slate-200 transition-transform duration-300 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } flex flex-col justify-between`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between lg:hidden pb-4 border-b border-slate-100">
              <span className="font-bold text-lg text-slate-900">
                Dashboard Menu
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-400 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <img
                src={getAvatarUrl()}
                alt={userData?.username || "User"}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
              />
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm text-slate-900 truncate capitalize">
                  {userData?.username}
                </h4>
                <p className="text-xs text-slate-500 truncate">
                  {userData?.email}
                </p>
                <p className="text-[10px] text-indigo-600 font-semibold truncate mt-0.5">
                  {userData?.mobile_number}
                </p>
              </div>
            </div>

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
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={
                          isActive ? "text-indigo-400" : "text-slate-400"
                        }
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? "bg-indigo-500 text-white"
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

          {/* LOG OUT BUTTON */}
          <div className="pt-6 border-t border-slate-200/80 mt-6">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              <LogOut size={18} />
              <span>{isLoggingOut ? "Logging Out..." : "Log Out"}</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          {profileError && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-medium">
              <AlertCircle size={18} className="shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {activeTab === "addresses" && <AddressSection />}

          {activeTab !== "addresses" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag size={22} />
              </div>
              <h3 className="font-bold text-slate-900 capitalize">
                {activeTab} Section
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Is section ka content jald hi available hoga.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}