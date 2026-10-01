import React from 'react'
import { ClipboardList, IndianRupee, ToggleRight, Headset } from 'lucide-react'

const ACTIONS = [
  { id: 'orders', label: 'View All Orders', icon: ClipboardList, color: 'text-brand-600 bg-brand-100' },
  { id: 'earnings', label: 'Check Earnings', icon: IndianRupee, color: 'text-mint-500 bg-mint-100' },
  { id: 'availability', label: 'Update Availability', icon: ToggleRight, color: 'text-sky-500 bg-sky-100' },
  { id: 'support', label: 'Support / Help', icon: Headset, color: 'text-rose-500 bg-rose-100' },
]

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl2 shadow-card border border-black/[0.03] p-5">
      <h2 className="font-display font-bold text-[15px] text-ink-900">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        {ACTIONS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            className="flex items-center gap-2 border border-black/5 rounded-lg px-3 py-2.5 text-left hover:border-brand-300 hover:bg-brand-50/40 transition-colors"
          >
            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={14} />
            </div>
            <span className="text-[11.5px] font-medium text-ink-900/75 leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
