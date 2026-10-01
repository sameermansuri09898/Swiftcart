// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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