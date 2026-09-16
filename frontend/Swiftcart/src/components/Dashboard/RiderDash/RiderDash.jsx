// src/components/Dashboard/RiderDash.jsx
import React from 'react'
import Sidebar from '../RiderDash/Sidebar.jsx'
import Header from '../RiderDash/Header.jsx'
import StatsCards from '../RiderDash/StatsCards.jsx'
import CurrentDelivery from '../RiderDash/CurrentDelivery.jsx'
import LiveOrders from '../RiderDash/LiveOrders.jsx'
import EarningsChart from '../RiderDash/EarningsChart.jsx'
import RecentActivity from '../RiderDash/RecentActivity.jsx'
import QuickActions from '../RiderDash/QuickActions.jsx'
import PromoBanner from '../RiderDash/PromoBanner.jsx'

export default function RiderDash() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f4f2fb] overflow-x-hidden">
      {/* Sidebar (Includes Mobile Top Navbar & Mobile Bottom Bar) */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full px-4 sm:px-6 lg:px-8 pt-20 lg:pt-6 pb-24 lg:pb-8 space-y-5">
        {/* Header Component */}
        <Header />

        {/* Stats Section */}
        <StatsCards />

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
          {/* Left / Main Section */}
          <div className="space-y-5 min-w-0 w-full">
            <CurrentDelivery />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <EarningsChart />
              <RecentActivity />
            </div>
          </div>

          {/* Right / Secondary Section */}
          <div className="space-y-5 min-w-0 w-full">
            <LiveOrders />
            <QuickActions />
            <PromoBanner />
          </div>
        </div>
      </main>
    </div>
  )
}