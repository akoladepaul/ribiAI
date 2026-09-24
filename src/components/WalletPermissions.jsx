import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Wallet,
  CreditCard,
  Plus,
  CheckCircle2,
  SlidersHorizontal,
  Landmark
} from 'lucide-react';
import { toast } from '../utils/toast';
import { api } from '../services/backendClient';
import { AuthModal } from './AuthModal';
import { useEscapeKey } from '../utils/useEscapeKey';

export const WalletPermissions = () => {
  const { walletBalance, setWalletBalance, savedCards, permissions, setPermissions } = useApp();
  const { user } = useAuth();
  const [showTopUp, setShowTopUp] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [payProvider, setPayProvider] = useState('paystack'); // 'paystack' (NGN) | 'stripe' (USD)
  const [submitting, setSubmitting] = useState(false);

  const closeTopUp = () => {
    if (!submitting) setShowTopUp(false);
  };
  useEscapeKey(closeTopUp, showTopUp);

  // Guest/demo top-up — instant, local only. Real money never moves here.
  const handleDemoTopUp = (e) => {
    e.preventDefault();
    if (!topUpAmount || Number(topUpAmount) <= 0) return;
    setWalletBalance(prev => prev + Number(topUpAmount));
    setTopUpAmount('');
    setShowTopUp(false);
    toast(`Demo credit: ₦${Number(topUpAmount).toLocaleString()} added to your guest wallet (not real money).`, 'success');
  };

  // Signed-in users fund through the real backend — Paystack for NGN cards,
  // Stripe for international cards — then get redirected to the provider's
  // hosted checkout, so card details never pass through Zibi's own servers.
  const handleRealTopUp = async (e) => {
    e.preventDefault();
    if (!topUpAmount || Number(topUpAmount) <= 0) return;
    setSubmitting(true);
    try {
      if (payProvider === 'paystack') {
        const { authorizationUrl } = await api.post('/api/wallet/paystack/initialize', {
          amountNgn: Number(topUpAmount)
        });
        window.location.href = authorizationUrl;
      } else {
        const { checkoutUrl } = await api.post('/api/wallet/stripe/create-checkout-session', {
          amountUsd: Number(topUpAmount)
        });
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      toast(err.message || 'Could not start payment. Please try again.', 'warning');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/60 border border-purple-500/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-400" /> Secure Payment & Permission Boundaries
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Pre-funded Wallet & AI Agent Permissions</h2>
          <p className="text-xs text-slate-400">
            Establish strict financial guardrails. Control how much Zibi can spend autonomously vs when human authorization is required.
          </p>
        </div>

        <button
          onClick={() => setShowTopUp(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Top Up Wallet</span>
        </button>
      </div>

      {/* Wallet Balance & Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pre-funded Wallet Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#131A29] via-purple-950/30 to-[#131A29] border border-purple-500/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-purple-400" /> Zibi Virtual Wallet
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              user ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              {user ? 'Real Wallet — Signed In' : 'Guest Demo Wallet'}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block font-medium">Available Purchasing Power</span>
            <div className="text-3xl font-mono font-extrabold text-white">₦{walletBalance.toLocaleString()}</div>
            {!user && (
              <button onClick={() => setShowAuthModal(true)} className="text-[11px] text-purple-400 font-semibold hover:underline mt-1">
                Sign in to fund with real Paystack/Stripe payments
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2 text-xs">
            <button
              onClick={() => setShowTopUp(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md"
            >
              + Fund Balance
            </button>
            <span className="text-slate-400 text-[11px]">Instant settlement for auto-buys</span>
          </div>
        </div>

        {/* Saved Payment Cards */}
        <div className="p-6 rounded-3xl bg-[#131A29] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-cyan-400" /> Saved Payment Methods
            </span>
            <button 
              onClick={() => toast("Adding new credit/debit card...", 'info')}
              className="text-xs text-cyan-400 font-semibold hover:underline"
            >
              + Add Card
            </button>
          </div>

          <div className="space-y-2">
            {savedCards.map((card) => (
              <div key={card.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-cyan-300">
                    {card.brand}
                  </div>
                  <div>
                    <span className="font-bold text-white block">•••• •••• •••• {card.last4}</span>
                    <span className="text-[10px] text-slate-400">{card.name} (Exp: {card.expiry})</span>
                  </div>
                </div>
                {card.isDefault && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Permission Rules Engine */}
      <div className="p-6 rounded-3xl bg-[#131A29] border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-400" />
            <span>AI Permission Boundaries & Purchase Rules</span>
          </h3>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Guardrails Active
          </span>
        </div>

        <div className="space-y-6">
          {/* Auto-Buy Limit Slider */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Autonomous Auto-Purchase Limit</h4>
                <p className="text-xs text-slate-400">
                  Items below this amount will be purchased automatically if authorized by your voice/text prompt.
                </p>
              </div>
              <span className="text-lg font-mono font-extrabold text-purple-400">
                ₦{permissions.autoApproveLimit.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min="10000"
              max="500000"
              step="10000"
              value={permissions.autoApproveLimit}
              onChange={(e) => setPermissions(prev => ({ ...prev, autoApproveLimit: Number(e.target.value) }))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Mandatory Human Approval Threshold */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Mandatory Human Approval Threshold</h4>
                <p className="text-xs text-slate-400">
                  Purchases above this value strictly pop up the interactive Human Approval Drawer before execution.
                </p>
              </div>
              <span className="text-lg font-mono font-extrabold text-cyan-400">
                ₦{permissions.requireApprovalAbove.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min="50000"
              max="2000000"
              step="50000"
              value={permissions.requireApprovalAbove}
              onChange={(e) => setPermissions(prev => ({ ...prev, requireApprovalAbove: Number(e.target.value) }))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Auto-buy Monthly Groceries</span>
                <span className="text-[10px] text-slate-400">Approve recurring diaper/grocery orders</span>
              </div>
              <input
                type="checkbox"
                checked={permissions.autoBuyGroceries}
                onChange={(e) => setPermissions(prev => ({ ...prev, autoBuyGroceries: e.target.checked }))}
                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Always Confirm Electronics</span>
                <span className="text-[10px] text-slate-400">Require approval for laptops/phones</span>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled
                aria-label="Always confirm electronics purchases (locked policy, cannot be turned off)"
                title="This is a fixed policy and cannot be turned off"
                className="w-4 h-4 accent-cyan-500 rounded cursor-not-allowed opacity-70"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top-up Modal */}
      {showTopUp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onMouseDown={(e) => e.target === e.currentTarget && closeTopUp()}
        >
          <form onSubmit={user ? handleRealTopUp : handleDemoTopUp} className="w-full max-w-md bg-[#131A29] border border-purple-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Fund Zibi Wallet</h3>

            {user ? (
              <>
                <p className="text-xs text-slate-400">
                  You&apos;re signed in — this creates a real payment via {payProvider === 'paystack' ? 'Paystack' : 'Stripe'}
                  and redirects you to their secure checkout. Zibi never sees your card details.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayProvider('paystack')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2 text-xs font-bold transition-all ${
                      payProvider === 'paystack' ? 'bg-purple-950/60 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Landmark className="w-4 h-4" /> Paystack (₦)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayProvider('stripe')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2 text-xs font-bold transition-all ${
                      payProvider === 'stripe' ? 'bg-cyan-950/60 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Stripe ($)
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold">
                    Amount to Add ({payProvider === 'paystack' ? '₦' : '$'})
                  </label>
                  <input
                    type="number"
                    placeholder={payProvider === 'paystack' ? '5000' : '10'}
                    min={payProvider === 'paystack' ? '100' : '1'}
                    step="1"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                  Guest demo mode — this adds a fake balance for trying out the app. <button type="button" onClick={() => { setShowTopUp(false); setShowAuthModal(true); }} className="underline font-semibold">Sign in</button> to fund a real wallet.
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Amount to Add (₦)</label>
                  <input
                    type="number"
                    placeholder="500000"
                    min="1"
                    step="1"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  {[250000, 500000, 1000000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setTopUpAmount(amt.toString())}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-xl text-xs text-purple-300 font-mono"
                    >
                      +₦{(amt / 1000).toLocaleString()}k
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={closeTopUp}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
              >
                {submitting ? 'Redirecting...' : user ? 'Continue to Payment' : 'Add Demo Credit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};
