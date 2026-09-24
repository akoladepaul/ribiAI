import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Truck,
  CheckCircle2,
  Download,
  Plus,
  Search
} from 'lucide-react';
import { toast } from '../utils/toast';

export const BusinessProcurementView = () => {
  const { orders, mode, setMode } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const allBusinessOrders = orders.filter(o => o.mode === 'business');
  const businessOrders = allBusinessOrders.filter(o => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return o.id.toLowerCase().includes(query) || o.item.toLowerCase().includes(query);
  });

  const rfqs = [
    {
      id: 'RFQ-2041',
      title: '50x Ergonomic Office Mesh Chairs (High Back)',
      department: 'IT & Facilities',
      budgetAllocated: 15000000,
      lowestQuote: 14000000,
      bidsCount: 3,
      status: 'Quotes Ready',
      deadline: '2026-09-28'
    },
    {
      id: 'RFQ-2042',
      title: '100x Branded Employee Onboarding Welcome Kits',
      department: 'HR & Marketing',
      budgetAllocated: 2500000,
      lowestQuote: 2100000,
      bidsCount: 4,
      status: 'Vendor Selected',
      deadline: '2026-10-05'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold uppercase tracking-wider">
              Corporate Procurement Portal
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Purchase Requisitions & B2B Orders</h2>
          <p className="text-xs text-slate-400">
            Automate RFQ generation, supplier price comparisons, department budget enforcement, and invoice archiving.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'personal' && (
            <button
              onClick={() => setMode('business')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
            >
              Switch to Business Mode
            </button>
          )}
          <button 
            onClick={() => toast("Creating new RFQ Requisition form...", 'info')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New RFQ</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#131A29] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Active POs</span>
          <div className="text-2xl font-mono font-extrabold text-white">{allBusinessOrders.length + 1} Orders</div>
          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> All vendors SLA verified
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131A29] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Quarterly Spent</span>
          <div className="text-2xl font-mono font-extrabold text-cyan-400">₦7,150,000</div>
          <span className="text-[10px] text-slate-400 font-medium">Out of ₦16,700,000 allocated</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131A29] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Active RFQs</span>
          <div className="text-2xl font-mono font-extrabold text-purple-400">{rfqs.length} Live Quotes</div>
          <span className="text-[10px] text-purple-300 font-medium">Avg response time: 2.4 hrs</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131A29] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Verified Suppliers</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-400">14 Partners</div>
          <span className="text-[10px] text-slate-400 font-medium">Jumia B2B, Alibaba, Local OEMs</span>
        </div>
      </div>

      {/* Active RFQ Quotes Section */}
      <div className="p-5 rounded-3xl bg-[#131A29] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Active Requests for Quotation (RFQs)</span>
          </h3>
          <button
            onClick={() => toast(`All ${rfqs.length} active RFQs are listed below.`, 'info')}
            className="text-xs text-cyan-400 font-semibold hover:underline"
          >
            View All RFQs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-cyan-500/40 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                    {rfq.id}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5">{rfq.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Dept: {rfq.department}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  {rfq.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-400 block text-[10px]">Lowest Vendor Quote</span>
                  <span className="font-mono font-bold text-white text-sm">₦{rfq.lowestQuote.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Received Bids</span>
                  <span className="font-bold text-cyan-400">{rfq.bidsCount} Vendor Quotations</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-5 rounded-3xl bg-[#131A29] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-400" />
            <span>Procurement Order Log & Delivery Tracker</span>
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PO # or item..."
                className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-48"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">PO Number</th>
                <th className="p-3">Item Description</th>
                <th className="p-3">Vendor / Supplier</th>
                <th className="p-3">Amount (₦)</th>
                <th className="p-3">Delivery Address</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {businessOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No purchase orders match &quot;{searchQuery}&quot;.
                  </td>
                </tr>
              )}
              {businessOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-cyan-400">{ord.id}</td>
                  <td className="p-3 font-bold text-white max-w-xs truncate">{ord.item}</td>
                  <td className="p-3">{ord.vendor}</td>
                  <td className="p-3 font-mono font-bold text-slate-100">₦{ord.amount.toLocaleString()}</td>
                  <td className="p-3 text-slate-400 max-w-xs truncate">{ord.address}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      ord.status === 'Delivered'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => toast(`Downloading official PDF Invoice for ${ord.id}...`, 'info')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px]">PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
