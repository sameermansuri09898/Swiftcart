import React from 'react'
import { Package, MapPinCheck, CheckCheck } from 'lucide-react'
import { recentActivity } from '../../data/mockData'

const ICONS = {
  pickup: { icon: Package, color: 'text-brand-600 bg-brand-100' },
  location: { icon: MapPinCheck, color: 'text-mint-500 bg-mint-100' },
  delivered: { icon: CheckCheck, color: 'text-sky-500 bg-sky-100' },
}

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-xl2 shadow-card border border-black/[0.03] p-5 h-full">
      <h2 className="font-display font-bold text-[15px] text-ink-900">Recent Activity</h2>

      <div className="mt-4 relative">
        <div className="absolute left-[13px] top-1 bottom-1 w-px bg-black/[0.06]" />
        <div className="space-y-4">
          {recentActivity.map((a) => {
            const cfg = ICONS[a.type] || ICONS.pickup
            const Icon = cfg.icon
            return (
              <div key={a.id} className="flex items-start gap-3 relative">
                <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
                  <Icon size={12} />
                </div>
                <div className="flex-1 flex items-start justify-between gap-2 pt-0.5">
                  <div>
                    <p className="text-[12.5px] font-medium text-ink-900 leading-snug">{a.text}</p>
                    <p className="text-[10.5px] text-ink-900/35 mt-0.5">{a.time}</p>
                  </div>
                  {a.amount != null && (
                    <span className="text-[11.5px] font-semibold text-mint-500 shrink-0">
                      + ₹{a.amount}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
