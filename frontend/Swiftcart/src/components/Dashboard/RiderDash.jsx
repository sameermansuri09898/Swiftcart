import React, { useState } from "react";
import {
  User,
  Phone,
  Bike,
  Star,
  DollarSign,
  PackageCheck,
  ShieldCheck,
  MapPin,
  FileText,
  ToggleLeft,
  ToggleRight,
  Clock,
  Navigation,
  ExternalLink,
  CheckCircle2,
  XCircle
} from "lucide-react";

// Mock Data (Yeh data aapki API / Django Backend se aayega)
const initialRiderData = {
  partner_id: "DP-98421",
  fullName: "Rahul Sharma",
  mobile: "+91 98765 43210",
  email: "rahul.sharma@example.com",
  profile_image:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
  vehicle_type: "Bike",
  vehicle_number: "DL 01 AB 1234",
  is_online: true,
  is_available: true,
  is_verified: true,
  rating: 4.8,
  total_deliveries: 342,
  total_earnings: 15420,
  location: {
    latitude: 28.6139,
    longitude: 77.209,
    address: "Connaught Place, New Delhi"
  },
  documents: {
    driving_license: { status: "verified", url: "#" },
    vehicle_rc: { status: "verified", url: "#" },
    aadhar_card: { status: "verified", url: "#" }
  },
  active_delivery: {
    order_id: "ORD-88219",
    customer_name: "Amit Verma",
    pickup_address: "Store #12, Sector 18, Noida",
    delivery_address: "House 45, Pocket B, Mayur Vihar, Delhi",
    status: "On The Way",
    payout: 85
  }
};

export default function RiderDashboard() {
  const [rider, setRider] = useState(initialRiderData);
  const [activeTab, setActiveTab] = useState("overview");

  // Online/Offline status handle karne ke liye
  const toggleOnlineStatus = () => {
    setRider((prev) => ({
      ...prev,
      is_online: !prev.is_online,
      is_available: !prev.is_online
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      {/* Top Header / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white font-bold p-2 rounded-lg flex items-center justify-center">
              <Bike size={22} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight">
                Rider Partner App
              </h1>
              <p className="text-xs text-slate-500">ID: {rider.partner_id}</p>
            </div>
          </div>

          {/* Online Toggle & Status Badge */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleOnlineStatus}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-xs transition-all shadow-xs ${
                rider.is_online
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-slate-100 text-slate-600 border border-slate-300"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  rider.is_online ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              {rider.is_online ? "Online" : "Offline"}
              {rider.is_online ? (
                <ToggleRight size={20} className="text-emerald-600" />
              ) : (
                <ToggleLeft size={20} className="text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Profile Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={rider.profile_image}
                  alt={rider.fullName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                />
                {rider.is_verified && (
                  <div
                    className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full border-2 border-white"
                    title="Verified Partner"
                  >
                    <ShieldCheck size={14} />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{rider.fullName}</h2>
                  {rider.is_verified && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified Rider
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-slate-500 text-xs mt-1">
                  <span className="flex items-center gap-1">
                    <Phone size={12} /> {rider.mobile}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 uppercase font-semibold text-slate-700">
                    <Bike size={12} /> {rider.vehicle_type} ({rider.vehicle_number})
                  </span>
                </div>
              </div>
            </div>

            {/* Live Location Pill */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3 self-start md:self-auto">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <MapPin size={18} />
              </div>
              <div className="text-xs">
                <p className="text-slate-400 font-medium">Current Location</p>
                <p className="font-semibold text-slate-800">{rider.location.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics / Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Earnings</p>
              <p className="text-lg font-bold text-slate-900">₹{rider.total_earnings}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <PackageCheck size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Deliveries</p>
              <p className="text-lg font-bold text-slate-900">{rider.total_deliveries}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Star size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Rating</p>
              <p className="text-lg font-bold text-slate-900">{rider.rating} / 5.0</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Availability</p>
              <p className="text-sm font-bold text-slate-900">
                {rider.is_available ? "Ready for Orders" : "Busy"}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 bg-white px-4 rounded-xl shadow-2xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === "overview"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Active Order
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === "details"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === "documents"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Documents Verification
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {rider.active_delivery ? (
              <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs overflow-hidden">
                <div className="bg-emerald-600 text-white px-6 py-3 flex items-center justify-between">
                  <span className="font-semibold text-sm">
                    Active Delivery • {rider.active_delivery.order_id}
                  </span>
                  <span className="bg-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    {rider.active_delivery.status}
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pickup Address */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0 mt-0.5">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Pickup Location
                        </p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">
                          {rider.active_delivery.pickup_address}
                        </p>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                        <Navigation size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Customer Drop-off
                        </p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">
                          {rider.active_delivery.delivery_address}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Customer: <span className="font-medium text-slate-700">{rider.active_delivery.customer_name}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Earnings for this order</p>
                      <p className="text-lg font-bold text-emerald-600">₹{rider.active_delivery.payout}</p>
                    </div>

                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2">
                      <Navigation size={14} /> Open GPS Navigation
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <p className="text-slate-500 font-medium">No active deliveries right now.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "details" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3 border-slate-100">
              Account & Vehicle Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <p className="text-slate-400 text-xs">Full Name</p>
                <p className="font-semibold text-slate-800 mt-0.5">{rider.fullName}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <p className="text-slate-400 text-xs">Mobile Number</p>
                <p className="font-semibold text-slate-800 mt-0.5">{rider.mobile}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <p className="text-slate-400 text-xs">Vehicle Type</p>
                <p className="font-semibold text-slate-800 mt-0.5 capitalize">{rider.vehicle_type}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <p className="text-slate-400 text-xs">Vehicle Registration Number</p>
                <p className="font-semibold text-slate-800 mt-0.5">{rider.vehicle_number}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3 border-slate-100">
              Submitted Verification Documents
            </h3>

            <div className="space-y-3">
              {[
                { label: "Driving License", key: "driving_license" },
                { label: "Vehicle RC", key: "vehicle_rc" },
                { label: "Aadhar Card", key: "aadhar_card" }
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-slate-500" size={20} />
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{doc.label}</p>
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={12} /> Verified & Active
                      </span>
                    </div>
                  </div>

                  <a
                    href={rider.documents[doc.key]?.url}
                    className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
                  >
                    View <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}