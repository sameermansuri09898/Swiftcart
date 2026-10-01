import React from 'react'
import { Bell, ChevronDown } from 'lucide-react'

export default function Header() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-12 lg:pt-0 pb-2">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-800">
          Ready to deliver? Here's your today's summary.
        </h1>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        <button className="relative p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
        </button>

        <div className="flex items-center gap-2 p-1.5 pl-2 pr-3 bg-white border border-slate-200/80 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Profile"
            className="w-7 h-7 rounded-lg object-cover"
          />
          <ChevronDown size={14} className="text-slate-500" />
        </div>
      </div>
    </div>
  )
}