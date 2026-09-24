import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Plus, CheckCircle2, User, Trash2 } from 'lucide-react';
import { confirmAction } from '../utils/confirm';
import { toast } from '../utils/toast';
import { useEscapeKey } from '../utils/useEscapeKey';

export const AddressManager = () => {
  const { addresses, setAddresses } = useApp();
  const [showModal, setShowModal] = useState(false);
  useEscapeKey(() => setShowModal(false), showModal);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!label || !address) return;

    setAddresses(prev => [
      ...prev,
      {
        id: `addr-${Date.now()}`,
        label: label,
        address: address,
        city: city || 'Lagos',
        country: 'Nigeria',
        isDefault: false,
        recipient: recipient || 'Alex Morgan'
      }
    ]);

    setLabel('');
    setAddress('');
    setCity('');
    setRecipient('');
    setShowModal(false);
  };

  const setDefault = (id) => {
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
  };

  const deleteAddress = async (addr) => {
    const ok = await confirmAction(`Remove "${addr.label}" (${addr.address}, ${addr.city}) from your saved delivery locations?`);
    if (!ok) return;
    setAddresses(prev => prev.filter(a => a.id !== addr.id));
    toast(`Removed "${addr.label}" from saved addresses.`, 'info');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-purple-950/60 border border-rose-500/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-400" /> Multi-Location Delivery Hub
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Saved Delivery Locations</h2>
          <p className="text-xs text-slate-400">
            Save multiple addresses (Home, Office, Regional Warehouses, Family) so Zibi knows exactly where to ship.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Address Cards Grid */}
      {addresses.length === 0 && (
        <div className="p-8 rounded-3xl bg-[#131A29] border border-dashed border-slate-800 text-center space-y-2">
          <p className="text-sm text-slate-300 font-semibold">No saved delivery locations yet.</p>
          <p className="text-xs text-slate-500">Add one so Zibi knows where to ship your orders.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-5 rounded-3xl bg-[#131A29] border transition-all flex flex-col justify-between space-y-4 ${
              addr.isDefault ? 'border-rose-500/50 shadow-xl shadow-rose-950/20' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{addr.label}</h4>
                </div>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Default Shipping
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">{addr.address}, {addr.city}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Recipient: <strong className="text-slate-200">{addr.recipient}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              {!addr.isDefault ? (
                <button
                  onClick={() => setDefault(addr.id)}
                  className="text-slate-400 hover:text-white font-medium"
                >
                  Set as Default
                </button>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Primary Destination
                </span>
              )}

              <button
                onClick={() => deleteAddress(addr)}
                aria-label={`Delete ${addr.label}`}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onMouseDown={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <form onSubmit={handleAddAddress} className="w-full max-w-md bg-[#131A29] border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add Saved Delivery Address</h3>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold">Location Label</label>
              <input
                type="text"
                placeholder="e.g., Lekki House or Victoria Island Factory"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold">Full Street Address</label>
              <input
                type="text"
                placeholder="24 Admiralty Way"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold">City</label>
              <input
                type="text"
                placeholder="Lagos or Abuja"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold">Contact Recipient Name & Phone</label>
              <input
                type="text"
                placeholder="Alex Morgan (+234 801 234 5678)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
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
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
