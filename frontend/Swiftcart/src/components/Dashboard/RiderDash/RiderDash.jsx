import React, { useState } from 'react'
import Sidebar from '../RiderDash/Sidebar.jsx'
import Header from '../RiderDash/Header.jsx'
import StatsCards from '../RiderDash/StatsCards.jsx'
import CurrentDelivery from '../RiderDash/CurrentDelivery.jsx'
import LiveOrders from '../RiderDash/LiveOrders.jsx'
import EarningsChart from '../RiderDash/EarningsChart.jsx'
import RecentActivity from '../RiderDash/RecentActivity.jsx'
import QuickActions from '../RiderDash/QuickActions.jsx'
import PromoBanner from '../RiderDash/PromoBanner.jsx'
import ProfileSection from '../RiderDash/ProfileSection.jsx' // Updated path for the profile section

export default function RiderDash() {
  // Default tab matching Sidebar NAV_ITEMS ('home' instead of 'dashboard')
  const [activeTab, setActiveTab] = useState('home')

  // Tab switcher handler
  const handleTabChange = (tabName) => {
    console.log('Navigating to tab:', tabName)
    setActiveTab(tabName)
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f4f2fb] overflow-x-hidden">
      {/* Sidebar Component with Active State Control */}
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Dynamic Content Container */}
      <main className="flex-1 min-w-0 w-full px-4 sm:px-6 lg:px-8 pt-20 lg:pt-6 pb-24 lg:pb-8 space-y-5">
        {/* Top Header */}
        <Header activeTab={activeTab} />

        {/* 1. HOME / DASHBOARD TAB */}
        {(activeTab === 'home' || activeTab === 'dashboard') && (
          <div className="space-y-5 animate-fadeIn">
            <StatsCards />

            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
              <div className="space-y-5 min-w-0 w-full">
                <CurrentDelivery />
                <RecentActivity />
              </div>

              <div className="space-y-5 min-w-0 w-full">
                <QuickActions setActiveTab={handleTabChange} />
                <PromoBanner />
              </div>
            </div>
          </div>
        )}

        {/* 2. DELIVERIES TAB */}
        {activeTab === 'deliveries' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Active Deliveries & Live Orders</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5 items-start">
              <div className="space-y-5 min-w-0 w-full">
                <CurrentDelivery />
              </div>
              <div className="space-y-5 min-w-0 w-full">
                <LiveOrders />
              </div>
            </div>
          </div>
        )}

        {/* 3. EARNINGS TAB */}
        {activeTab === 'earnings' && (
          <div className="space-y-5 animate-fadeIn">
            <StatsCards />
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Earnings Analytics & Breakdown</h2>
              <EarningsChart />
            </div>
          </div>
        )}

        {/* 4. PROFILE TAB (Connected to ProfileSection with Backend API) */}
        {activeTab === 'profile' && (
          <div className="animate-fadeIn">
            <ProfileSection />
          </div>
        )}

        {/* 5. AVAILABILITY TAB */}
        {activeTab === 'availability' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800">Duty Schedule & Shift Availability</h2>
            <p className="text-slate-500 text-sm">
              Manage your online status, set slot preferences, and view your active shift history.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-700">Current Status: On-Duty</p>
            </div>
          </div>
        )}

        {/* 6. SUPPORT TAB */}
        {activeTab === 'support' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800">Rider Partner Support</h2>
            <p className="text-slate-500 text-sm">
              Need assistance with an order, payout, or document verification? Contact our support team.
            </p>
            <div className="flex gap-4 pt-2">
              <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
                Call Support
              </button>
              <button className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm">
                Create Ticket
              </button>
            </div>
          </div>
        )}

        {/* 7. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800">Settings & Preferences</h2>
            <p className="text-slate-500 text-sm">
              App notification preferences, vehicle configuration, and account security settings.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}