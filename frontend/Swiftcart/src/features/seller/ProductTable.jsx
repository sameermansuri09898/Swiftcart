import React, { useState, useMemo } from "react";
import { Edit2, Trash2, PackageX, CheckCircle2, XCircle, Search, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

/* Helper for price formatting (Matching ProductCard pattern) */
const formatINR = (value) => Math.round(Number(value) || 0).toLocaleString("en-IN");

function getPricing(product) {
  const mrp = Number(product?.price_inr ?? product?.price ?? product?.mrp ?? 0);
  const finalPrice = Number(product?.final_price ?? product?.finalPrice ?? product?.cost ?? product?.unit_price ?? 0);
  const hasDiscount = mrp > finalPrice && mrp > 0;
  const discountAmount = hasDiscount ? Math.round(mrp - finalPrice) : 0;

  return {
    mrp: hasDiscount ? formatINR(mrp) : null,
    price: formatINR(finalPrice),
    discountAmount: hasDiscount ? discountAmount : null,
  };
}

export default function ProductTable({ products = [], onEdit, onDelete, refresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Extract unique categories safely
  const categories = useMemo(() => {
    if (!Array.isArray(products)) return ["ALL"];
    const cats = products.map(
      (p) => p.category_name || p.category || p.category_details?.name || "Uncategorized"
    );
    return ["ALL", ...Array.from(new Set(cats))];
  }, [products]);

  // Filter products based on search term & category selection
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((product) => {
      const name = (product.name || product.title || "").toLowerCase();
      const sku = (product.sku || product.code || "").toLowerCase();
      const category = (
        product.category_name || product.category || product.category_details?.name || "Uncategorized"
      ).toLowerCase();

      const matchesSearch = name.includes(searchTerm.toLowerCase()) || sku.includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" || category === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Search & Category Filter Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search product name or SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center">
          <PackageX className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No products found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or add a new item to the catalog.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedProducts.map((product) => {
                // Resolved attributes exactly like ProductCard
                const pName = product.name || product.title || "Unnamed Product";
                const pImage =
                  product.pr_small_url ||
                  product.pr_medium_url ||
                  product.pr_large_url ||
                  product.image ||
                  product.image_url ||
                  product.product_image ||
                  product.thumbnail;
                const pSku = product.sku || product.code || product.product_code;
                const pCategory = product.category_name || product.category || product.category_details?.name || "Uncategorized";
                const pStock = Number(product.stock ?? product.quantity ?? product.count ?? 0);

                const { price, mrp, discountAmount } = getPricing(product);

                const isLowStock = pStock > 0 && pStock < 5;
                const isOutOfStock = !product.is_available || pStock <= 0;

                return (
                  <tr
                    key={product.uuid || product.id || Math.random()}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    {/* Product Name & Image */}
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        {pImage ? (
                          <img
                            src={pImage}
                            alt={pName}
                            className="w-10 h-10 rounded-lg object-contain border border-slate-200 bg-slate-50/50 p-0.5 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                            <ImageOff size={18} />
                          </div>
                        )}
                        <div className="truncate max-w-[200px]">
                          <p className="font-bold text-slate-800 truncate">{pName}</p>
                          {pSku && <p className="text-[10px] text-slate-400 font-mono">SKU: {pSku}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 font-medium">{pCategory}</td>

                    {/* Price & MRP Display */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-slate-900 text-sm">₹{price}</span>
                          {mrp && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{mrp}
                            </span>
                          )}
                        </div>
                        {discountAmount && (
                          <span className="text-[10px] font-semibold text-emerald-600">
                            Save ₹{discountAmount}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock Status Badge */}
                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                          <XCircle size={12} /> Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                          <PackageX size={12} /> Low Stock ({pStock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <CheckCircle2 size={12} /> In Stock ({pStock})
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit && onEdit(product)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(product.uuid || product.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredProducts.length > 0 && (
        <div className="p-4 bg-slate-50/60 border-t border-slate-200/80 flex items-center justify-between text-xs font-medium text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-bold text-slate-900">
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
            </span>{" "}
            of <span className="font-bold text-slate-900">{filteredProducts.length}</span> items
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}