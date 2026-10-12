// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
// Layouts
import MainLayout from "./layouts/MainLayout.jsx";

// Pages & Components
import Home from "./pages/Home.jsx";
import Category from "./features/products/Category.jsx";

import Register from "./features/auth/components/Registration.jsx";
import AuthContainer from "./features/auth/components/loginfun.jsx";

import Address from "./features/Address/components/Address.jsx";

import UserDashboard from "./features/consumer/components/Dashboard.jsx";
import ProductDetail from "./features/products/ProductDetail.jsx";
import BulkImport from "./features/products/BulkImport.jsx";

import RiderDashboard from "./features/RiderDash/RiderDash.jsx";
import SellerDashboard from "./features/seller/SellerDashboard.jsx";

// Checkout & Order Tracking Pages
import Checkout from "./pages/Checkout.jsx"; // Path check kar lein apne folder layout ke hisab se
import OrderTracking from "./pages/Checkout.jsx"; // Dynamic WebSocket tracking page

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Public / User Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/authentications" element={<AuthContainer />} />
          <Route path="/product" element={<Category />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/address" element={<Address />} />
          <Route path="/ProductDetail/:Detail_slug/" element={<ProductDetail />} />
          <Route path="/admin/bulk-import" element={<BulkImport />} />

          {/* New Routes Added Here */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-tracking/:orderId" element={<OrderTracking />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Dashboards */}
        <Route path="/UserDashboard" element={<UserDashboard />} />
        <Route path="/rider/dashboard" element={<RiderDashboard />} />

        {/* Seller Dashboard */}
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}