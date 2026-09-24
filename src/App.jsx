import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/backendClient';
import { toast } from './utils/toast';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { BusinessProcurementView } from './components/BusinessProcurementView';
import { BudgetManager } from './components/BudgetManager';
import { WishlistMonitor } from './components/WishlistMonitor';
import { WalletPermissions } from './components/WalletPermissions';
import { AddressManager } from './components/AddressManager';
import { ConnectorMarketplace } from './components/ConnectorMarketplace';
import { ApprovalModal } from './components/ApprovalModal';
import { ToastContainer } from './components/ToastContainer';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ErrorBoundary } from './components/ErrorBoundary';

// After a Paystack/Stripe redirect back to the app, verify the payment and
// credit the wallet. Handles both the webhook-less local-dev case and acts
// as a fast confirmation even when the webhook also fires (idempotent).
const usePaymentRedirectHandler = () => {
  const { user } = useAuth();
  const { setWalletBalance } = useApp();

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const walletFunded = params.get('wallet_funded');
    if (!walletFunded || walletFunded === 'cancelled') return;

    (async () => {
      try {
        let result;
        if (walletFunded === 'paystack') {
          const reference = params.get('reference');
          result = await api.get(`/api/wallet/paystack/verify/${reference}`);
        } else if (walletFunded === 'stripe') {
          const sessionId = params.get('session_id');
          result = await api.get(`/api/wallet/stripe/verify/${sessionId}`);
        }
        if (result) {
          setWalletBalance(result.balanceKobo / 100);
          toast('Payment confirmed — your wallet has been credited.', 'success');
        }
      } catch (err) {
        toast(err.message || 'Could not confirm payment status.', 'warning');
      } finally {
        window.history.replaceState({}, '', window.location.pathname);
      }
    })();
  }, [user, setWalletBalance]);
};

const MainLayout = () => {
  const { activeTab } = useApp();
  usePaymentRedirectHandler();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatView />;
      case 'procurement':
        return <BusinessProcurementView />;
      case 'budgets':
        return <BudgetManager />;
      case 'wishlist':
        return <WishlistMonitor />;
      case 'wallet':
        return <WalletPermissions />;
      case 'addresses':
        return <AddressManager />;
      case 'connectors':
        return <ConnectorMarketplace />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-6">
          <ErrorBoundary key={activeTab}>{renderTabContent()}</ErrorBoundary>
        </main>
      </div>
      <ApprovalModal />
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary fullScreen>
      <AuthProvider>
        <AppProvider>
          <MainLayout />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
