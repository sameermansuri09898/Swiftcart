import React, { useState } from 'react'
import { MoreVertical, MapPin, User } from 'lucide-react'
import { liveOrders } from '../../data/mockData'

const TABS = [
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
]

const STATUS_STYLES = {
  'Out for Delivery': 'bg-mint-100 text-mint-500',
  'Picked Up': 'bg-sky-100 text-sky-500',
  Preparing: 'bg-amber-100 text-amber-500',
  Assigned: 'bg-brand-100 text-brand-600',
  Delivered: 'bg-black/5 text-ink-900/50',
}

function OrderRow({ order }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-black/[0.04] last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-semibold text-ink-900">{order.id}</p>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              STATUS_STYLES[order.status] || 'bg-black/5 text-ink-900/50'
            }`}
          >
            {order.status}
          </span>
          {order.eta !== '—' && (
            <span className="text-[10.5px] text-ink-900/35">ETA {order.eta}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px] text-ink-900/45">
          <User size={12} /> {order.customer}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-[11.5px] text-ink-900/35">
          <MapPin size={12} /> {order.location}
        </div>
      </div>
      <div className="text-right shrink-0 pl-3">
        <button className="text-ink-900/25 hover:text-ink-900/50">
          <MoreVertical size={16} />
        </button>
        <p className="text-[13px] font-bold text-ink-900 mt-2">₹{order.amount}</p>
        <p className="text-[10.5px] text-ink-900/35">{order.items} items</p>
      </div>
    </div>
  )
}

export default function LiveOrders() {
  const [tab, setTab] = useState('ongoing')
  const orders = liveOrders[tab] || []

  return (
    <div className="bg-white rounded-xl2 shadow-card border border-black/[0.03] p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-[15px] text-ink-900">Live Orders</h2>
        <button className="text-[11.5px] font-semibold text-brand-600">View All →</button>
      </div>

      <div className="flex gap-1 bg-black/[0.03] rounded-lg p-1 mt-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-[12px] font-semibold rounded-md py-1.5 transition-colors ${
              tab === t.id ? 'bg-white text-brand-600 shadow-card' : 'text-ink-900/40'
            }`}
          >
            {t.label} ({liveOrders[t.id]?.length ?? 0})
          </button>
        ))}
      </div>

      <div className="mt-1 flex-1 overflow-y-auto scrollbar-thin max-h-[340px]">
        {orders.length === 0 ? (
          <p className="text-[12.5px] text-ink-900/35 text-center py-10">No orders here yet.</p>
        ) : (
          orders.map((o) => <OrderRow key={o.id} order={o} />)
        )}
      </div>
    </div>
  )
}
