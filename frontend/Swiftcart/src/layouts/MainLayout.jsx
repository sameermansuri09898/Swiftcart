import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/navbar.jsx";
import Footer from "../components/layout/footer.jsx";
import CatSliderBottom from "../features/swipers/catbottm.jsx";
import { CartProvider } from "../services/CartContext.jsx"
import CartDrawer from "../components/common/cartdrawer.jsx";

export default function MainLayout() {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <CatSliderBottom />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}