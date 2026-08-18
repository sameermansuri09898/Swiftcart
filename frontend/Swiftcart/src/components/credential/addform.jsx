import { useEffect, useState } from "react";
import {
  MapPin, User, Phone, Home, Briefcase, MoreHorizontal,
  Star, X, AlertCircle, Loader2, Navigation, CheckCircle2
} from "lucide-react";

// Reusable Field Wrapper Component
function Field({ label, required, icon: Icon, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">
        {Icon && <Icon size={11} className="text-slate-400" />}
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// Input Box Dynamic Styling Function
const inputCls = (error) =>
  `w-full px-4 py-3 rounded-xl border text-sm text-slate-900 bg-white outline-none transition-all duration-200
   placeholder:text-slate-300 focus:ring-2
   ${error
    ? "border-rose-300 focus:ring-rose-100 focus:border-rose-400"
    : "border-slate-200 focus:ring-slate-100 focus:border-slate-400"
   }`;

export default function AddressForm({ onSubmit, onCancel, initialData = null }) {
  const isEdit = !!initialData?.id;

  // Form State Initialization
  const [formData, setFormData] = useState({
    full_name: "",
    mobile_number: "",
    address_line: "",
    landmark: "",
    opposite_of: "",
    city: "",
    state: "",
    zip_code: "",
    address_type: "home",
    latitude: null,
    longitude: null,
    is_default: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  // Edit Mode Ke Liye Initial Data Populating
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Input Field Changes Handle Karne Ka Logic
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    // Typing shuru karne par associated error message clear kar dega
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── GPS Detect Function (Reverse Geocoding Ke Saath) ──────────────────
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Aapka browser geolocation support nahi karta.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // OpenStreetMap Reverse Geocoding API se Address Details Fetch
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const addr = data.address || {};

          const autoAddress = [
            addr.building,
            addr.house_number,
            addr.road,
            addr.suburb || addr.neighbourhood
          ].filter(Boolean).join(", ");

          // Coordinates aur Fetched Fields Ko Form State Mein Update Karein
          setFormData((prev) => ({
            ...prev,
            latitude: latitude,
            longitude: longitude,
            address_line: autoAddress || data.display_name || prev.address_line,
            landmark: addr.suburb || addr.amenity || prev.landmark,
            city: addr.city || addr.town || addr.village || addr.county || prev.city,
            state: addr.state || prev.state,
            zip_code: addr.postcode || prev.zip_code,
          }));

          // GPS and Location Errors Clear Karein
          setErrors((prev) => ({
            ...prev,
            location: "",
            address_line: "",
            city: "",
            state: "",
            zip_code: "",
          }));
        } catch (err) {
          console.error("Location decode error:", err);
          // Geocoding Fail Hone Par Bhi Geolocation Coordinates Save Honge
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setErrors((prev) => ({ ...prev, location: "" }));
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error("GPS error:", error);
        setErrors((prev) => ({
          ...prev,
          location: "Location access denied. Address save karne ke liye GPS allow karna zaroori hai."
        }));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Frontend Strict Validation Check ──────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.full_name.trim()) e.full_name = "Full name is required";
    if (!formData.mobile_number.trim()) e.mobile_number = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile_number.replace(/\s/g, "")))
      e.mobile_number = "Enter a valid 10-digit number";
    if (!formData.address_line.trim()) e.address_line = "Address is required";
    if (!formData.city.trim()) e.city = "City is required";
    if (!formData.state.trim()) e.state = "State is required";
    if (!formData.zip_code.trim()) e.zip_code = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.zip_code)) e.zip_code = "Enter a valid 6-digit pincode";

    // Check GPS Co-ordinates
    if (!formData.latitude || !formData.longitude) {
      e.location = "Pehle 'Use Current Location' button click karke GPS location allow karein.";
    }

    return e;
  };

  // ── Form Submit Logic (Clean Payload Formatting) ──────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // 🔴 IMPORTANT FIX: DRF Serializer Parsing ke liye Payload Formatting
    // 1. empty strings ("") ko landmark & opposite_of se 'null' banate hain taaki backend 400 error na de.
    // 2. latitude & longitude ko Number precision limit (toFixed(8)) mein transform karte hain.
    const sanitizedPayload = {
      ...formData,
      landmark: formData.landmark.trim() ? formData.landmark.trim() : null,
      opposite_of: formData.opposite_of.trim() ? formData.opposite_of.trim() : null,
      latitude: formData.latitude !== null ? Number(Number(formData.latitude).toFixed(8)) : null,
      longitude: formData.longitude !== null ? Number(Number(formData.longitude).toFixed(8)) : null,
      is_default: Boolean(formData.is_default),
    };

    try {
      setSubmitting(true);
      if (onSubmit) {
        await onSubmit(sanitizedPayload); // Processed Payload Send Karein
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const addressTypes = [
    { value: "home", label: "Home", icon: Home },
    { value: "work", label: "Work", icon: Briefcase },
    { value: "other", label: "Other", icon: MoreHorizontal },
  ];

  const hasLocation = formData.latitude && formData.longitude;

  return (
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden">
      {/* Header Bar */}
      <div className="relative bg-slate-900 px-7 pt-8 pb-7">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
              <MapPin size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight">
                {isEdit ? "Update Address" : "Add New Address"}
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                {isEdit ? "Edit your delivery details" : "Where should we deliver?"}
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/20 transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Form Fields Section */}
      <div className="px-7 py-7 max-h-[70vh] overflow-y-auto">

        {/* GPS Permission / Detection Action Button */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locating}
            className={`w-full flex items-center justify-center gap-2 border font-semibold text-xs py-3 px-4 rounded-xl transition-all duration-200 active:scale-[0.99]
              ${hasLocation
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
              }`}
          >
            {locating ? (
              <>
                <Loader2 size={15} className="animate-spin text-amber-600" />
                Fetching GPS Location…
              </>
            ) : hasLocation ? (
              <>
                <CheckCircle2 size={15} className="text-emerald-600" />
                GPS Location Captured! (Click to re-fetch)
              </>
            ) : (
              <>
                <Navigation size={15} className="text-amber-600 fill-amber-600" />
                Allow GPS Location (Mandatory)
              </>
            )}
          </button>

          {/* Location Missing Error Indicator */}
          {errors.location && (
            <p className="text-xs text-rose-500 mt-2 flex items-center gap-1 font-medium">
              <AlertCircle size={13} /> {errors.location}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* User Full Name & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required icon={User} error={errors.full_name}>
              <input
                name="full_name"
                placeholder="Rahul Sharma"
                value={formData.full_name}
                onChange={handleChange}
                className={inputCls(errors.full_name)}
              />
            </Field>
            <Field label="Mobile Number" required icon={Phone} error={errors.mobile_number}>
              <input
                name="mobile_number"
                placeholder="9876543210"
                value={formData.mobile_number}
                onChange={handleChange}
                maxLength={10}
                className={inputCls(errors.mobile_number)}
              />
            </Field>
          </div>

          {/* Full Address Textarea */}
          <Field label="Address" required icon={MapPin} error={errors.address_line}>
            <textarea
              name="address_line"
              placeholder="House no., Street, Area…"
              value={formData.address_line}
              onChange={handleChange}
              rows={3}
              className={`${inputCls(errors.address_line)} resize-none`}
            />
          </Field>

          {/* Optional Landmark Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Landmark">
              <input
                name="landmark"
                placeholder="Near metro station"
                value={formData.landmark}
                onChange={handleChange}
                className={inputCls(false)}
              />
            </Field>
            <Field label="Opposite Of">
              <input
                name="opposite_of"
                placeholder="Opposite City Mall"
                value={formData.opposite_of}
                onChange={handleChange}
                className={inputCls(false)}
              />
            </Field>
          </div>

          {/* City and State Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="City" required error={errors.city}>
              <input
                name="city"
                placeholder="Mumbai"
                value={formData.city}
                onChange={handleChange}
                className={inputCls(errors.city)}
              />
            </Field>
            <Field label="State" required error={errors.state}>
              <input
                name="state"
                placeholder="Maharashtra"
                value={formData.state}
                onChange={handleChange}
                className={inputCls(errors.state)}
              />
            </Field>
          </div>

          {/* Postal / Zip code */}
          <Field label="Pincode" required error={errors.zip_code}>
            <input
              name="zip_code"
              placeholder="400001"
              value={formData.zip_code}
              onChange={handleChange}
              maxLength={6}
              className={`${inputCls(errors.zip_code)} w-full sm:w-1/2`}
            />
          </Field>

          {/* Categorization Type Selector */}
          <Field label="Address Type">
            <div className="flex gap-2 flex-wrap">
              {addressTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, address_type: value }))}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200
                    ${formData.address_type === value
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                    }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </Field>

          {/* Default Address Check Box Toggle */}
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div
              onClick={() => setFormData((p) => ({ ...p, is_default: !p.is_default }))}
              className={`relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0
                ${formData.is_default ? "bg-slate-900" : "bg-slate-200"}`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                  ${formData.is_default ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Star size={13} className={formData.is_default ? "text-amber-400" : "text-slate-300"} />
                Set as default address
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Used automatically at checkout</p>
            </div>
          </label>

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <MapPin size={15} />
                  {isEdit ? "Update Address" : "Save Address"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}