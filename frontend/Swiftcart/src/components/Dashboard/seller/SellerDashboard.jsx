import { useEffect, useState } from "react";
import api from "../../services/productapi";

import StatCards from "./StatCards";
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);

  const loadProducts = async () => {
    const res = await api.get("products/management/");
    setProducts(res.data);
  };  

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6 space-y-6">

      <StatCards products={products}/>

      <div className="grid lg:grid-cols-3 gap-6">

        <ProductForm
          editProduct={editProduct}
          refresh={loadProducts}
          clearEdit={() => setEditProduct(null)}
        />

        <div className="lg:col-span-2">

          <ProductTable
            products={products}
            onEdit={setEditProduct}
            refresh={loadProducts}
          />

        </div>

      </div>

    </div>
  );
}