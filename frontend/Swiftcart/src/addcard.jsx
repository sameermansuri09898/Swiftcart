import { Pencil, Trash2, MapPin, Home, Briefcase, MoreHorizontal, Star, Phone, User } from "lucide-react";

const TYPE_CONFIG = {
  home:  { icon: Home, label: "Home", color: "text-violet-600 bg-violet-50 border-violet-100" },
  work:  { icon: Briefcase, label: "Work", color: "text-sky-600 bg-sky-50 border-sky-100" },
  other: { icon: MoreHorizontal, label: "Other", color: "text-slate-600 bg-slate-50 border-slate-200" },
};

export default function AddressCard({ address, onEdit, onDelete, onDefault }) {
  const type = TYPE_CONFIG[address.address_type] || TYPE_CONFIG.other;
  const TypeIcon = type.icon;

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
        address.is_default
          ? "border-slate-900 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900"
          : "border-slate-200 hover:border-slate-300 shadow-sm"
      }`}
    >
      {address.is_default && (
        <div className="absolute -top-px left-5 right-5 h-0.5 bg-slate-900 rounded-b-full" />
      )}

      {/* CARD BODY */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${type.color}`}>
            <TypeIcon size={11} />
            {type.label}
          </span>

          {address.is_default && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Default
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <User size={12} className="text-slate-400 shrink-0" />
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              {address.full_name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Phone size={11} className="text-slate-400 shrink-0" />
            <span>+91 {address.mobile_number}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl px-4 py-3 flex gap-2.5">
          <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-600 leading-relaxed">
            <p className="line-clamp-2">{address.address_line}</p>
            {address.landmark && (
              <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">
                Near {address.landmark}
              </p>
            )}
            <p className="font-semibold text-slate-800 mt-1">
              {address.city}, {address.state}&nbsp;
              <span className="font-bold text-slate-900 tracking-wide">{address.zip_code}</span>
            </p>
          </div>
        </div>
      </div>

      {/* CARD ACTIONS */}
      <div className="px-5 pb-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(address)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition"
          >
            <Pencil size={12} />
            Edit
          </button>

          {!address.is_default && (
            <button
              onClick={() => onDelete(address.id)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 px-3 py-2 rounded-xl transition"
            >
              <Trash2 size={12} />
              Delete
            </button>
          )}
        </div>

        {!address.is_default && (
          <button
            onClick={() => onDefault(address.id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-900 hover:bg-slate-900 hover:text-white px-3 py-2 rounded-xl transition"
          >
            <Star size={12} />
            Set Default
          </button>
        )}
      </div>
    </div>
  );
}