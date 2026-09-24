import React from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  ShoppingBag,
  PieChart,
  Heart,
  ShieldCheck,
  MapPin,
  Cpu,
  FileText
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, mode, wishlist, orders } = useApp();

  const priceDropCount = wishlist.filter(item => item.priceDrop).length;
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered').length;

  const navItems = [
    {
      id: 'chat',
      label: mode === 'personal' ? 'AI Personal Shopper' : 'AI Procurement Agent',
      icon: MessageSquare,
      badge: null
    },
    {
      id: 'procurement',
      label: mode === 'personal' ? 'Orders & History' : 'Requisitions & POs',
      icon: mode === 'personal' ? ShoppingBag : FileText,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null
    },
    {
      id: 'budgets',
      label: 'Budgets & Spending',
      icon: PieChart,
      badge: null
    },
    {
      id: 'wishlist',
      label: 'Wishlist & Price Drops',
      icon: Heart,
      badge: priceDropCount > 0 ? `${priceDropCount} drops` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'wallet',
      label: 'Wallet & Permissions',
      icon: ShieldCheck,
      badge: null
    },
    {
      id: 'addresses',
      label: 'Saved Addresses',
      icon: MapPin,
      badge: null
    },
    {
      id: 'connectors',
      label: 'Commerce Connectors',
      icon: Cpu,
      badge: 'MCP'
    }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0B0F19] border-r border-slate-800/80 p-4 shrink-0 justify-between">
        <div className="space-y-6">
          <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Workspace</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              mode === 'personal' 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}>
              {mode === 'personal' ? 'Personal' : 'Corporate'}
            </span>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? mode === 'personal'
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                        : 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive 
                        ? mode === 'personal' ? 'text-purple-400' : 'text-cyan-400' 
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Agent Summary Pill */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 border border-slate-800/80">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
            <span className="text-xs font-semibold text-slate-200">Zibi Autonomous Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Scanning 6 e-commerce networks for discounts & specs. Auto-buy limit set to <span className="font-bold text-white">₦50,000</span>.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar — horizontally scrollable so every tab
          stays reachable on narrow screens instead of silently dropping the
          overflow (Addresses/Connectors previously had no mobile entry point). */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-slate-800 px-1 py-1.5 flex items-center gap-0.5 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-medium transition-all shrink-0 ${
                isActive
                  ? mode === 'personal' ? 'text-purple-400 font-bold bg-purple-500/10' : 'text-cyan-400 font-bold bg-cyan-500/10'
                  : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
