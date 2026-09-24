import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { subscribeConfirm } from '../utils/confirm';
import { useEscapeKey } from '../utils/useEscapeKey';

export const ConfirmDialog = () => {
  const [request, setRequest] = useState(null);

  useEffect(() => subscribeConfirm(setRequest), []);

  const respond = (value) => {
    request.resolve(value);
    setRequest(null);
  };

  // Escape and clicking the backdrop both count as "Cancel" — never as the
  // destructive confirmation, which must always be an explicit click.
  useEscapeKey(() => respond(false), Boolean(request));

  if (!request) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && respond(false)}
    >
      <div className="w-full max-w-sm bg-[#131A29] border border-rose-500/30 rounded-2xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Are you sure?</h3>
        </div>
        <p className="text-xs text-slate-400">{request.message}</p>
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => respond(false)}
            className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => respond(true)}
            className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
