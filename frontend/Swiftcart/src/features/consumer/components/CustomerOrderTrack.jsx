import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Navigation route ke liye
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Calendar,
  Navigation, // Live Tracking Icon
} from "lucide-react";

const ORDERS_API_URL = "http://127.0.0.1:8000/Orders/oders/";

export default function OrdersSection() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const navigate = useNavigate(); // Navigation hook

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const accessToken =
          localStorage.getItem("token") || localStorage.getItem("access_token");

        if (!accessToken) {
          setError("User token missing. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(ORDERS_API_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        setOrders(data);
      } catch (err) {
        console.error("Fetch Orders Error:", err);
        setError("Failed to fetch order history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Helper function to check if order is active
  const isActiveOrder = (status) => {
    const s = status?.toLowerCase() || "";
    return !s.includes("delivered") && !s.includes("cancel");
  };

  // Status badges
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("delivered")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
          <CheckCircle2 size={13} className="text-emerald-600" /> Delivered
        </span>
      );
    } else if (s.includes("shipped") || s.includes("transit") || s.includes("ontheway")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
          <Truck size={13} className="text-blue-600" /> Out for Delivery
        </span>
      );
    } else if (s.includes("accepted") || s.includes("assigned")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
          <CheckCircle2 size={13} className="text-emerald-500" /> Order Accepted
        </span>
      );
    } else if (s.includes("cancel")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wide">
          <XCircle size={13} className="text-rose-600" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
        <Clock size={13} className="text-amber-600" /> Processing
      </span>
    );
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center justify-center min-h-[350px] shadow-xs">
        <Loader2 className="animate-spin text-emerald-600 mb-3" size={32} />
        <p className="text-slate-600 font-semibold text-sm">Fetching your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 text-xs font-semibold">
        <AlertCircle size={18} className="shrink-0 text-rose-500" />
        <span>{error}</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
          <ShoppingBag size={28} />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-900 text-base">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your cart is waiting! Explore products and place your first order.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <style>{`
        .blinkit-scrollbar::-webkit-scrollbar {
          height: 5px;
          width: 5px;
        }
        .blinkit-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .blinkit-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .blinkit-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Orders</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage & track your recent deliveries
          </p>
        </div>
        <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200/60 shadow-2xs">
          {orders.length} {orders.length === 1 ? "Order" : "Orders"}
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const currentOrderId = order.order_id || order.id;
          const isExpanded = expandedOrderId === currentOrderId;
          const items = order.items || [];
          const active = isActiveOrder(order.status);

          return (
            <div
              key={currentOrderId}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-300 shadow-xs"
            >
              {/* Order Card Header */}
              <div className="p-4 sm:p-5 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-extrabold shadow-xs shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">
                        Order #{currentOrderId}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                        {order.payment_method || "COD"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-medium">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Items Summary Horizontal Bar */}
              <div className="p-4 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Items Summary ({items.length})
                </p>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 blinkit-scrollbar">
                  {items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="shrink-0 group relative flex flex-col items-center bg-slate-50 p-2 rounded-xl border border-slate-100 w-20 text-center"
                    >
                      <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-slate-100 flex items-center justify-center mb-1.5">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name || "Item"}
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : (
                          <ShoppingBag size={18} className="text-slate-300" />
                        )}
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-800 line-clamp-1 w-full">
                        {item.product_name}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expandable Order Breakdown */}
              {isExpanded && (
                <div className="bg-slate-50/70 p-4 sm:p-5 border-b border-slate-100 space-y-4">
                  <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Detailed Item List
                  </h5>
                  <div className="space-y-2.5 divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="pt-2.5 first:pt-0 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-9 h-9 rounded-lg object-contain bg-white border border-slate-200 shrink-0 p-0.5"
                          />
                          <div className="truncate">
                            <p className="font-bold text-slate-800 truncate">
                              {item.product_name}
                            </p>
                            <p className="text-slate-400 text-[11px]">
                              ₹{item.price} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-extrabold text-slate-900 shrink-0">
                          ₹{item.total_price || (parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-600 font-medium">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-800">₹{order.subtotal || "0.00"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-semibold text-slate-800">₹{order.delivery_fee || "0.00"}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1 border-t border-slate-200">
                      <span>Total Paid</span>
                      <span className="text-emerald-600">₹{order.total_amount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="p-4 bg-white flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
                <div>
                  <span className="text-slate-500 font-medium">Grand Total: </span>
                  <span className="font-black text-slate-900 text-base ml-1">
                    ₹{order.total_amount}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Live Tracking Button (Active orders ke liye pulsing highlight) */}
                  {active && (
                    <button
                      type="button"
                      onClick={() => navigate(`/track-order/${currentOrderId}`)}
                      className="flex items-center gap-1.5 font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md animate-pulse"
                    >
                      <Navigation size={14} className="fill-white" />
                      <span>Track Live</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleExpand(currentOrderId)}
                    className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <span>{isExpanded ? "Hide Details" : "Details"}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}