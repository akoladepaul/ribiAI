import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PieChart,
  Plus,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ShoppingBag,
  Briefcase,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { calculateUsagePercent } from '../utils/permissions';
import { toast } from '../utils/toast';
import { useEscapeKey } from '../utils/useEscapeKey';

export const BudgetManager = () => {
  const { budgets, setBudgets, mode } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  useEscapeKey(() => setShowAddModal(false), showAddModal);
  const [newCat, setNewCat] = useState('');
  const [newAllocated, setNewAllocated] = useState('');
  const [newCycle, setNewCycle] = useState('Monthly');

  const filteredBudgets = budgets.filter(b => b.mode === mode);
  const totalAllocated = filteredBudgets.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalSpent = filteredBudgets.reduce((acc, curr) => acc + curr.spent, 0);
  const percentSpent = calculateUsagePercent(totalSpent, totalAllocated);

  const handleCreateBudget = (e) => {
    e.preventDefault();
    if (!newCat || !newAllocated || Number(newAllocated) <= 0) return;

    setBudgets(prev => [
      ...prev,
      {
        id: `b-${Date.now()}`,
        category: newCat,
        allocated: Number(newAllocated),
        spent: 0,
        cycle: newCycle,
        mode: mode
      }
    ]);

    setNewCat('');
    setNewAllocated('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              {mode === 'personal' ? 'Personal & Family Budget' : 'Departmental Budget Controls'}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Smart Budget & Spending Limits</h2>
          <p className="text-xs text-slate-400">
            Zibi enforces spending caps and warns you before executing purchases that exceed your threshold.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget Limit</span>
        </button>
      </div>

      {/* Overall Progress Gauge Card */}
      <div className="p-6 rounded-3xl bg-[#131A29] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Allocated Cap</span>
            <div className="text-3xl font-mono font-extrabold text-white">₦{totalAllocated.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400">Total Spent to Date</span>
            <div className="text-2xl font-mono font-bold text-purple-400">₦{totalSpent.toLocaleString()}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Overall Budget Usage</span>
            <span className="font-bold text-white">{percentSpent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                percentSpent > 85 ? 'bg-rose-500' : percentSpent > 65 ? 'bg-amber-500' : 'bg-gradient-to-r from-purple-500 to-cyan-400'
              }`}
              style={{ width: `${Math.min(100, percentSpent)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-purple-400" />
          <span>Active Budget Categories</span>
        </h3>

        {filteredBudgets.length === 0 && (
          <div className="p-8 rounded-2xl bg-[#131A29] border border-dashed border-slate-800 text-center space-y-2">
            <p className="text-sm text-slate-300 font-semibold">No budget categories yet for {mode === 'personal' ? 'Personal' : 'Business'} mode.</p>
            <p className="text-xs text-slate-500">Create one to have Zibi enforce a spending cap automatically.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBudgets.map((b) => {
            const usagePct = calculateUsagePercent(b.spent, b.allocated);
            return (
              <div key={b.id} className="p-5 rounded-2xl bg-[#131A29] border border-slate-800 space-y-3 hover:border-purple-500/40 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">{b.cycle}</span>
                    <h4 className="text-sm font-bold text-white">{b.category}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    usagePct > 80 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {usagePct}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Spent: ₦{b.spent.toLocaleString()}</span>
                    <span className="text-slate-200 font-bold">Cap: ₦{b.allocated.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usagePct > 80 ? 'bg-rose-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${Math.min(100, usagePct)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Remaining: <strong className="text-white font-mono">₦{(b.allocated - b.spent).toLocaleString()}</strong></span>
                  <button 
                    onClick={() => toast(`Zibi setting automated alert cap for ${b.category}...`, 'info')}
                    className="text-purple-400 font-semibold hover:underline"
                  >
                    Adjust Cap
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for New Budget */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onMouseDown={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <form onSubmit={handleCreateBudget} className="w-full max-w-md bg-[#131A29] border border-purple-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New Budget Cap</h3>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold">Category Name</label>
              <input
                type="text"
                placeholder="e.g., Household Organic Groceries or Cloud Servers"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold">Allocated Cap Amount (₦)</label>
              <input
                type="number"
                placeholder="500000"
                min="1"
                step="1"
                value={newAllocated}
                onChange={(e) => setNewAllocated(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold">Renewal Cycle</label>
              <select
                value={newCycle}
                onChange={(e) => setNewCycle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
              >
                Save Budget Cap
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
