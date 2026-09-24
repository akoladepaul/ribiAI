import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cpu, Plus } from 'lucide-react';
import { useEscapeKey } from '../utils/useEscapeKey';

export const ConnectorMarketplace = () => {
  const { connectors, setConnectors } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  useEscapeKey(() => setShowAddModal(false), showAddModal);
  const [name, setName] = useState('');
  const [type, setType] = useState('Marketplace');

  const toggleConnector = (id) => {
    setConnectors(prev => prev.map(c => ({
      ...c,
      active: c.id === id ? !c.active : c.active
    })));
  };

  const handleAddConnector = (e) => {
    e.preventDefault();
    if (!name) return;

    setConnectors(prev => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        name: name,
        type: type,
        status: 'connected',
        latency: '35ms',
        active: true,
        region: 'Custom API Feed',
        priority: 'High'
      }
    ]);

    setName('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60 border border-cyan-500/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" /> Commerce Connectivity Layer (MCP)
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">E-Commerce Merchant Connectors</h2>
          <p className="text-xs text-slate-400">
            Platforms and merchants expose product feeds, inventory, and order fulfillment APIs to Zibi for priority search and zero-friction purchase execution.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Connect MCP Server</span>
        </button>
      </div>

      {/* Connectors Grid */}
      {connectors.length === 0 && (
        <div className="p-8 rounded-3xl bg-[#131A29] border border-dashed border-slate-800 text-center space-y-2">
          <p className="text-sm text-slate-300 font-semibold">No commerce connectors yet.</p>
          <p className="text-xs text-slate-500">Connect a merchant or marketplace feed to let Zibi search it.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((c) => (
          <div
            key={c.id}
            className={`p-5 rounded-3xl bg-[#131A29] border transition-all flex flex-col justify-between space-y-4 ${
              c.active ? 'border-cyan-500/40 shadow-lg shadow-cyan-950/20' : 'border-slate-800 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-cyan-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {c.type}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1.5">{c.name}</h4>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${c.active ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Latency</span>
                  <span className="font-mono font-bold text-slate-200">{c.latency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Region / Origin</span>
                  <span className="font-medium text-slate-200">{c.region}</span>
                </div>
                <div className="flex justify-between">
                  <span>Priority Feed</span>
                  <span className="font-semibold text-purple-400">{c.priority}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400">
                {c.active ? 'Live Syncing' : 'Paused'}
              </span>
              <button
                onClick={() => toggleConnector(c.id)}
                aria-label={`${c.active ? 'Pause' : 'Enable'} ${c.name}`}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  c.active
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {c.active ? 'Active' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onMouseDown={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <form onSubmit={handleAddConnector} className="w-full max-w-md bg-[#131A29] border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Connect E-Commerce MCP Endpoint</h3>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold">Platform or Merchant Name</label>
              <input
                type="text"
                placeholder="e.g., Slot Nigeria API or Custom Shopify Store"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold">Integration Protocol</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Marketplace">Marketplace API</option>
                <option value="Brand Store">Direct Brand Store (Shopify/WooCommerce)</option>
                <option value="B2B Wholesale">B2B Wholesale Directory</option>
                <option value="Pharmacy">Pharmacy & Healthcare Network</option>
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
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30"
              >
                Establish Connection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
