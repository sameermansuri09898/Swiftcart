import React from 'react'
import { ShieldCheck } from 'lucide-react'

export default function PromoBanner() {
  return (
    <div className="rounded-xl2 bg-gradient-to-r from-brand-700 via-brand-600 to-rose-500 p-5 relative overflow-hidden">
      <div className="absolute -right-8 -bottom-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute right-10 top-3 w-16 h-16 rounded-full bg-white/10" />
      <div className="relative flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-display font-bold text-[13.5px]">Stay Safe, Deliver Safe</p>
          <p className="text-white/75 text-[11.5px] mt-0.5 leading-snug">
            Follow traffic rules and ensure customer satisfaction on every ride.
          </p>
        </div>
      </div>
      <button className="relative mt-3 text-[11.5px] font-semibold text-white/90 underline underline-offset-2">
        Read Guidelines →
      </button>
    </div>
  )
}
