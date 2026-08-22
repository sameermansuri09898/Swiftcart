import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Star,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Loader2,
  ChevronRight,
  Share2,
  Tag
} from "lucide-react";

export default function ProductDetail() {
  const { Detail_slug } = useParams(); // Django URL pattern: ProductDetail/<slug:Detail_slug>/
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isWishlist, setIsWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch product data matching your Django API Endpoint
  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const targetSlug = Detail_slug || "Organically-Grown-Tomato-Localsd";
        const response = await axios.get(
          `http://127.0.0.1:8000/Products/ProductDetail/${targetSlug}/`
        );

        const data = response.data;
        setProduct(data);

        // Optimal main image pick: large -> medium -> small fallback
        const primaryImg =
          data?.large_image ||
          data?.medium_image ||
          data?.small_image ||
          "https://via.placeholder.com/600x600?text=No+Image";

        setSelectedImage(primaryImg);
      } catch (err) {
        console.error("Product API Error:", err);
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [Detail_slug]);

  // Quantity Handlers
  const handleQuantity = (type) => {
    if (type === "dec" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    } else if (type === "inc") {
      const stockLimit = product?.stock ?? 10;
      if (quantity < stockLimit) {
        setQuantity((prev) => prev + 1);
      }
    }
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="text-sm font-semibold text-slate-600">Loading Fresh Product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-center max-w-md w-full space-y-4">
          <AlertCircle className="mx-auto text-rose-500" size={48} />
          <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
          <p className="text-xs text-slate-500">{error || "Requested product details are unavailable."}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  // Price & Offer calculations directly from API structure
  const originalPrice = parseFloat(product.price_inr || 0);
  const finalPrice = parseFloat(product.final_price || product.offer_price || originalPrice);
  const discountPercent = parseFloat(product.offer || 0);

  // Available image resolutions array
  const imageVariants = [
    { label: "Large", url: product.large_image },
    { label: "Medium", url: product.medium_image },
    { label: "Small", url: product.small_image },
    { label: "Thumb", url: product.pr_small_url },
  ].filter((img) => img.url);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans pb-16">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-emerald-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
          <span className="hover:text-emerald-600 transition-colors">
            {product.category_name || "Vegetables"}
          </span>
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
          <span className="text-slate-900 truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* LEFT: Product Image Section */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="relative aspect-square max-h-[480px] w-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center group mx-auto">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              
              {/* Discount Tag */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                  <Tag size={12} />
                  <span>{discountPercent}% OFF</span>
                </div>
              )}

              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlist(!isWishlist)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-600 hover:text-rose-500 transition-all shadow-md active:scale-95"
              >
                <Heart size={20} className={isWishlist ? "fill-rose-500 text-rose-500" : ""} />
              </button>
            </div>

            {/* Thumbnail Selectors (using API images) */}
            {imageVariants.length > 1 && (
              <div className="flex gap-3 justify-center overflow-x-auto py-2">
                {imageVariants.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(item.url)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all p-1 bg-slate-50 shrink-0 ${
                      selectedImage === item.url
                        ? "border-emerald-500 ring-2 ring-emerald-500/20"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={`View ${idx}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Meta & Purchase Panel */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Brand & Category */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 uppercase tracking-wider">
                  {product.brand || "Fresh Produce"}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Category: {product.category_name}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                {product.name}
              </h1>

              {/* Rating Section */}
              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">4.8</span>
                <span className="text-xs text-slate-400">(142 Customer Reviews)</span>
              </div>

              {/* Pricing Section */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{finalPrice.toFixed(2)}
                  </span>
                  {originalPrice > finalPrice && (
                    <span className="text-base text-slate-400 line-through font-medium">
                      ₹{originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-1 rounded-md">
                    Per {product.package_quantity} {product.package_unit}
                  </span>
                </div>
                {discountPercent > 0 && (
                  <p className="text-xs text-emerald-600 font-bold mt-1">
                    You save ₹{(originalPrice - finalPrice).toFixed(2)} ({discountPercent}% Discount)
                  </p>
                )}
              </div>

              {/* Stock Status Indicator */}
              <div className="pt-1">
                {product.is_available && product.stock > 0 ? (
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50/80 w-fit px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 size={16} />
                    <span>In Stock ({product.stock} units available)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-600 text-xs font-bold bg-rose-50/80 w-fit px-3 py-1.5 rounded-lg border border-rose-200">
                    <AlertCircle size={16} />
                    <span>Currently Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
                Directly sourced premium organic local produce. Specially grown to retain high nutritional values and authentic taste. Perfect for daily culinary preparations.
              </p>
            </div>

            {/* Actions: Quantity + Add to Cart */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                
                {/* Quantity Control */}
                <div className="flex items-center border border-slate-200 rounded-2xl p-1 bg-slate-50 w-full sm:w-auto justify-between">
                  <button
                    onClick={() => handleQuantity("dec")}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-all shadow-sm"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 font-extrabold text-slate-900 text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantity("inc")}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-all shadow-sm"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add To Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.is_available || product.stock <= 0}
                  className="w-full sm:flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
                >
                  <ShoppingCart size={18} />
                  <span>{addedToCart ? "Added to Cart!" : "Add to Cart"}</span>
                </button>
              </div>

              {/* Service Features Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
                <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                  <Truck size={20} className="text-emerald-600" />
                  <span className="text-[11px] font-bold text-slate-700">Express Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <span className="text-[11px] font-bold text-slate-700">100% Organic</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                  <RotateCcw size={20} className="text-emerald-600" />
                  <span className="text-[11px] font-bold text-slate-700">Easy Replacement</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}