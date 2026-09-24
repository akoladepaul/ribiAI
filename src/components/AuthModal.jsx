import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';
import { useEscapeKey } from '../utils/useEscapeKey';

export const AuthModal = ({ onClose }) => {
  useEscapeKey(onClose);
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast('Signed in — your wallet is now backed by the real Zibi backend.', 'success');
      } else {
        await register(email, password, name);
        toast('Account created — you can now fund your wallet with real payments.', 'success');
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // Rendered via a portal to <body> because this modal is invoked both from
  // Header (which is `sticky` + `backdrop-blur-xl` — a CSS backdrop-filter on
  // an ancestor creates a new containing block for `position: fixed`
  // descendants, pinning the modal to the header's small box instead of the
  // viewport) and from WalletPermissions. A portal sidesteps that entirely.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-[#131A29] border border-purple-500/30 rounded-3xl p-6 space-y-4 shadow-2xl relative">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          {mode === 'login' ? <LogIn className="w-5 h-5 text-purple-400" /> : <UserPlus className="w-5 h-5 text-purple-400" />}
          <h3 className="text-lg font-bold text-white">{mode === 'login' ? 'Sign in to Zibi' : 'Create your Zibi account'}</h3>
        </div>
        <p className="text-xs text-slate-400">
          Signing in switches your wallet from the local demo simulation to the real backend — funded with actual Paystack/Stripe payments.
        </p>

        {mode === 'register' && (
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              required
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs text-slate-300 font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-300 font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
        >
          {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-200"
        >
          {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>,
    document.body
  );
};
