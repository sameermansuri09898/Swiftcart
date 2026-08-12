import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/products/ProductCard";

export default function ProductGridDemo() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://127.0.0.1:8000/Products/products/AllCategorys/"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handles both direct array response and paginated `{ results: [...] }` formats
        const productList = Array.isArray(data)
          ? data
          : data.results || data.products || [];

        setProducts(productList);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please check server connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAdd = (product) => {
    console.log("Added to cart:", product.name);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-base font-medium text-gray-600 animate-pulse">
          Loading products...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-base font-medium text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-6 sm:px-5 md:px-8 lg:px-10">
      <div
        className="
          mx-auto w-full max-w-full grid
          grid-cols-2 gap-x-3 gap-y-8
          sm:grid-cols-3 sm:gap-x-4
          md:grid-cols-7
          lg:grid-cols-8
          xl:grid-cols-10
        "
        style={{alignItems: "center"}}
      >
        {products.map((product) => (
          <ProductCard
            key={product.uuid}
            product={product}
            badge={
              product.stock > 0 && product.stock < 5 ? "LOW STOCK" : null
            }
            onAdd={handleAdd}
          />
        ))}
      </div>
    </div>
  );
}