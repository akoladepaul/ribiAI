import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ShoppingBag,
  Briefcase,
  Wallet,
  Download,
  Radio,
  Plus,
  CheckCircle2,
  LogIn,
  LogOut
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { toast } from '../utils/toast';

export const Header = () => {
  const {
    mode,
    setMode,
    walletBalance,
    setActiveTab,
    isAppInstalled,
    triggerPWAInstall,
    connectors
  } = useApp();
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast('Signed out — switched back to guest demo mode.', 'info');
  };

  const activeConnectorsCount = connectors.filter(c => c.active).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Brand & Logo */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('chat')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab('chat');
            }
          }}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse-subtle" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0B0F19] rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                Zibi<span className="text-purple-400 font-normal text-sm ml-1 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">AI Agent</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              {mode === 'personal' ? 'Personal Shopper & Companion' : 'Business Procurement Officer'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Pill */}
        <div className="hidden md:flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
          <button
            onClick={() => setMode('personal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'personal'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Personal Shopper</span>
          </button>
          <button
            onClick={() => setMode('business')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'business'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Business Procurement</span>
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Mobile Mode Toggle Icon */}
        <div className="flex md:hidden items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setMode(mode === 'personal' ? 'business' : 'personal')}
            className={`px-2.5 py-1 rounded text-xs font-bold ${
              mode === 'personal' ? 'bg-purple-600 text-white' : 'bg-cyan-600 text-white'
            }`}
          >
            {mode === 'personal' ? 'Personal' : 'Business'}
          </button>
        </div>

        {/* Connector Status Indicator */}
        <button 
          onClick={() => setActiveTab('connectors')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 rounded-xl text-xs text-slate-300 transition-all"
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-medium">{activeConnectorsCount} MCP Connectors</span>
        </button>

        {/* Pre-funded Wallet Badge */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('wallet')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab('wallet');
            }
          }}
          aria-label={`Wallet balance ₦${walletBalance.toLocaleString()}, open Wallet & Permissions`}
          className="flex items-center gap-2.5 px-3.5 py-1.5 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 rounded-xl cursor-pointer transition-all group"
        >
          <div className="w-7 h-7 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-wider text-purple-300 font-semibold block">Wallet</span>
            <span className="text-xs font-bold text-white font-mono">₦{walletBalance.toLocaleString()}</span>
          </div>
          <Plus className="w-3.5 h-3.5 text-purple-400 ml-1 hidden sm:block" />
        </div>

        {/* PWA Web App Install Button */}
        {!isAppInstalled && (
          <button
            onClick={triggerPWAInstall}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Install Zibi App on your Phone or Desktop"
            aria-label="Install Zibi App on your Phone or Desktop"
          >
            <Download className="w-4 h-4" />
            <span className="hidden lg:inline">Install Web App</span>
          </button>
        )}

        {isAppInstalled && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>App Installed</span>
          </div>
        )}

        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 rounded-xl text-xs text-slate-300 transition-all"
            title={`Signed in as ${user.email}`}
            aria-label={`Signed in as ${user.email}. Sign out`}
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline">{user.name}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 rounded-xl text-xs text-slate-300 transition-all"
            aria-label="Sign in"
          >
            <LogIn className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </header>
  );
};
