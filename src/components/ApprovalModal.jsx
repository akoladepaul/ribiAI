import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  CheckCircle2,
  X,
  Store,
  Truck,
  Wallet,
  MapPin,
  CreditCard,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { toast } from '../utils/toast';
import { useEscapeKey } from '../utils/useEscapeKey';

export const ApprovalModal = () => {
  const { pendingApproval, setPendingApproval, walletBalance, addresses, addOrder } = useApp();
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' | 'card'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const closeIfIdle = () => {
    if (!isProcessing) setPendingApproval(null);
  };
  useEscapeKey(closeIfIdle, Boolean(pendingApproval));

  if (!pendingApproval) return null;

  const addressObj = addresses.find(a => a.id === selectedAddress) || addresses[0];
  const itemTotal = pendingApproval.price || 0;
  const shippingFee = pendingApproval.shippingFee || 15000;
  const grandTotal = itemTotal + shippingFee;

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(async () => {
      try {
        await addOrder({
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split('T')[0],
          item: pendingApproval.title,
          category: pendingApproval.category,
          mode: pendingApproval.mode || 'personal',
          amount: grandTotal,
          status: 'Confirmed & Procuring',
          vendor: pendingApproval.vendor || 'Jumia Direct / Authorized Supplier',
          address: addressObj ? `${addressObj.label} (${addressObj.city})` : 'Default Address',
          paymentMethod: paymentMethod === 'wallet' ? 'Zibi Pre-funded Wallet' : 'Corporate Visa Card (**4921)'
        });

        setIsProcessing(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setPendingApproval(null);
        }, 1500);
      } catch (err) {
        setIsProcessing(false);
        toast(err.message || 'Purchase failed. Please try again.', 'warning');
      }
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && closeIfIdle()}
    >
      <div className="relative w-full max-w-lg bg-[#131A29] border border-purple-500/30 rounded-3xl p-6 shadow-2xl shadow-purple-950/50 overflow-hidden text-slate-100">
        {/* Glow Header */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={closeIfIdle}
          disabled={isProcessing}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white">Purchase Authorized & Executed!</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Zibi has submitted payment via <span className="text-purple-300 font-semibold">{paymentMethod === 'wallet' ? 'Pre-funded Wallet' : 'Saved Card'}</span> and dispatched procurement instructions to {pendingApproval.vendor}.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header Badge */}
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Human Authorization Required</span>
                <h3 className="text-lg font-extrabold text-white">Procurement Approval Loop</h3>
              </div>
            </div>

            {/* Item Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex gap-4">
                {pendingApproval.image && (
                  <img 
                    src={pendingApproval.image} 
                    alt={pendingApproval.title} 
                    className="w-16 h-16 object-cover rounded-xl border border-slate-700" 
                  />
                )}
                <div className="flex-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {pendingApproval.category || 'Item Match'}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1 leading-snug">{pendingApproval.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5 text-cyan-400" /> {pendingApproval.vendor}</span>
                    <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-emerald-400" /> {pendingApproval.deliveryDays || '1-2 Days'}</span>
                  </div>
                </div>
              </div>

              {/* Specification Note */}
              {pendingApproval.specsNote && (
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[11px] text-purple-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{pendingApproval.specsNote}</span>
                </div>
              )}
            </div>

            {/* Delivery Address Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> Delivery Location
              </label>
              <select
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label} — {addr.address}, {addr.city} ({addr.recipient})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Source Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Funding Source
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'wallet'
                      ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Pre-funded Wallet</span>
                    <Wallet className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">Avail: ₦{walletBalance.toLocaleString()}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Corporate Visa</span>
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">Card ending **4921</span>
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Item Cost</span>
                <span className="font-mono text-slate-200">₦{itemTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping & Express Handling</span>
                <span className="font-mono text-slate-200">₦{shippingFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-white">
                <span>Total Authorization</span>
                <span className="font-mono text-purple-400">₦{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={closeIfIdle}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Decline
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
              >
                {isProcessing ? (
                  <span>Executing Payment...</span>
                ) : (
                  <>
                    <span>Authorize & Procure Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
