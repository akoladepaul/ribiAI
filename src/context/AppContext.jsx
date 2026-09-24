import React, { createContext, useContext, useState, useEffect } from 'react';
import { findMatchingBudget } from '../utils/permissions';
import { toast } from '../utils/toast';
import { api } from '../services/backendClient';
import { useAuth } from './AuthContext';

const mapBackendOrder = (o) => ({
  id: o.display_id,
  date: (o.created_at || '').split(' ')[0],
  item: o.item,
  category: o.category,
  mode: o.mode,
  amount: o.amount_kobo / 100,
  status: o.status,
  vendor: o.vendor,
  address: o.address,
  paymentMethod: o.payment_method === 'wallet' ? 'Zibi Pre-funded Wallet' : 'Corporate Visa Card (**4921)'
});

const AppContext = createContext();

export const initialAddresses = [
  { id: 'addr-1', label: 'Home', address: '12 Admiralty Way, Lekki Phase 1', city: 'Lagos', country: 'Nigeria', isDefault: true, recipient: 'Alex Morgan (+234 801 234 5678)' },
  { id: 'addr-2', label: 'Office / HQ', address: '45 Marina Street, Financial District', city: 'Lagos', country: 'Nigeria', isDefault: false, recipient: 'Procurement Dept (+234 802 345 6789)' },
  { id: 'addr-3', label: 'Abuja Regional Office', address: 'Plot 782 Constitution Ave, Central Business District', city: 'Abuja', country: 'Nigeria', isDefault: false, recipient: 'Logistics Manager (+234 803 456 7890)' },
  { id: 'addr-4', label: 'Parents Home', address: '18 Aba Road, GRA', city: 'Port Harcourt', country: 'Nigeria', isDefault: false, recipient: 'Chief & Mrs Morgan (+234 804 567 8901)' }
];

export const initialConnectors = [
  { id: 'jumia', name: 'Jumia Nigeria', type: 'Marketplace', status: 'connected', latency: '42ms', active: true, region: 'NG', priority: 'High' },
  { id: 'konga', name: 'Konga Direct', type: 'Marketplace', status: 'connected', latency: '65ms', active: true, region: 'NG', priority: 'High' },
  { id: 'amazon', name: 'Amazon Global Store', type: 'International', status: 'connected', latency: '120ms', active: true, region: 'US/UK', priority: 'Medium' },
  { id: 'shopify', name: 'Independent Retailers (Shopify MCP)', type: 'Brand Stores', status: 'connected', latency: '88ms', active: true, region: 'Global', priority: 'High' },
  { id: 'pharmacy', name: 'HealthPlus & Medplus Network', type: 'Pharmacy & Health', status: 'connected', latency: '50ms', active: true, region: 'NG', priority: 'High' },
  { id: 'alibaba', name: 'Alibaba B2B Wholesale', type: 'B2B Procurement', status: 'connected', latency: '180ms', active: true, region: 'Global', priority: 'High' }
];

export const initialBudgets = [
  { id: 'b-1', category: 'Personal Groceries & Food', allocated: 250000, spent: 145000, cycle: 'Monthly', mode: 'personal' },
  { id: 'b-2', category: 'Tech & Gadgets', allocated: 2000000, spent: 850000, cycle: 'Quarterly', mode: 'personal' },
  { id: 'b-3', category: 'Family Health & Prescriptions', allocated: 150000, spent: 65000, cycle: 'Monthly', mode: 'personal' },
  { id: 'b-4', category: 'IT & Equipment (Office)', allocated: 15000000, spent: 6200000, cycle: 'Quarterly', mode: 'business' },
  { id: 'b-5', category: 'Office Supplies & Stationeries', allocated: 500000, spent: 210000, cycle: 'Monthly', mode: 'business' },
  { id: 'b-6', category: 'Staff Swag & Merch', allocated: 1200000, spent: 450000, cycle: 'Monthly', mode: 'business' }
];

export const initialWishlist = [
  {
    id: 'w-1',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Electronics',
    currentPrice: 720000,
    originalPrice: 850000,
    targetPrice: 700000,
    bestStore: 'Konga Official',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
    priceDrop: true,
    dropPercentage: 15,
    location: 'Lagos (1-day delivery)',
    inStock: true
  },
  {
    id: 'w-2',
    name: 'Ergonomic Mesh Office Chair (High Back)',
    category: 'Furniture',
    currentPrice: 280000,
    originalPrice: 320000,
    targetPrice: 250000,
    bestStore: 'Workplace Depot NG',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&auto=format&fit=crop&q=60',
    priceDrop: true,
    dropPercentage: 12.5,
    location: 'Abuja Warehouse',
    inStock: true
  },
  {
    id: 'w-3',
    name: 'MacBook Pro 16" M4 Max 36GB RAM',
    category: 'Tech',
    currentPrice: 4200000,
    originalPrice: 4500000,
    targetPrice: 4000000,
    bestStore: 'iStore Nigeria',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60',
    priceDrop: false,
    dropPercentage: 0,
    location: 'UK Import (5 days)',
    inStock: true
  }
];

export const initialOrders = [
  {
    id: 'ORD-8942',
    date: '2026-09-18',
    item: 'Dell XPS 15 32GB RAM Touchscreen',
    mode: 'personal',
    amount: 1850000,
    status: 'Delivered',
    vendor: 'Jumia Tech',
    address: '12 Admiralty Way, Lekki Phase 1',
    paymentMethod: 'Zibi Pre-funded Wallet'
  },
  {
    id: 'ORD-8943',
    date: '2026-09-20',
    item: '50x Branded Crewneck Sweatshirts',
    mode: 'business',
    amount: 950000,
    status: 'In Transit',
    vendor: 'Alibaba B2B Merchant',
    address: '45 Marina Street, Financial District',
    paymentMethod: 'Corporate Virtual Visa (**4921)'
  }
];

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState('personal'); // 'personal' | 'business'
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'procurement' | 'budgets' | 'wishlist' | 'wallet' | 'connectors' | 'addresses'
  
  // Wallet & Permissions
  const [walletBalance, setWalletBalance] = useState(1450000); // ₦1.45m
  const [savedCards, setSavedCards] = useState([
    { id: 'card-1', brand: 'Visa', last4: '4921', expiry: '12/28', name: 'Alex Morgan', isDefault: true },
    { id: 'card-2', brand: 'Mastercard', last4: '8830', expiry: '09/27', name: 'Zibi Corporate Acct', isDefault: false }
  ]);
  const [permissions, setPermissions] = useState({
    autoApproveLimit: 50000, // Items under ₦50k are auto-purchased if requested
    requireApprovalAbove: 100000, // Items above ₦100k require explicit approval modal
    requireApprovalCategories: ['electronics', 'b2b_bulk', 'luxury'],
    autoBuyGroceries: true,
    autoBuySupplements: true,
    notifyPriceDrop: true
  });

  // Master Data
  const [addresses, setAddresses] = useState(initialAddresses);
  const [connectors, setConnectors] = useState(initialConnectors);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [orders, setOrders] = useState(initialOrders);

  // Active Pending Purchase Approval Modal
  const [pendingApproval, setPendingApproval] = useState(null);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const triggerPWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      toast("Zibi is ready to install! On iOS, tap Share -> Add to Home Screen. On Desktop Chrome, click the install icon in the URL bar.", 'info');
    }
  };

  // Signed-in users get their real wallet balance + order history from the
  // backend instead of the local demo data. Logging out reverts to the demo.
  useEffect(() => {
    if (!user) {
      setWalletBalance(1450000);
      setOrders(initialOrders);
      return;
    }

    (async () => {
      try {
        const wallet = await api.get('/api/wallet/balance');
        setWalletBalance(wallet.balanceNgn);
        const backendOrders = await api.get('/api/orders');
        setOrders(backendOrders.map(mapBackendOrder));
      } catch (err) {
        console.warn('Failed to sync with backend:', err);
        toast('Could not reach the Zibi backend — showing local demo data instead.', 'warning');
      }
    })();
  }, [user]);

  // Add order helper. Signed-in users get a real backend order + wallet
  // debit (only when paying by wallet — a card payment must not touch
  // wallet balance); guests get the local demo simulation, including
  // best-effort budget-category matching (budgets aren't tracked server-side).
  const addOrder = async (newOrder) => {
    if (user) {
      const res = await api.post('/api/orders', {
        item: newOrder.item,
        category: newOrder.category,
        mode: newOrder.mode,
        amountNgn: newOrder.amount,
        vendor: newOrder.vendor,
        address: newOrder.address,
        paymentMethod: newOrder.paymentMethod === 'Zibi Pre-funded Wallet' ? 'wallet' : 'card'
      });
      setOrders(prev => [mapBackendOrder(res.order), ...prev]);
      setWalletBalance(res.walletBalanceKobo / 100);
      return;
    }

    setOrders(prev => [newOrder, ...prev]);

    if (newOrder.paymentMethod === 'Zibi Pre-funded Wallet') {
      setWalletBalance(prev => Math.max(0, prev - newOrder.amount));
    }

    const matchingBudget = findMatchingBudget(budgets, newOrder.mode, newOrder.category);
    if (matchingBudget) {
      setBudgets(prev => prev.map(b =>
        b.id === matchingBudget.id ? { ...b, spent: b.spent + newOrder.amount } : b
      ));
    }
  };

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        activeTab,
        setActiveTab,
        walletBalance,
        setWalletBalance,
        savedCards,
        setSavedCards,
        permissions,
        setPermissions,
        addresses,
        setAddresses,
        connectors,
        setConnectors,
        budgets,
        setBudgets,
        wishlist,
        setWishlist,
        orders,
        setOrders,
        pendingApproval,
        setPendingApproval,
        deferredPrompt,
        isAppInstalled,
        triggerPWAInstall,
        addOrder
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
