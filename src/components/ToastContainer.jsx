import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { subscribeToast } from '../utils/toast';

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info
};

const STYLES = {
  success: 'border-emerald-500/30 text-emerald-300',
  warning: 'border-amber-500/30 text-amber-300',
  info: 'border-purple-500/30 text-purple-300'
};

const AUTO_DISMISS_MS = 4000;

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const scheduleDismiss = useCallback((id) => {
    timers.current[id] = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
  }, [dismiss]);

  useEffect(() => {
    return subscribeToast((entry) => {
      setToasts((prev) => [...prev, entry]);
      scheduleDismiss(entry.id);
    });
  }, [scheduleDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-xs"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div
            key={t.id}
            onMouseEnter={() => clearTimeout(timers.current[t.id])}
            onMouseLeave={() => scheduleDismiss(t.id)}
            className={`flex items-start gap-2.5 p-3.5 rounded-xl bg-[#131A29] border shadow-xl text-xs font-medium animate-fade-in ${STYLES[t.type] || STYLES.info}`}
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1 text-slate-200">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
