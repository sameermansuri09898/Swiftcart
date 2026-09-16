import React from 'react'
import { MapPin, Phone, Home as HomeIcon, PackageCheck, CheckCircle2 } from 'lucide-react'
import { currentDelivery } from '../../data/mockData'

export default function CurrentDelivery() {
  const d = currentDelivery

  return (
    <div className="bg-white rounded-xl2 shadow-card border border-black/[0.03] overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4">
        <h2 className="font-display font-bold text-[15px] text-ink-900">Current Delivery</h2>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-mint-500 bg-mint-100 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-mint-500 pulse-dot" /> Live
        </span>
      </div>

      <div className="grid md:grid-cols-[1.4fr_1fr] gap-0 mt-3">
        {/* Route map */}
        <div className="relative h-56 md:h-auto mx-4 mb-4 md:mb-0 rounded-xl overflow-hidden bg-gradient-to-br from-brand-50 to-sky-100">
          <svg viewBox="0 0 400 260" className="w-full h-full">
            <rect width="400" height="260" fill="#eef0fb" />
            <path d="M0 60 H400" stroke="#dfe1f2" strokeWidth="2" />
            <path d="M0 150 H400" stroke="#dfe1f2" strokeWidth="2" />
            <path d="M90 0 V260" stroke="#dfe1f2" strokeWidth="2" />
            <path d="M260 0 V260" stroke="#dfe1f2" strokeWidth="2" />
            <path
              d="M70 190 C 110 170, 120 130, 160 120 S 230 150, 260 110 S 300 70, 330 65"
              fill="none"
              stroke="#7238f5"
              strokeWidth="3.5"
              strokeDasharray="1 10"
              strokeLinecap="round"
            />
            <circle cx="70" cy="190" r="9" fill="#7238f5" />
            <circle cx="70" cy="190" r="9" fill="#7238f5" opacity="0.35">
              <animate attributeName="r" values="9;18;9" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0;0.35" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <g transform="translate(320,50)">
              <path d="M10 0 C4 0 0 4.5 0 10.5 C0 18 10 30 10 30 S20 18 20 10.5 C20 4.5 16 0 10 0 Z" fill="#ff5d7d" />
              <circle cx="10" cy="10.5" r="4" fill="white" />
            </g>
          </svg>

          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-card text-[11px] font-medium text-ink-900/70 flex items-center gap-1.5">
            <MapPin size={13} className="text-brand-500" />
            Customer location · {d.distanceKm} km · {d.etaMins} mins
          </div>

          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-lg shadow-card px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
                <PackageCheck size={14} className="text-brand-600" />
              </div>
              <div className="leading-tight">
                <p className="text-[11.5px] font-semibold text-ink-900">{d.orderId}</p>
                <p className="text-[10.5px] text-ink-900/40">Groceries · {d.items} items · ₹{d.amount}</p>
              </div>
            </div>
            <button className="text-[11px] font-semibold text-brand-600">View Details</button>
          </div>
        </div>

        {/* Customer info */}
        <div className="px-5 pb-5 md:pl-0 md:pr-5">
          <p className="text-[11px] font-semibold text-ink-900/40 uppercase tracking-wide">Customer</p>
          <div className="flex items-center justify-between mt-1.5">
            <p className="font-display font-bold text-ink-900 text-[15px]">{d.customer.name}</p>
            <button className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
              <Phone size={14} className="text-white" />
            </button>
          </div>
          <p className="text-[12.5px] text-ink-900/50 mt-0.5">{d.customer.phone}</p>

          <div className="flex items-start gap-2 mt-4">
            <HomeIcon size={14} className="text-ink-900/40 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-ink-900/40 uppercase tracking-wide">
                Delivery Address
              </p>
              <p className="text-[12.5px] text-ink-900/70 mt-0.5 leading-snug">{d.customer.address}</p>
            </div>
          </div>

          <button className="mt-5 w-full bg-brand-500 hover:bg-brand-600 transition-colors text-white text-[13px] font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> Arrived at Location
          </button>
        </div>
      </div>
    </div>
  )
}
