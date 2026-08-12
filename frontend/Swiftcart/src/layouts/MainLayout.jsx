import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/navbar.jsx";
import Footer from "../components/layout/footer.jsx";
import CatSliderBottom from '../components/swipers/catbottm.jsx'

export default function MainLayout() {
  return (
    <div className="App">
      <Navbar />
      <CatSliderBottom/>
      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}