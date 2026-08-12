import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout.jsx";
import Home from "./pages/Home.jsx";
import Category from "./pages/Category.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>

          <Route path="/" element={<Home />} />

          <Route
            path="/category/:category"
            element={<Category />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}