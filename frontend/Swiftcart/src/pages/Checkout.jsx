import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../services/CartContext.jsx";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, grandTotal, loading: cartLoading, fetchCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modals Management
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false); // 409 Conflict Popup
  const [orderInfo, setOrderInfo] = useState(null);

  const BASE_URL = "http://127.0.0.1:8000";

  const getAuthHeader = () => {
    const token = localStorage.getItem("access_token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoadingAddress(true);
        const res = await axios.get(`${BASE_URL}/account/shipping/list/`, getAuthHeader());
        const list = res.data || [];
        setAddresses(list);
        if (list.length > 0) {
          const defaultAddr = list.find((a) => a.is_default);
          setSelectedAddressId(defaultAddr ? defaultAddr.id : list[0].id);
        }
      } catch (err) {
        console.error("Address error:", err);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddresses();
    fetchCart();
  }, [fetchCart]);

  const deliveryFee = items.length > 0 ? 40.0 : 0.0;
  const subtotalAmount = parseFloat(grandTotal || 0);
  const finalPayable = subtotalAmount + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setErrorMsg("Kripya address select karein.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      address_id: parseInt(selectedAddressId, 10),
      payment_method: paymentMethod,
      delivery_fee: deliveryFee.toFixed(2),
    };

    try {
      const res = await axios.post(`${BASE_URL}/Orders/create/`, payload, getAuthHeader());

      if (res.status === 201 || res.status === 200) {
        setOrderInfo(res.data);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error("Order Creation Error Status:", err.response?.status);

      // 🚨 409 CONFLICT HANDLING
      if (err.response?.status === 409) {
        // Active Order Pehle Se Exists Karta Hai
        setOrderInfo(err.response.data);
        setShowConflictModal(true);
      } else {
        const errorData = err.response?.data;
        const msg = typeof errorData === "object" 
          ? Object.values(errorData).flat().join(" ") 
          : "Order place karne mein dikkat aayi.";
        setErrorMsg(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAddress || cartLoading) {
    return (
      <div className="flex justify-center items-center h-96 font-medium text-gray-600">
        Checkout details load ho rahi hain...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Checkout</h1>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-md">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Addresses & Payments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">1. Delivery Address Select Karein</h2>
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedAddressId === addr.id ? "border-green-600 bg-green-50/40" : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1 h-4 w-4 text-green-600"
                  />
                  <div className="ml-3">
                    <span className="font-semibold text-gray-800">{addr.full_name || addr.address_type}</span>
                    <p className="text-sm text-gray-600 mt-1">{addr.street_address}, {addr.city} - {addr.pincode}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">2. Payment Method</h2>
            <label className="flex items-center p-3 border rounded-xl cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="h-4 w-4 text-green-600"
              />
              <span className="ml-3 font-medium text-gray-700">Cash on Delivery (COD)</span>
            </label>
          </div>
        </div>

        {/* Summary Side */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-800">₹{subtotalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-medium text-gray-800">₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-bold text-gray-900">
                <span>Total Payable</span>
                <span className="text-green-600">₹{finalPayable.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting || items.length === 0}
              className="w-full mt-6 py-3 px-4 rounded-xl text-white font-semibold bg-green-600 hover:bg-green-700 transition-all"
            >
              {submitting ? "Processing..." : "Confirm & Place Order"}
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. SUCCESS MODAL (ORDER PLACED)                     */}
      {/* ---------------------------------------------------- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              ✓
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">Order Confirmed!</h3>
            <p className="text-gray-500 text-sm mb-4">Aapka order successfully place ho gaya hai.</p>

            <div className="bg-emerald-50 rounded-xl p-4 text-left border border-emerald-100 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-bold text-gray-800">#{orderInfo?.order_id || orderInfo?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rider:</span>
                <span className="font-semibold text-emerald-800">{orderInfo?.assigned_rider || "Assigning Nearest Rider..."}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Distance:</span>
                <span className="font-bold text-gray-800">{orderInfo?.distance || "2.4 km"}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/order-tracking/${orderInfo?.order_id || orderInfo?.id}`)}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-all"
            >
              Live Track Order
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. CONFLICT MODAL (409 ACTIVE ORDER EXISTS)          */}
      {/* ---------------------------------------------------- */}
      {showConflictModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Active Order In Progress</h3>
            <p className="text-gray-600 text-sm mb-6">
              Aapka ek order pehle se delivery ke liye active hai. Ek waqt par sirf ek live order track ho sakta hai.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  const activeId = orderInfo?.active_order_id || orderInfo?.id || "";
                  navigate(`/order-tracking/${activeId}`);
                }}
                className="w-full bg-amber-600 text-white font-semibold py-3 rounded-xl hover:bg-amber-700 transition-all shadow-md"
              >
                Existing Order Track Karein
              </button>

              <button
                onClick={() => setShowConflictModal(false)}
                className="w-full bg-gray-100 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;