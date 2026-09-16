import React from 'react'
import { ShoppingBag, IndianRupee, Timer, Star } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js'
import { todayStats } from '../../data/mockData'

// Chart.js components ko register karna zaroori hai
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const sparkOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: {
    x: { display: false },
    y: { display: false },
  },
  elements: {
    point: { radius: 0 },
    line: { borderWidth: 2, tension: 0.4 },
  },
}

function Sparkline({ data, color }) {
  return (
    <div className="h-8 w-24">
      <Line
        data={{
          labels: data.map((_, i) => i),
          datasets: [{ data, borderColor: color, fill: false }],
        }}
        options={sparkOptions}
      />
    </div>
  )
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, subColor, footer }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-card border border-black/[0.03]">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={17} className={iconColor} />
        </div>
      </div>
      <p className="text-[12px] text-ink-900/45 mt-3">{label}</p>
      <div className="flex items-end justify-between mt-1">
        <p className="font-display text-[22px] font-bold text-ink-900">{value}</p>
      </div>
      {sub && <p className={`text-[11.5px] mt-0.5 font-medium ${subColor}`}>{sub}</p>}
      {footer}
    </div>
  )
}

export default function StatsCards() {
  const { deliveries, earnings, activeTime, rating } = todayStats
  const pct = Math.round((deliveries.done / deliveries.target) * 100)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={ShoppingBag}
        iconBg="bg-brand-100"
        iconColor="text-brand-600"
        label="Today's Deliveries"
        value={deliveries.done}
        sub={`of ${deliveries.target} target`}
        subColor="text-ink-900/40"
        footer={
          <div className="mt-3 h-1.5 rounded-full bg-black/5 overflow-hidden">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
          </div>
        }
      />
      <StatCard
        icon={IndianRupee}
        iconBg="bg-mint-100"
        iconColor="text-mint-500"
        label="Today's Earnings"
        value={`₹ ${earnings.total}`}
        sub={`+ ₹${earnings.bonus} bonus`}
        subColor="text-mint-500"
        footer={
          <div className="mt-2">
            <Sparkline data={[10, 14, 12, 20, 18, 26, 30]} color="#17b993" />
          </div>
        }
      />
      <StatCard
        icon={Timer}
        iconBg="bg-sky-100"
        iconColor="text-sky-500"
        label="Active Ride Time"
        value={activeTime}
        sub="Today"
        subColor="text-ink-900/40"
        footer={
          <div className="mt-2">
            <Sparkline data={[8, 12, 10, 16, 14, 18, 22]} color="#2e8fff" />
          </div>
        }
      />
      <StatCard
        icon={Star}
        iconBg="bg-rose-100"
        iconColor="text-rose-500"
        label="Rating"
        value={rating.score}
        sub={`(${rating.count} ratings)`}
        subColor="text-ink-900/40"
        footer={
          <div className="flex gap-0.5 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.round(rating.score) ? 'text-amber-500 fill-amber-500' : 'text-black/10'}
              />
            ))}
          </div>
        }
      />
    </div>
  )
}