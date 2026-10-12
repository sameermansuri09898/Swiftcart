import React, { useState, useEffect } from "react";
import { MoreVertical, MapPin, User, Loader2 } from "lucide-react";
import { liveOrders as mockLiveOrders } from "../../components/data/mockData";

const TABS = [
  { id: "ongoing", label: "Ongoing" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

const STATUS_STYLES = {
  "on_the_way": "bg-emerald-100 text-emerald-600",
  "Out for Delivery": "bg-emerald-100 text-emerald-600",
  "picked": "bg-sky-100 text-sky-600",
  "Picked Up": "bg-sky-100 text-sky-600",
  "assigned": "bg-brand-100 text-brand-600",
  "Assigned": "bg-brand-100 text-brand-600",
  "delivered": "bg-black/5 text-ink-900/50",
  "Delivered": "bg-black/5 text-ink-900/50",
};

function OrderRow({ order, onSelectOrder }) {
  return (
    <div
      onClick={() => onSelectOrder && onSelectOrder(order)}
      className="flex items-start justify-between py-3 border-b border-black/[0.04] last:border-0 hover:bg-slate-50/80 px-2 rounded-lg cursor-pointer transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-semibold text-ink-900">{order.id || order.orderId}</p>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
              STATUS_STYLES[order.status] || "bg-black/5 text-ink-900/50"
            }`}
          >
            {order.status?.replace(/_/g, " ")}
          </span>
          {order.eta && order.eta !== "—" && (
            <span className="text-[10.5px] text-ink-900/35">ETA {order.eta}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px] text-ink-900/45">
          <User size={12} /> {order.customer?.name || order.customer}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-[11.5px] text-ink-900/35 truncate">
          <MapPin size={12} className="shrink-0" />{" "}
          <span className="truncate">{order.customer?.address || order.location}</span>
        </div>
      </div>

      <div className="text-right shrink-0 pl-3">
        <button className="text-ink-900/25 hover:text-ink-900/50">
          <MoreVertical size={16} />
        </button>
        <p className="text-[13px] font-bold text-ink-900 mt-2">₹{order.amount}</p>
        <p className="text-[10.5px] text-ink-900/35">{order.items} items</p>
      </div>
    </div>
  );
}

export default function LiveOrders({ onSelectOrder, token, host = "127.0.0.1:8000" }) {
  const [tab, setTab] = useState("ongoing");
  const [ordersData, setOrdersData] = useState(mockLiveOrders);
  const [loading, setLoading] = useState(false);

  // Optional: Fetch live orders list from Backend API
  useEffect(() => {
    const fetchOrders = async () => {
      const jwtToken =
        token ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken") ||
        "";

      if (!jwtToken) return;

      try {
        setLoading(true);
        const response = await fetch(`http://${host}/api/delivery/live-orders/`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setOrdersData(data);
        }
      } catch (err) {
        // Fallback to mock data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [host, token]);

  const orders = ordersData[tab] || [];

  return (
    <div className="bg-white rounded-2xl shadow-card border border-black/[0.04] p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-[15px] text-ink-900">
          Live Orders
        </h2>
        <button className="text-[11.5px] font-semibold text-brand-600 hover:underline">
          View All →
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-black/[0.03] rounded-lg p-1 mt-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-[12px] font-semibold rounded-md py-1.5 transition-all ${
              tab === t.id
                ? "bg-white text-brand-600 shadow-card"
                : "text-ink-900/40 hover:text-ink-900/70"
            }`}
          >
            {t.label} ({ordersData[t.id]?.length ?? 0})
          </button>
        ))}
      </div>

      {/* Orders List Container */}
      <div className="mt-2 flex-1 overflow-y-auto scrollbar-thin max-h-[340px]">
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-ink-900/40 text-xs">
            <Loader2 className="animate-spin text-brand-500" size={18} />
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <p className="text-[12.5px] text-ink-900/35 text-center py-10">
            No orders here yet.
          </p>
        ) : (
          orders.map((o) => (
            <OrderRow
              key={o.id || o.orderId}
              order={o}
              onSelectOrder={onSelectOrder}
            />
          ))
        )}
      </div>
    </div>
  );
}