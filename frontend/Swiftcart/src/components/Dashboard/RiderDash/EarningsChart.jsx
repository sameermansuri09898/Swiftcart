import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import { earningsOverview } from '../../data/mockData'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#150f2b',
      padding: 10,
      cornerRadius: 8,
      titleFont: { size: 11 },
      bodyFont: { size: 12, weight: '600' },
      callbacks: {
        label: (ctx) => `₹${ctx.parsed.y}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#0d0a1a66', font: { size: 10 } },
      border: { display: false },
    },
    y: {
      display: false,
    },
  },
  borderRadius: 5,
  barPercentage: 0.55,
}

export default function EarningsChart() {
  const { total, breakdown, chart } = earningsOverview

  const data = {
    labels: chart.labels,
    datasets: [
      {
        data: chart.values,
        backgroundColor: chart.values.map((_, i) =>
          i === chart.values.length - 2 ? '#7238f5' : '#c8b8fb'
        ),
        hoverBackgroundColor: '#5f22e0',
      },
    ],
  }

  return (
    <div className="bg-white rounded-xl2 shadow-card border border-black/[0.03] p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-[15px] text-ink-900">Earnings Overview</h2>
        <button className="flex items-center gap-1 text-[11.5px] font-medium text-ink-900/45 bg-black/[0.03] px-2.5 py-1 rounded-md">
          Today
        </button>
      </div>

      <div className="flex items-end justify-between mt-3 flex-wrap gap-3">
        <div>
          <p className="font-display text-[24px] font-bold text-ink-900">₹ {total}</p>
          <p className="text-[11px] text-ink-900/40">Total Earnings</p>
        </div>
        <div className="flex gap-4">
          {breakdown.map((b) => (
            <div key={b.label} className="text-right">
              <p className="text-[12.5px] font-semibold text-ink-900">₹ {b.value}</p>
              <p className="text-[10px] text-ink-900/35">{b.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-40 mt-4">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}
