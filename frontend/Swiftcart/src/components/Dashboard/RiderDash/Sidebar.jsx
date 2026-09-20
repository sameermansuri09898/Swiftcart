import React, { useState } from 'react'
import {
  Zap,
  Home,
  PackageSearch,
  Wallet,
  UserRound,
  CalendarClock,
  LifeBuoy,
  Settings,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'deliveries', label: 'My Deliveries', icon: PackageSearch, badge: 3 },
  { id: 'earnings', label: 'Earnings', icon: Wallet },
  { id: 'profile', label: 'My Profile', icon: UserRound },
  { id: 'availability', label: 'Availability', icon: CalendarClock },
  { id: 'support', label: 'Support', icon: LifeBuoy },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ activeTab, setActiveTab }) {
  const [online, setOnline] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  // Safe Tab Change Handler
  const handleTabClick = (tabId) => {
    if (typeof setActiveTab === 'function') {
      setActiveTab(tabId)
    }
    setIsOpen(false) // Mobile drawer close on selection
  }

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <div>
            <p className="font-bold text-[14px] text-slate-100 tracking-wide">SwiftCart</p>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5">Rider Console</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop for Mobile Drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 flex flex-col w-[270px] shrink-0 h-screen bg-slate-950 text-slate-300 border-r border-slate-800/80 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header (Desktop) */}
        <div className="hidden lg:flex items-center gap-3 px-6 h-18 shrink-0 border-b border-slate-900">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Zap size={19} className="text-white" fill="white" />
          </div>
          <div>
            <p className="font-extrabold text-[15px] tracking-wide text-white">SwiftCart</p>
            <p className="text-[11px] text-slate-400 font-medium">Delivery Partner</p>
          </div>
        </div>

        {/* Duty Status Bar */}
        <div className="px-4 pt-5 pb-3">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                {online && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    online ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}
                />
              </span>
              <span className="text-[12.5px] font-semibold text-slate-200">
                {online ? 'On Duty' : 'Off Duty'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setOnline((v) => !v)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                online ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
              aria-label="Toggle Online Status"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                  online ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-none">
          {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabClick(id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
                <span className="flex-1 text-left tracking-wide">{label}</span>
                {badge ? (
                  <span className="text-[10px] font-bold bg-rose-500 text-white rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-sm">
                    {badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        {/* Promotional / Referral Banner */}
        <div className="px-3 py-2">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-900/60 via-indigo-950 to-slate-900 p-4 border border-indigo-500/20 relative overflow-hidden group">
            <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-all" />
            <div className="flex items-center gap-1.5 text-indigo-400 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Sparkles size={13} />
              <span>Incentive</span>
            </div>
            <p className="text-[13px] font-bold text-slate-100">Refer & Earn ₹500</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Bring friends to SwiftCart and claim cash rewards.
            </p>
            <button 
              type="button"
              className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-semibold rounded-xl py-2 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] cursor-pointer"
            >
              Refer Now <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Footer Profile & Version */}
        <div className="p-3 border-t border-slate-900 mt-auto">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/60 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-300 font-bold text-xs">
                JD
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-slate-200 leading-tight">John Doe</p>
                <p className="text-[10px] text-slate-500 font-medium">ID: #49201</p>
              </div>
            </div>
            <button type="button" className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 cursor-pointer">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2 flex items-center justify-around z-30">
        {NAV_ITEMS.slice(0, 4).map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleTabClick(id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-slate-500'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
              <span className="text-[10px]">{label}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}