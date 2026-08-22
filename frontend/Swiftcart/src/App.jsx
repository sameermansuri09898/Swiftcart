import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/credential/Registration.jsx"
// Layouts
import MainLayout from "./layouts/MainLayout.jsx";

// Pages & Components
import Home from "./pages/Home.jsx";
import Category from "./pages/Category.jsx";
import AuthContainer from "./components/credential/loginfun.jsx";
import Address from "./components/Dashboard/Address.jsx";
import UserDashboard from "./components/Dashboard/Dashboard.jsx"
import ProductDetail from "./pages/ProductDetail.jsx"
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout Wrapper */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/authentications" element={<AuthContainer />} />
          <Route path="/product" element={<Category />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/address" element={<Address />}/>
          <Route path="/ProductDetail/:Detail_slug/" element={<ProductDetail />} />
          

          {/* Fallback route for undefined paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="/UserDashboard" element={<UserDashboard />}/>
      </Routes>
    </BrowserRouter>
  );
}