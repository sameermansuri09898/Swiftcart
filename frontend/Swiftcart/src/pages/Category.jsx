import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductSkeleton from "../components/layout/ProductSkeleton"
import ProductCard from "../components/products/ProductCard";


export default function ProductGridDemo() {

  // URL:
  // /product?category=3
  //
  // categoryId = "3"

  const [searchParams] = useSearchParams();

  const categoryId =searchParams.get("category");
  const page = searchParams.get("page");
  const page_size = searchParams.get("page_size");

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  useEffect(() => {

    // Category nahi hai to API call mat karo

    if (!categoryId&&page&&page_size) {
      return;
    }


    const fetchProducts = async () => {

      try {

        setLoading(true);
        setError(null);


        const response = await fetch(
          `http://127.0.0.1:8000/Products/products/?category=${categoryId}&page=${page}&page_size=${page_size}`
        );


        if (!response.ok) {

          throw new Error(
            `HTTP error! status: ${response.status}`
          );

        }


        const data =
          await response.json();
          console.log(data.count)



        // DRF pagination support

        const productList =
          Array.isArray(data)
            ? data
            : data.results || [];

        console.log(productList)    


        setProducts(
          productList
        );


      } catch (err) {

        console.error(
          "Error fetching products:",
          err
        );

        setError(
          "slkeleton."
        );


      } finally {

        setLoading(false);

      }

    };


    fetchProducts();

  }, [categoryId,page,page_size]);


  const handleAdd = (product) => {

    console.log(
      "Added to cart:",
      product.name
    );

  };


  if (loading) {

    return (
        <div
            className="
                min-h-screen
                bg-gray-50
                px-3
                py-6
                sm:px-5
                md:px-8
                lg:px-10
            "
        >

            <div
                className="
                    mx-auto
                    w-full
                    max-w-full
                    grid
                    grid-cols-2
                    gap-x-3
                    gap-y-8
                    sm:grid-cols-3
                    sm:gap-x-4
                    md:grid-cols-7
                    lg:grid-cols-8
                    xl:grid-cols-10
                "
            >

                <ProductSkeleton count={20} />

            </div>

        </div>
    );
}


  if (error) {

    return (
      <div className="flex min-h-screen items-center  justify-center bg-gray-50 ">

        <p className="
          text-base
          font-medium
          text-red-500
        ">
          {error}
        </p>

      </div>
    );

  }


  return (

    <div className="
      min-h-screen
      bg-gray-50
      px-3
      py-6
      sm:px-5
      md:px-8
      lg:px-10
    ">

      <div className="
        mx-auto
        w-full
        max-w-full
        grid
        grid-cols-2
        gap-x-3
        gap-y-8
        sm:grid-cols-3
        sm:gap-x-4
        md:grid-cols-7
        lg:grid-cols-8
        xl:grid-cols-10
      ">

        {products.map((product) => (

          <ProductCard

            key={product.uuid}

            product={product}

            badge={
              product.stock > 0 &&
              product.stock < 5
                ? "LOW STOCK"
                : null
            }

            onAdd={handleAdd}

          />

        ))}

      </div>

    </div>

  );

}