import { useEffect, useState, useRef } from "react";
import api from "../../services/productapi";

import StatCards from "./StatCards";
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";
import Pagination from "../../common/pagination";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Menu,
  X,
  PlusCircle,
  HelpCircle,
  CheckCircle2
} from "lucide-react";

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Pagination State
  const [pagination, setPagination] = useState({
    count: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
    next: null,
    previous: null,
  });

  const profileRef = useRef(null);

  // Toast Helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // Fetch Products with Pagination
  const loadProducts = async (page = 1) => {
    try {
      const res = await api.get(`products/management/?page=${page}&page_size=${pagination.pageSize}`);

      if (res.data.results) {
        setProducts(res.data.results);
        setPagination((prev) => ({
          ...prev,
          count: res.data.count || 0,
          totalPages: res.data.total_pages || Math.ceil((res.data.count || 0) / prev.pageSize),
          currentPage: page,
          next: res.data.next,
          previous: res.data.previous,
        }));
      } else {
        setProducts(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    loadProducts(pagination.currentPage);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadProducts(newPage);
    }
  };

  // Handle click outside profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditProduct(null);
    setIsFormModalOpen(false);
  };

  // Delete Handler
  const handleDeleteProduct = async (uuid) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`products/management/${uuid}/`);
        showToast("Product deleted successfully!", "success");
        loadProducts(pagination.currentPage);
      } catch (error) {
        console.error("Failed to delete product:", error);
        showToast("Failed to delete product. Please try again.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans relative">
      {/* Notification Toast */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in duration-300">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toast.message}</p>
          <button
            onClick={() => setToast({ show: false, message: "", type: "success" })}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col border-r border-slate-800 ${
          isSidebarOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0 lg:w-64"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-emerald-500 text-white p-2 rounded-xl shrink-0 font-bold">
              <ShoppingBag size={20} />
            </div>
            <span className="font-bold text-white text-lg tracking-wide truncate">
              VendorCentral
            </span>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "inventory", label: "Product Management", icon: Package },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white font-semibold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 m-3 bg-slate-800/50 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
          <HelpCircle size={16} className="text-emerald-400 shrink-0" />
          <div>
            <p className="font-semibold text-slate-300">Need Help?</p>
            <p className="text-[11px] text-slate-500">Contact Merchant Support</p>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Menu size={20} />
            </button>

            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search catalog, SKUs..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent rounded-xl text-sm focus:bg-white focus:border-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 hover:bg-slate-100 rounded-xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150"
                  alt="Avatar"
                  className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                />
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-bold text-slate-900 leading-tight">Alex Morgan</p>
                  <p className="text-slate-500 font-medium">Apex Store</p>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">Alex Morgan</p>
                    <p className="text-xs text-slate-500 truncate">alex.m@apexretail.com</p>
                  </div>
                  <button
                    onClick={() => { setActiveTab("settings"); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <User size={16} className="text-slate-400" /> Account Settings
                  </button>
                  <button
                    onClick={() => { setActiveTab("settings"); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Settings size={16} className="text-slate-400" /> Store Profile
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => console.log("Sign Out")}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === "dashboard" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-2xs">
              <h1 className="text-2xl font-bold text-slate-900">Hello World</h1>
            </div>
          )}

          {activeTab === "inventory" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Product Inventory
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage product catalog, stock count, and live store inventory.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddModal}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shrink-0"
                >
                  <PlusCircle size={16} /> Add New Product
                </button>
              </div>

              <StatCards products={products} />

              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
                <ProductTable
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  refresh={() => loadProducts(pagination.currentPage)}
                />

                {pagination.totalPages > 1 && (
                  <footer className="p-4 bg-slate-50/60 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500 font-medium order-2 sm:order-1 text-center sm:text-left">
                      Showing page <span className="font-semibold text-slate-800">{pagination.currentPage}</span> of{" "}
                      <span className="font-semibold text-slate-800">{pagination.totalPages}</span>
                    </p>

                    <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-center overflow-x-auto pb-1 sm:pb-0">
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  </footer>
                )}
              </div>
            </>
          )}

          {activeTab === "analytics" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-2xs">
              <h2 className="text-xl font-bold text-slate-900">Analytics View</h2>
              <p className="text-xs text-slate-500 mt-1">Analytics charts and data will go here.</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-2xs">
              <h2 className="text-xl font-bold text-slate-900">Settings View</h2>
              <p className="text-xs text-slate-500 mt-1">Store configuration settings will go here.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal Popup */}
      {isFormModalOpen && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100"
          >
            <ProductForm
              editProduct={editProduct}
              refresh={() => loadProducts(pagination.currentPage)}
              clearEdit={handleCloseModal}
              showToast={showToast}
            />
          </div>
        </div>
      )}
    </div>
  );
}