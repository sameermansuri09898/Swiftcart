import { useEffect, useState } from "react";
import api from "../../services/productapi";
import {
  Package,
  Tag,
  DollarSign,
  Percent,
  Layers,
  UploadCloud,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const empty = {
  name: "",
  brand: "",
  category: "",
  stock: 30,
  package_quantity: "",
  package_unit: "g",
  price_inr: "",
  offer: 17,
  image: null,
};

export default function ProductForm({ editProduct, refresh, clearEdit }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategory();
  }, []);

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name || "",
        brand: editProduct.brand || "",
        category: editProduct.category?.id || editProduct.category || "",
        stock: editProduct.stock ?? 30,
        package_quantity: editProduct.package_quantity || "",
        package_unit: editProduct.package_unit || "g",
        price_inr: editProduct.price_inr || "",
        offer: editProduct.offer ?? 17,
        image: null,
      });
      // Existing product image preview
      setImagePreview(editProduct.image || null);
    } else {
      setForm(empty);
      setImagePreview(null);
    }
  }, [editProduct]);

  const loadCategory = async () => {
    try {
      const res = await api.get("categories/");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const change = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];
      setForm((prev) => ({ ...prev, [name]: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();

      Object.keys(form).forEach((k) => {
        // Sirf non-null aur string/file values append karein
        if (form[k] !== null && form[k] !== "") {
          data.append(k, form[k]);
        }
      });

      if (editProduct) {
        await api.patch(`products/management/${editProduct.uuid}/`, data);
      } else {
        await api.post("products/management/", data);
      }

      refresh();
      handleCancel();
    } catch (err) {
      console.error("Error saving product:", err);
      setError(
        err.response?.data?.message || "Failed to save product. Please check your fields."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    clearEdit();
    setForm(empty);
    setImagePreview(null);
    setError("");
  };

  return (
    <div className="p-6">
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {editProduct ? "Edit Product" : "Add New Product"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {editProduct
              ? "Update existing product details."
              : "Fill out the details to list a new item."}
          </p>
        </div>

        {editProduct && (
          <button
            type="button"
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Cancel Edit"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={submit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Product Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Package size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              required
              name="name"
              value={form.name}
              onChange={change}
              placeholder="e.g. Organic Almond Milk"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Brand & Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="brand"
                value={form.brand}
                onChange={change}
                placeholder="Brand Name"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              required
              name="category"
              value={form.category}
              onChange={change}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-all text-slate-700"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price & Discount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Price (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="number"
                name="price_inr"
                value={form.price_inr}
                onChange={change}
                placeholder="0.00"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Discount (%)</label>
            <div className="relative">
              <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                name="offer"
                value={form.offer}
                onChange={change}
                placeholder="17"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quantity & Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pkg Size</label>
            <input
              type="number"
              name="package_quantity"
              value={form.package_quantity}
              onChange={change}
              placeholder="500"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
            <select
              name="package_unit"
              value={form.package_unit}
              onChange={change}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-all text-slate-700"
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="L">L</option>
              <option value="pcs">pcs</option>
            </select>
          </div>
        </div>

        {/* Stock Inventory */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Available Stock
          </label>
          <div className="relative">
            <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={change}
              placeholder="30"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Product Media
          </label>

          {imagePreview ? (
            <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                />
                <span className="text-xs font-medium text-slate-600 truncate max-w-[150px]">
                  {form.image?.name || "Product Image"}
                </span>
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all">
              <UploadCloud size={24} className="text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-700">Click to upload image</span>
              <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={change}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit / Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          {editProduct && (
            <button
              type="button"
              onClick={handleCancel}
              className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>{editProduct ? "Update Product" : "Save Product"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}