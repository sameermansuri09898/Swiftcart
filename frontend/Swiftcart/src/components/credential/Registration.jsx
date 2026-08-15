import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiBriefcase,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    mobile_number: "",
    role: "customer", // Default role
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Front-end validation
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/account/Account/Registration/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok || response.status === 201) {
        // Direct redirect to login page after successful registration
        navigate("/authentications", {
          state: { message: "Account created successfully! Please login." },
        });
      } else {
        // Display backend validation errors
        if (typeof data === "object") {
          const firstErrorKey = Object.keys(data)[0];
          const firstErrorMsg = Array.isArray(data[firstErrorKey])
            ? data[firstErrorKey][0]
            : data[firstErrorKey];
          setError(`${firstErrorKey.toUpperCase()}: ${firstErrorMsg}`);
        } else {
          setError("Registration failed. Please check your details.");
        }
      }
    } catch (err) {
      setError("Server error. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login Trigger
  const handleGoogleLogin = () => {
    window.location.href = "http://127.0.0.1:8000/account/google/login/";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold font-serif text-amber-500 tracking-tight">
            Swiftcart
          </h1>
          <h2 className="text-xl font-bold text-slate-800 mt-2">
            Create an Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Join us to start shopping in minutes
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium">
            <FiAlertCircle className="shrink-0 text-base" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Register Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-11 flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm mb-5 cursor-pointer"
        >
          <FcGoogle size={20} />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-xs text-slate-400 font-medium absolute">
            OR
          </span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username
            </label>
            <div className="relative flex items-center">
              <FiUser className="absolute left-3.5 text-slate-400 text-base" />
              <input
                type="text"
                name="username"
                required
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none focus:bg-white focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <FiMail className="absolute left-3.5 text-slate-400 text-base" />
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none focus:bg-white focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <FiPhone className="absolute left-3.5 text-slate-400 text-base" />
              <input
                type="tel"
                name="mobile_number"
                required
                placeholder="+91 9876543210"
                value={formData.mobile_number}
                onChange={handleChange}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none focus:bg-white focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Role
            </label>
            <div className="relative flex items-center">
              <FiBriefcase className="absolute left-3.5 text-slate-400 text-base" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none focus:bg-white focus:border-amber-500 transition-all cursor-pointer"
              >
                <option value="customer">Customer</option>
                <option value="seller">Vendor / Seller</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <FiLock className="absolute left-3.5 text-slate-400 text-base" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none focus:bg-white focus:border-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <FiLock className="absolute left-3.5 text-slate-400 text-base" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirm_password"
                required
                placeholder="••••••••"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none focus:bg-white focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-amber-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-xs text-center text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/authentications"
            className="text-amber-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}