import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/products/ProductCard";
import ProductSkeleton from "../components/layout/ProductSkeleton";
import Pagination from "../components/common/pagination";


export default function ProductGridDemo() {

    const [searchParams] = useSearchParams();

    const categoryId =
        searchParams.get("category");

    const page =
        Number(searchParams.get("page")) || 1;

    const pageSize =
        Number(searchParams.get("page_size")) || 40;


    const [products, setProducts] =
        useState([]);

    const [pagination, setPagination] =
        useState({
            count: 0,
            totalPages: 0,
            currentPage: 1,
            pageSize: pageSize,
            next: null,
            previous: null,
        });

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);


    useEffect(() => {

        if (!categoryId) {
            return;
        }


        const fetchProducts = async () => {

            try {

                setLoading(true);
                setError(null);


                const url =
                    `http://127.0.0.1:8000/Products/products/` +
                    `?category=${categoryId}` +
                    `&page=${page}` +
                    `&page_size=${pageSize}`;


                const response =
                    await fetch(url);


                if (!response.ok) {

                    throw new Error(
                        `HTTP error: ${response.status}`
                    );

                }


                const data =
                    await response.json();


                setProducts(
                    data.results || []
                );


                setPagination({

                    count: data.count,

                    totalPages:
                        data.total_pages,

                    currentPage:
                        data.current_page,

                    pageSize:
                        data.page_size,

                    next:
                        data.next,

                    previous:
                        data.previous,

                });


            } catch (err) {

                console.error(
                    "Products fetch error:",
                    err
                );

                setError(
                    "Failed to load products."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchProducts();

    }, [
        categoryId,
        page,
        pageSize
    ]);


    const handleAdd = (product) => {

        console.log(
            "Added to cart:",
            product.name
        );

    };


    if (loading) {

        return (

            <div className="min-h-screen bg-gray-50 p-6">

                <div className="
                    grid
                    grid-cols-2
                    sm:grid-cols-3
                    md:grid-cols-7
                    lg:grid-cols-8
                    xl:grid-cols-10
                    gap-x-3
                    gap-y-8
                ">

                    <ProductSkeleton count={20} />

                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="
                min-h-screen
                flex
                items-center
                justify-center
                text-red-500
            ">

                {error}

            </div>

        );

    }


    return (

        <div className="
            min-h-screen
            bg-gray-50
            px-0.5
            py-6
            sm:px-5
            md:px-8
            lg:px-20
        ">


            <div className="
                grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 2xl:grid-cols-8 gap-3 sm:gap-4
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


           {pagination.totalPages > 1 && (
  <footer className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
    {/* Product Count Info */}
    <p className="text-xs text-slate-500 font-medium order-2 sm:order-1 text-center sm:text-left">
      Showing page <span className="font-semibold text-slate-800">{pagination.currentPage}</span> of{" "}
      <span className="font-semibold text-slate-800">{pagination.totalPages}</span>
    </p>

    {/* Pagination Wrapper */}
    <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-center overflow-x-auto pb-1 sm:pb-0">
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
      />
    </div>
  </footer>
)}

        </div>

    );

}