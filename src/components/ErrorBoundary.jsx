import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Zibi crashed:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const card = (
      <div className="max-w-sm w-full text-center space-y-4 p-8 rounded-3xl bg-[#131A29] border border-rose-500/30">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-lg font-bold text-white">Something went wrong</h1>
        <p className="text-xs text-slate-400">
          {this.props.fullScreen
            ? 'Zibi hit an unexpected error. Reloading usually fixes it; your data lives only in this browser tab, so nothing was lost on a remote server.'
            : 'This screen ran into an error. Try another tab, or reload the app.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Zibi</span>
        </button>
      </div>
    );

    if (this.props.fullScreen) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-slate-100 p-6">
          {card}
        </div>
      );
    }

    return <div className="flex items-center justify-center p-10">{card}</div>;
  }
}
