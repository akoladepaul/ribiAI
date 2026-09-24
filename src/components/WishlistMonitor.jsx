import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingDown,
  BellRing,
  Store,
  Plus,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { confirmAction } from '../utils/confirm';
import { toast } from '../utils/toast';
import { getProductImage } from '../utils/productImages';
import { useEscapeKey } from '../utils/useEscapeKey';

export const WishlistMonitor = () => {
  const { wishlist, setWishlist, setPendingApproval } = useApp();
  const [showModal, setShowModal] = useState(false);
  useEscapeKey(() => setShowModal(false), showModal);
  const [name, setName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [category, setCategory] = useState('Electronics');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!name || !targetPrice || Number(targetPrice) <= 0) return;

    setWishlist(prev => [
      {
        id: `w-${Date.now()}`,
        name: name,
        category: category,
        currentPrice: Number(targetPrice) * 1.1,
        originalPrice: Number(targetPrice) * 1.25,
        targetPrice: Number(targetPrice),
        bestStore: 'Jumia / Konga Direct',
        image: getProductImage(category),
        priceDrop: true,
        dropPercentage: 12,
        location: 'Lagos Warehouse',
        inStock: true
      },
      ...prev
    ]);

    setName('');
    setTargetPrice('');
    setShowModal(false);
  };

  const removeItem = async (item) => {
    const ok = await confirmAction(`Stop tracking "${item.name}" on the price drop radar?`);
    if (!ok) return;
    setWishlist(prev => prev.filter(i => i.id !== item.id));
    toast(`Removed "${item.name}" from your wishlist.`, 'info');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
              <BellRing className="w-3 h-3" /> Live Price Drop Radar
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Wishlist & Price Drop Watch</h2>
          <p className="text-xs text-slate-400">
            Zibi continuously scans internet retailers for price dips, flash sales, and restocks for your saved items.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Track New Product</span>
        </button>
      </div>

      {/* Wishlist Items List */}
      {wishlist.length === 0 && (
        <div className="p-8 rounded-3xl bg-[#131A29] border border-dashed border-slate-800 text-center space-y-2">
          <p className="text-sm text-slate-300 font-semibold">Nothing on your radar yet.</p>
          <p className="text-xs text-slate-500">Track a product to get notified the moment its price drops.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-3xl bg-[#131A29] border border-slate-800 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <img
                  src={item.image || getProductImage(item.category)}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-2xl border border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {item.category}
                    </span>
                    <button
                      onClick={() => removeItem(item)}
                      aria-label={`Stop tracking ${item.name}`}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1 leading-snug line-clamp-2">{item.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5 text-cyan-400" /> {item.bestStore}</span>
                  </div>
                </div>
              </div>

              {/* Price Drop Alert Pill */}
              {item.priceDrop && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    Price dropped by {item.dropPercentage}%!
                  </span>
                  <span className="font-mono text-slate-400 line-through text-[11px]">
                    ₦{item.originalPrice?.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Current Best Price</span>
                  <span className="font-bold text-white text-base">₦{item.currentPrice.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-sans">Target Price Trigger</span>
                  <span className="font-bold text-emerald-400">₦{item.targetPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Procure CTA */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => setPendingApproval({
                  title: item.name,
                  price: item.currentPrice,
                  vendor: item.bestStore,
                  deliveryDays: '1-2 Days',
                  specsNote: `Matched target wishlist trigger! Currently ₦${(item.originalPrice - item.currentPrice).toLocaleString()} lower than initial price.`,
                  image: item.image,
                  category: item.category
                })}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>Authorize Procurement Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onMouseDown={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <form onSubmit={handleAddItem} className="w-full max-w-md bg-[#131A29] border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Track Item on Price Monitor</h3>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold">Product Name or URL</label>
              <input
                type="text"
                placeholder="e.g., iPhone 16 Pro 256GB Desert Titanium"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold">Target Price Trigger (₦)</label>
              <input
                type="number"
                placeholder="700000"
                min="1"
                step="1"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Electronics">Electronics & Tech</option>
                <option value="Fashion">Fashion & Apparel</option>
                <option value="Furniture">Furniture & Home</option>
                <option value="Health">Health & Supplements</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30"
              >
                Start Monitoring
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
