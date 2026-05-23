import { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Search, ShoppingCart, User as UserIcon, LogOut,
  Settings, CreditCard, ClipboardList, Package, Users,
  History, Wifi, WifiOff, X, Check, Save, RotateCcw,
  Sun, Moon, Zap, Crown, Eye, EyeOff, ArrowDown, Printer,
  TrendingUp, Trash2, FileText, Download, Share, BarChart2, Play,
  Sparkles, SlidersHorizontal, Upload, AlertTriangle, CheckCircle2,
  Maximize2, Minimize2, Calendar, Phone, Clock
} from 'lucide-react';
import { PinPad } from './components/PinPad';
import { TransactionModal } from './components/TransactionModal';
import { Receipt } from './components/Receipt';
import { CustomerInvoice } from './components/CustomerInvoice';
import { TrialWarningModal } from './components/TrialWarningModal';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { ConfirmDialog, DialogState } from './components/ConfirmDialog';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { SubscriptionPage } from './components/SubscriptionPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { SettingsPanel, POSSettings, DEFAULT_SETTINGS } from './components/SettingsPanel';
import { BIChat } from './components/BIChat';
import { OwnerDashboard, isMadisAdmin } from './components/OwnerDashboard';
import { usePOSData } from './hooks/usePOSData';
import { useAuth } from './hooks/useAuth';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { hashPin } from './lib/crypto';
import { User, UserRole, TabStatus, Product, TabItem, Tab, ProductType, Room, Invoice, InvoiceStatus, Appointment } from './types';
import {
  demoStaff, demoInventory, demoTabs, demoAuditLogs, demoRooms,
  DEMO_BUSINESS_NAME, DEMO_BUSINESS_TYPE, DEMO_UID
} from './demo/demoData';
import {
  demoSpaStaff, demoSpaInventory, demoSpaTabs, demoSpaAuditLogs, demoSpaRooms,
  DEMO_SPA_BUSINESS_NAME, DEMO_SPA_BUSINESS_TYPE, DEMO_SPA_UID, DEMO_SPA_OWNER_NAME
} from './demo/demoDataSpa';
import {
  demoGymStaff, demoGymInventory, demoGymTabs, demoGymAuditLogs, demoGymRooms,
  DEMO_GYM_BUSINESS_NAME, DEMO_GYM_BUSINESS_TYPE, DEMO_GYM_UID, DEMO_GYM_OWNER_NAME
} from './demo/demoDataGym';

// ── Top-level router ──────────────────────────────────────────────────────────
export default function App() {
  const auth = useAuth();
  const [demoType, setDemoType] = useState<'bar' | 'spa' | 'gym' | null>(null);

  if (demoType === 'bar') {
    return (
      <POSApp
        uid={DEMO_UID}
        businessType={DEMO_BUSINESS_TYPE}
        businessName={DEMO_BUSINESS_NAME}
        ownerName="Demo Owner"
        onLogout={() => setDemoType(null)}
        isDemo={true}
        demoData={{ staff: demoStaff, inventory: demoInventory, tabs: demoTabs, auditLogs: demoAuditLogs, rooms: demoRooms }}
      />
    );
  }

  if (demoType === 'spa') {
    return (
      <POSApp
        uid={DEMO_SPA_UID}
        businessType={DEMO_SPA_BUSINESS_TYPE}
        businessName={DEMO_SPA_BUSINESS_NAME}
        ownerName={DEMO_SPA_OWNER_NAME}
        onLogout={() => setDemoType(null)}
        isDemo={true}
        demoData={{ staff: demoSpaStaff, inventory: demoSpaInventory, tabs: demoSpaTabs, auditLogs: demoSpaAuditLogs, rooms: demoSpaRooms }}
      />
    );
  }

  if (demoType === 'gym') {
    return (
      <POSApp
        uid={DEMO_GYM_UID}
        businessType={DEMO_GYM_BUSINESS_TYPE}
        businessName={DEMO_GYM_BUSINESS_NAME}
        ownerName={DEMO_GYM_OWNER_NAME}
        onLogout={() => setDemoType(null)}
        isDemo={true}
        demoData={{ staff: demoGymStaff, inventory: demoGymInventory, tabs: demoGymTabs, auditLogs: demoGymAuditLogs, rooms: demoGymRooms }}
      />
    );
  }

  if (auth.isLoading) {
    return null;
  }

  if (auth.screen === 'landing' || auth.screen === 'auth') {
    return <LandingPageRouter auth={auth} onDemo={(type: 'bar' | 'spa' | 'gym') => setDemoType(type)} />;
  }

  // MADIS platform admin — bypass all subscriber flows
  if (auth.firebaseUser && isMadisAdmin(auth.firebaseUser.email)) {
    return <OwnerDashboard email={auth.firebaseUser.email!} onLogout={auth.logout} />;
  }

  if (auth.screen === 'subscription') {
    return (
      <SubscriptionPage
        email={auth.firebaseUser?.email || ''}
        onActivate={auth.activateSubscription}
        onLogout={auth.logout}
        error={auth.error}
        clearError={auth.clearError}
        trialExpired={auth.profile?.subscriptionStatus === 'trial'}
      />
    );
  }

  if (auth.screen === 'business-select') {
    return (
      <OnboardingWizard
        email={auth.firebaseUser?.email || ''}
        onSave={auth.saveBusinessProfile}
        onLogout={auth.logout}
        error={auth.error}
        clearError={auth.clearError}
      />
    );
  }

  if (auth.screen === 'pos' && auth.firebaseUser && auth.profile) {
    return (
      <POSApp
        uid={auth.firebaseUser.uid}
        businessType={auth.profile.businessType}
        businessName={auth.profile.businessName}
        ownerName={auth.profile.ownerName}
        onLogout={auth.logout}
        trialDaysLeft={auth.trialDaysLeft}
        onSubscribeNow={auth.navigateToSubscription}
        onResetPassword={auth.resetPassword}
        ownerEmail={auth.firebaseUser?.email || ''}
      />
    );
  }

  return (
    <LandingPageRouter auth={auth} onDemo={(type: 'bar' | 'spa' | 'gym') => setDemoType(type)} />
  );
}

function LandingPageRouter({ auth, onDemo }: { auth: any; onDemo: (type: 'bar' | 'spa' | 'gym') => void }) {
  const [authMode, setAuthMode] = useState<'hidden' | 'signin' | 'signup'>('hidden');

  if (authMode !== 'hidden') {
    return (
      <AuthPage
        mode={authMode === 'signin' ? 'signin' : 'signup'}
        onSignInWithEmail={auth.signInWithEmail}
        onSignUpWithEmail={auth.signUpWithEmail}
        onSignInWithGoogle={auth.signInWithGoogle}
        onResetPassword={auth.resetPassword}
        onBack={() => setAuthMode('hidden')}
        error={auth.error}
        clearError={auth.clearError}
      />
    );
  }

  return (
    <LandingPage
      onGetStarted={() => setAuthMode('signup')}
      onSignIn={() => setAuthMode('signin')}
      onDemo={onDemo}
    />
  );
}

// ── POS Application ───────────────────────────────────────────────────────────
interface POSAppProps {
  uid: string;
  businessType: any;
  businessName: string;
  ownerName: string;
  onLogout: () => void;
  trialDaysLeft?: number | null;
  onSubscribeNow?: () => void;
  onResetPassword?: (email: string) => Promise<void>;
  ownerEmail?: string;
  isDemo?: boolean;
  demoData?: {
    staff: User[];
    inventory: Product[];
    tabs: Tab[];
    auditLogs: any[];
    rooms: Room[];
  };
}

function POSApp({ uid, businessType, businessName, ownerName, onLogout, trialDaysLeft, onSubscribeNow, onResetPassword, ownerEmail = '', isDemo = false, demoData }: POSAppProps) {
  const live = usePOSData(isDemo ? '__skip__' : uid, businessType);

  const staff       = isDemo ? (demoData?.staff       ?? []) : live.staff;
  const setStaff    = isDemo ? (_: any) => {}                : live.setStaff;
  const inventory   = isDemo ? (demoData?.inventory   ?? []) : live.inventory;
  const setInventory= isDemo ? (_: any) => {}                : live.setInventory;
  const [demoTabs,  setDemoTabsState] = useState<Tab[]>(demoData?.tabs ?? []);
  const tabs        = isDemo ? demoTabs                      : live.tabs;
  const setTabs     = isDemo ? setDemoTabsState              : live.setTabs;
  const deleteTab   = isDemo ? (_: string) => {}             : live.deleteTab;
  const rooms       = isDemo ? (demoData?.rooms       ?? []) : live.rooms;
  const setRooms    = isDemo ? (_: any) => {}                : live.setRooms;
  const auditLogs   = isDemo ? (demoData?.auditLogs   ?? []) : live.auditLogs;
  const addAuditLog = isDemo ? (_u: any, _a: string, _d: string) => {} : live.addAuditLog;
  const invoices      = isDemo ? ([] as Invoice[])            : live.invoices;
  const addInvoice    = isDemo ? async (_: any) => {}         : live.addInvoice;
  const updateInvoice = isDemo ? async (_: any) => {}         : live.updateInvoice;
  const deleteInvoice = isDemo ? async (_: string) => {}      : live.deleteInvoice;
  const isOnline    = isDemo ? true                          : live.isOnline;
  const isLoading   = isDemo ? false                         : live.isLoading;

  const { canInstall, isIOS, isInstalled, triggerInstall } = useInstallPrompt();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showIOSInstall, setShowIOSInstall] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'sales' | 'tabs' | 'inventory' | 'invoices' | 'staff' | 'audit' | 'debts' | 'rooms' | 'reports' | 'settings' | 'ai' | 'appointments'
  >('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const SETTINGS_KEY = `madis_settings_${uid}`;
  const [posSettings, setPosSettings] = useState<POSSettings>(() => {
    try {
      const saved = localStorage.getItem(`madis_settings_${uid}`);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });
  const saveSettings = (next: POSSettings) => {
    setPosSettings(next);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch {}
  };
  const lastActivityRef = useRef(Date.now());

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('madis_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'light' : 'dark';
  });

  const [dialog, setDialog] = useState<DialogState | null>(null);
  const closeDialog = () => setDialog(null);

  const TRIAL_WARN_KEY = `madis_trial_warn_dismissed_${uid}`;
  const [showTrialWarning, setShowTrialWarning] = useState(() => {
    if (!trialDaysLeft || trialDaysLeft > 3 || isDemo) return false;
    try {
      const dismissed = localStorage.getItem(TRIAL_WARN_KEY);
      if (!dismissed) return true;
      const parsed = JSON.parse(dismissed);
      return Date.now() - parsed.at > 8 * 60 * 60 * 1000;
    } catch { return true; }
  });

  const dismissTrialWarning = () => {
    setShowTrialWarning(false);
    try { localStorage.setItem(TRIAL_WARN_KEY, JSON.stringify({ at: Date.now() })); } catch {}
  };

  const [invoicePrintTab, setInvoicePrintTab] = useState<Tab | null>(null);

  const [isSalesFullscreen, setIsSalesFullscreen] = useState(false);
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setIsSalesFullscreen(false);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);
  const enterSalesFullscreen = async () => {
    try { await document.documentElement.requestFullscreen(); setIsSalesFullscreen(true); } catch {}
  };
  const exitSalesFullscreen = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); setIsSalesFullscreen(false); } catch {}
  };

  const handleRestockItem = (item: Product) => {
    setActiveTab('invoices');
    setEditingInvoice({ id: 'NEW', prefillItem: item } as any);
  };

  useEffect(() => {
    if (isDemo || !trialDaysLeft) return;
    const interval = setInterval(() => {
      if (trialDaysLeft !== null && trialDaysLeft <= 3 && !showTrialWarning) {
        try {
          const dismissed = localStorage.getItem(TRIAL_WARN_KEY);
          if (!dismissed) { setShowTrialWarning(true); return; }
          const parsed = JSON.parse(dismissed);
          if (Date.now() - parsed.at > 8 * 60 * 60 * 1000) setShowTrialWarning(true);
        } catch { setShowTrialWarning(true); }
      }
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [trialDaysLeft, isDemo, showTrialWarning]);

  const handlePrintCustomerInvoice = (tab: Tab) => {
    setInvoicePrintTab(tab);
    setTimeout(() => { window.print(); }, 100);
  };

  const [cart, setCart] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [overrideItem, setOverrideItem] = useState<TabItem | null>(null);
  const [printingTab, setPrintingTab] = useState<Tab | null>(null);
  const [showShiftSummary, setShowShiftSummary] = useState(false);
  const [shiftNote, setShiftNote] = useState('');
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const lockMins = posSettings.autoLockMinutes ?? 30;
    if (lockMins === 0) return; // "Never" — no auto-lock
    const timeout = lockMins * 60 * 1000;
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > timeout) {
        handleLogout();
      }
    }, 10000);
    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    window.addEventListener('click', updateActivity);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, posSettings.autoLockMinutes]);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    try { localStorage.setItem('madis_theme', theme); } catch {}
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        setShowScrollBottom(scrollTop + clientHeight < scrollHeight - 100);
      }
    };
    const el = scrollRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(inventory.map(item => item.category)));
  }, [inventory]);

  const isAppointmentBusiness = useMemo(() => {
    const apptTypes = ['gym', 'pharmacy', 'spa', 'salon', 'clinic', 'hospital'];
    return apptTypes.includes(String(businessType).toLowerCase());
  }, [businessType]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchQuery, selectedCategory]);

  const speedMenu = useMemo(() => {
    return inventory.filter(item => item.isQuickSell);
  }, [inventory]);

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'confirm' | 'danger' = 'confirm') => {
    setDialog({ title, message, type, onConfirm });
  };

  const showAlert = (title: string, message: string) => {
    setDialog({ title, message, type: 'alert', onConfirm: closeDialog });
  };

  useEffect(() => {
    if (lockoutUntil <= 0) return;
    const tick = setInterval(() => {
      const left = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (left <= 0) {
        setLockoutSecondsLeft(0);
        setLockoutUntil(0);
        setLoginAttempts(0);
        setLoginError('');
        clearInterval(tick);
      } else {
        setLockoutSecondsLeft(left);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [lockoutUntil]);

  const handleLogin = async (pin: string) => {
    if (Date.now() < lockoutUntil) return;
    const hashed = await hashPin(pin);
    const user = staff.find(u => u.pin === hashed) || staff.find(u => u.pin === pin);
    if (user) {
      setCurrentUser(user);
      setActiveTab('dashboard');
      setLoginError('');
      setLoginAttempts(0);
      setLockoutUntil(0);
      addAuditLog(user, 'Login', 'User logged in to terminal');
    } else {
      const next = loginAttempts + 1;
      setLoginAttempts(next);
      if (next >= 5) {
        const until = Date.now() + 60_000;
        setLockoutUntil(until);
        setLockoutSecondsLeft(60);
        setLoginError('Too many failed attempts. Locked for 60 seconds.');
      } else {
        setLoginError(`Invalid PIN. ${5 - next} attempt${5 - next === 1 ? '' : 's'} remaining.`);
      }
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      addAuditLog(currentUser, 'Logout', 'User logged out');
    }
    setCurrentUser(null);
    setCart([]);
    setActiveTabId(null);
    setCustomerName('');
    setDialog(null);
  };

  const clearCart = () => {
    if (cart.length > 0) {
      showConfirm(
        'Cancel Order',
        'Are you sure you want to cancel this entire order?',
        () => {
          setCart([]);
          setActiveTabId(null);
          setCustomerName('');
          addAuditLog(currentUser!, 'Order Cancelled', 'Staff cleared the current cart');
        },
        'danger'
      );
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        priceAtSale: Math.round(product.price)
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const handlePriceOverride = (productId: string, newPrice: number) => {
    if (String(currentUser?.role).toUpperCase() === UserRole.STAFF) return;
    setCart(prev =>
      prev.map(i =>
        i.productId === productId ? { ...i, priceAtSale: Math.round(newPrice) } : i
      )
    );
    setOverrideItem(null);
    addAuditLog(currentUser!, 'Price Override', `Changed price of item ${productId} to KES ${Math.round(newPrice)}`);
  };

  const deductStock = (items: TabItem[]) => {
    const updatedInventory = inventory.map(invItem => {
      const soldItem = items.find(i => i.productId === invItem.id);
      if (soldItem && invItem.type !== ProductType.SERVICE) {
        return { ...invItem, stock: Math.max(0, invItem.stock - soldItem.quantity) };
      }
      return invItem;
    });
    setInventory(updatedInventory);
  };

  const cartTotal = Math.round(cart.reduce((sum, item) => sum + item.priceAtSale * item.quantity, 0));

  const initiateTabCreation = (status: TabStatus) => {
    if (cart.length === 0) return;
    if (status === TabStatus.PAID) {
      setShowTransactionModal(true);
    } else {
      createTab(status);
    }
  };

  const updateRoomStatus = (roomNumber: string, status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE') => {
    setRooms(rooms.map((r: Room) => r.number === roomNumber ? { ...r, status } : r));
  };

  const createTab = (status: TabStatus = TabStatus.OPEN, mpesaPhone?: string) => {
    const finalCustomerName = selectedTable
      ? `Table ${selectedTable} - ${customerName || 'Guest'}`
      : customerName || 'Walk-in';

    const roomItems = cart.filter(item => {
      const invItem = inventory.find(i => i.id === item.productId);
      return invItem?.category === 'Rooms';
    });

    if (activeTabId) {
      const updatedTabs = tabs.map(t => {
        if (t.id === activeTabId) {
          return {
            ...t,
            customerName: finalCustomerName,
            items: cart,
            total: cartTotal,
            status: status === TabStatus.PAID ? TabStatus.PAID : t.status,
            mpesaPhone: mpesaPhone || t.mpesaPhone,
            paymentType: mpesaPhone ? 'M-Pesa' : status === TabStatus.PAID ? 'Cash' : t.paymentType,
            updatedAt: Date.now()
          };
        }
        return t;
      });
      setTabs(updatedTabs);

      if (status === TabStatus.PAID) {
        const tab = updatedTabs.find(t => t.id === activeTabId);
        if (tab) {
          deductStock(cart);
          handlePrint(tab);
          roomItems.forEach(ri => {
            const roomNum = ri.name.replace('Room ', '');
            updateRoomStatus(roomNum, 'AVAILABLE');
          });
        }
      } else {
        roomItems.forEach(ri => {
          const roomNum = ri.name.replace('Room ', '');
          updateRoomStatus(roomNum, 'OCCUPIED');
        });
      }

      addAuditLog(currentUser!, 'Tab Updated', `Updated tab for ${finalCustomerName}`);
    } else {
      const newTab: Tab = {
        id: crypto.randomUUID(),
        staffId: currentUser!.id,
        customerName: finalCustomerName,
        items: cart,
        total: cartTotal,
        status,
        mpesaPhone,
        paymentType: mpesaPhone ? 'M-Pesa' : status === TabStatus.PAID ? 'Cash' : undefined,
        isDebt: status === TabStatus.UNPAID,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setTabs([newTab, ...tabs]);

      if (status === TabStatus.PAID) {
        deductStock(cart);
        handlePrint(newTab);
      } else {
        roomItems.forEach(ri => {
          const roomNum = ri.name.replace('Room ', '');
          updateRoomStatus(roomNum, 'OCCUPIED');
        });
      }

      addAuditLog(currentUser!, 'Tab Created', `Created ${status} tab for ${newTab.customerName}`);
    }

    setCart([]);
    setCustomerName('');
    setSelectedTable(null);
    setActiveTabId(null);
    setShowTransactionModal(false);
  };

  const manageTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    const isOwnerOrSub = [UserRole.OWNER, UserRole.ADMIN, UserRole.SUPERVISOR].includes(
      String(currentUser?.role).toUpperCase() as UserRole
    );
    if (!isOwnerOrSub && tab.staffId !== currentUser?.id) {
      showAlert('Unauthorized', 'You can only edit your own sales sessions.');
      return;
    }

    setCart(tab.items);
    setCustomerName(tab.customerName);
    setActiveTabId(tab.id);
    setActiveTab('sales');
    addAuditLog(currentUser!, 'Manage Tab', `Resumed tab for ${tab.customerName}`);
  };

  const settleTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    setCart(tab.items);
    setCustomerName(tab.customerName);
    setActiveTabId(tab.id);
    setActiveTab('sales');
    addAuditLog(currentUser!, 'Debt Settle Initiated', `Loading debt tab for ${tab.customerName} to process payment`);
  };

  const handleDeleteTab = (tabId: string, tabName: string) => {
    showConfirm(
      'Delete Tab',
      `Permanently delete the tab for "${tabName}"? This cannot be undone.`,
      () => {
        deleteTab(tabId);
        addAuditLog(currentUser!, 'Tab Deleted', `Deleted tab #${tabId.slice(0, 8)} — ${tabName}`);
      },
      'danger'
    );
  };

  const handlePrint = (tab: Tab, force = false) => {
    setPrintingTab(tab);
    if (force || posSettings.autoPrint) {
      setTimeout(() => { window.print(); }, 100);
    }
  };

  const manualPrint = (tab: Tab) => {
    setPrintingTab(tab);
    setTimeout(() => { window.print(); }, 100);
  };

  const printCurrentCart = () => {
    const tempTab: Tab = {
      id: activeTabId || 'DRAFT',
      staffId: currentUser!.id,
      customerName: customerName || 'Guest',
      items: cart,
      total: cartTotal,
      status: TabStatus.OPEN,
      isDebt: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    handlePrint(tempTab);
  };

  const handleCloseShift = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayTabs = tabs.filter(t => (t.createdAt || 0) >= today);
    const paidToday = todayTabs.filter(t => String(t.status).toUpperCase() === TabStatus.PAID);
    const totalRevenue = paidToday.reduce((s, t) => s + t.total, 0);
    const openCount = todayTabs.filter(t => String(t.status).toUpperCase() === TabStatus.OPEN).length;
    const debtTotal = todayTabs.filter(t => String(t.status).toUpperCase() === TabStatus.UNPAID).reduce((s, t) => s + t.total, 0);

    addAuditLog(
      currentUser!,
      'Shift Closed',
      `Revenue: KES ${totalRevenue.toLocaleString()} | Transactions: ${paidToday.length} | Open: ${openCount} | Debts: KES ${debtTotal.toLocaleString()}${shiftNote ? ` | Note: ${shiftNote}` : ''}`
    );
    setShowShiftSummary(false);
    setShiftNote('');
    showAlert('Shift Closed', 'End-of-shift report has been logged to the audit trail.');
  };

  const handleStaffSave = async (updated: any) => {
    const pinHashed = await hashPin(updated.pin);
    const finalStaff = { ...updated, pin: pinHashed };

    if (editingStaff?.id === 'NEW') {
      const newStaff = { ...finalStaff, id: crypto.randomUUID() };
      setStaff([...staff, newStaff]);
      addAuditLog(currentUser!, 'Staff Added', `Added new staff: ${newStaff.name}`);
    } else {
      setStaff(staff.map(s => s.id === updated.id ? finalStaff : s));
      addAuditLog(currentUser!, 'Staff Updated', `Updated credentials for: ${updated.name}`);
    }
    setEditingStaff(null);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-screen themed-bg-primary flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4F6EF6]/30 border-t-[#4F6EF6] rounded-full animate-spin mb-4" />
        <p className="text-[10px] themed-text-dim uppercase tracking-[0.3em] font-black animate-pulse">
          Syncing {businessName}...
        </p>
      </div>
    );
  }

  // ── PIN Login ─────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen themed-bg-primary flex flex-col items-center justify-center p-4 transition-colors duration-500">
        <div className="mb-8 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-[#4F6EF6] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,110,246,0.4)] mb-4"
          >
            <BarChart2 size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-black themed-text tracking-tighter">MADIS</h1>
          <p className="text-[10px] text-[#4F6EF6] font-mono uppercase tracking-[0.3em]">{businessName}</p>
        </div>
        <PinPad onSuccess={handleLogin} error={loginError} isOnline={isOnline} businessName={businessName} lockoutSeconds={lockoutSecondsLeft} />
        {isDemo && (
          <div className="mt-6 flex items-center gap-2 bg-[#4F6EF6]/10 border border-[#4F6EF6]/25 rounded-xl px-4 py-2.5 text-xs text-[#4F6EF6]/80">
            <Play size={12} fill="currentColor" />
            Demo mode — PIN is <strong className="text-[#4F6EF6]">1234</strong> (owner) · <strong>2222</strong> (supervisor) · <strong>3333</strong> (staff)
          </div>
        )}

        <button
          onClick={onLogout}
          className={`mt-8 flex items-center gap-2 transition-colors text-xs font-bold ${
            isDemo
              ? 'text-white/70 hover:text-white border border-white/15 hover:border-white/30 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10'
              : 'text-white/30 hover:text-white/60'
          }`}
        >
          <LogOut size={14} />
          {isDemo ? 'Back to Home' : 'Switch account'}
        </button>

        <footer className="mt-8 text-[10px] text-[#4F6EF6]/40 uppercase tracking-widest font-bold">
          Powered by August
        </footer>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const isManagement = [UserRole.OWNER, UserRole.ADMIN, UserRole.SUPERVISOR].includes(
    String(currentUser.role).toUpperCase() as UserRole
  );
  const isOwnerOrAdmin = [UserRole.OWNER, UserRole.ADMIN].includes(
    String(currentUser.role).toUpperCase() as UserRole
  );
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayTabs = tabs.filter(t => (t.createdAt || 0) >= todayStart);
  const shiftRevenue = todayTabs.filter(t => String(t.status).toUpperCase() === TabStatus.PAID).reduce((s, t) => s + t.total, 0);
  const shiftTransactions = todayTabs.filter(t => String(t.status).toUpperCase() === TabStatus.PAID).length;
  const shiftOpenCount = todayTabs.filter(t => String(t.status).toUpperCase() === TabStatus.OPEN).length;
  const shiftDebtTotal = todayTabs.filter(t => String(t.status).toUpperCase() === TabStatus.UNPAID).reduce((s, t) => s + t.total, 0);

  // ── Invoice handlers ──────────────────────────────────────────────────────
  const handleInvoiceSave = async (inv: Invoice) => {
    if (invoices.find((i: Invoice) => i.id === inv.id)) {
      await updateInvoice(inv);
      addAuditLog(currentUser!, 'Invoice Updated', `Updated ${inv.invoiceNumber} for ${inv.supplierName}`);
    } else {
      await addInvoice(inv);
      addAuditLog(currentUser!, 'Invoice Created', `Created ${inv.invoiceNumber} for ${inv.supplierName}`);
    }
    setEditingInvoice(null);
  };

  const handleInvoiceReceive = async (inv: Invoice) => {
    const updatedInventory = inventory.map((item: Product) => {
      const line = inv.items.find(li => li.productId === item.id);
      if (line) return { ...item, stock: item.stock + line.quantity };
      return item;
    });
    await setInventory(updatedInventory);
    const received: Invoice = { ...inv, status: 'received', receivedAt: Date.now(), updatedAt: Date.now() };
    await updateInvoice(received);
    addAuditLog(currentUser!, 'Invoice Received', `Invoice ${inv.invoiceNumber} from ${inv.supplierName} received — ${inv.items.length} item(s) restocked`);
    setEditingInvoice(null);
  };

  const handleInvoiceDelete = (inv: Invoice) => {
    showConfirm(
      'Delete Invoice',
      `Permanently delete invoice ${inv.invoiceNumber}?`,
      async () => {
        await deleteInvoice(inv.id);
        addAuditLog(currentUser!, 'Invoice Deleted', `Deleted invoice ${inv.invoiceNumber}`);
      },
      'danger'
    );
  };

  // ── Main POS render ───────────────────────────────────────────────────────
  return (
    <>
    {printingTab && (
      <Receipt
        tab={printingTab}
        staffName={staff.find(s => s.id === printingTab.staffId)?.name || 'Terminal'}
        businessName={businessName}
        tagline={posSettings.receiptTagline}
      />
    )}
    {invoicePrintTab && (
      <CustomerInvoice
        tab={invoicePrintTab}
        businessName={businessName}
        staffName={staff.find(s => s.id === invoicePrintTab.staffId)?.name || 'Staff'}
      />
    )}
    <AnimatePresence>
      {showTrialWarning && trialDaysLeft !== null && !isDemo && (
        <TrialWarningModal
          daysLeft={trialDaysLeft}
          onSubscribe={() => { setShowTrialWarning(false); onSubscribeNow?.(); }}
          onDismiss={dismissTrialWarning}
        />
      )}
    </AnimatePresence>
    {isDemo && (
      <div className="fixed top-0 left-0 right-0 z-[100] bg-[#4F6EF6] text-white text-xs font-bold flex items-center justify-between px-4 py-2 print:hidden">
        <span className="flex items-center gap-2">
          <Play size={12} fill="white" />
          DEMO MODE — Data is simulated. No changes are saved.
        </span>
        <button onClick={onLogout} className="underline hover:no-underline">Exit Demo</button>
      </div>
    )}
    {trialDaysLeft !== null && trialDaysLeft !== undefined && trialDaysLeft <= 3 && !isDemo && (
      <div className={`fixed top-0 left-0 right-0 z-[99] flex items-center justify-between px-6 py-2 text-xs font-black print:hidden ${
        trialDaysLeft === 0
          ? 'bg-red-900/95 border-b border-red-500/30 text-red-300'
          : 'bg-amber-900/95 border-b border-amber-500/30 text-amber-300'
      } backdrop-blur-sm`}>
        <div className="flex items-center gap-2">
          <Crown size={12} />
          <span className="uppercase tracking-widest">
            {trialDaysLeft === 0
              ? 'Trial expires today — subscribe to keep your data'
              : `Free trial · ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} remaining`}
          </span>
        </div>
        <button
          onClick={onSubscribeNow}
          className="border border-current px-4 py-1 rounded-full text-[10px] uppercase tracking-widest hover:opacity-70 transition-all"
        >
          Subscribe — $10/yr
        </button>
      </div>
    )}
    <div className={`h-screen themed-bg-primary flex flex-col md:flex-row overflow-hidden print:hidden ${(isDemo || (trialDaysLeft !== null && trialDaysLeft !== undefined && trialDaysLeft <= 3 && !isDemo)) ? 'pt-8' : ''}`}>

      {/* Mobile Top Bar */}
      <div className="md:hidden themed-bg-secondary border-b themed-border p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4F6EF6] rounded-lg flex items-center justify-center shadow-lg">
            <BarChart2 size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tighter themed-text leading-none">MADIS</h1>
            <p className="text-[9px] themed-text-dim leading-none">{businessName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2 themed-text-dim hover:text-red-500 transition-colors mr-2"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 themed-text-dim"
          >
            {isMobileMenuOpen
              ? <X size={20} />
              : <div className="space-y-1 w-5"><div className="h-0.5 bg-current rounded" /><div className="h-0.5 bg-current rounded" /><div className="h-0.5 bg-current rounded" /></div>
            }
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-0 z-40 md:relative md:flex w-full md:w-64 border-r themed-border themed-bg-secondary flex-col shrink-0 transition-transform duration-300 md:translate-x-0 overflow-hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl md:shadow-none'}`}>
        <div className="p-6 border-b themed-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4F6EF6] rounded-xl flex items-center justify-center shadow-[0_5px_15px_rgba(79,110,246,0.35)]">
              <BarChart2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-base tracking-tighter themed-text leading-none">MADIS</h1>
              <p className="text-[9px] themed-text-dim leading-tight truncate max-w-[120px]">{businessName}</p>
            </div>
          </div>
          <button className="md:hidden themed-text-dim" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem active={activeTab === 'dashboard'} icon={Settings} label="Dashboard" onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} />
          <NavItem active={activeTab === 'sales'} icon={ShoppingCart} label="Sales" onClick={() => { setActiveTab('sales'); setIsMobileMenuOpen(false); }} />
          <NavItem active={activeTab === 'tabs'} icon={ClipboardList} label="Active Tabs" onClick={() => { setActiveTab('tabs'); setIsMobileMenuOpen(false); }} />

          {isManagement && (
            <>
              <NavItem active={activeTab === 'reports'} icon={TrendingUp} label="Reports" onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }} />
              {rooms.length > 0 && (
                <NavItem active={activeTab === 'rooms'} icon={Package} label="Rooms" onClick={() => { setActiveTab('rooms'); setIsMobileMenuOpen(false); }} />
              )}
              {isAppointmentBusiness && (
                <NavItem active={activeTab === 'appointments'} icon={Calendar} label="Appointments" onClick={() => { setActiveTab('appointments'); setIsMobileMenuOpen(false); }} />
              )}
            </>
          )}

          {isManagement && (
            <>
              <div className="pt-4 pb-2 px-4">
                <span className="text-[9px] themed-text-dim uppercase tracking-[0.2em] font-black">Management</span>
              </div>
              <NavItem active={activeTab === 'debts'} icon={CreditCard} label="Unpaid Debts" onClick={() => { setActiveTab('debts'); setIsMobileMenuOpen(false); }} />
              <NavItem active={activeTab === 'inventory'} icon={Package} label="Inventory" onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }} />
              <NavItem active={activeTab === 'invoices'} icon={FileText} label="Invoices" onClick={() => { setActiveTab('invoices'); setIsMobileMenuOpen(false); }} />
            </>
          )}

          {isOwnerOrAdmin && (
            <>
              <div className="pt-4 pb-2 px-4">
                <span className="text-[9px] themed-text-dim uppercase tracking-[0.2em] font-black">Administration</span>
              </div>
              <NavItem active={activeTab === 'staff'} icon={Users} label="Staff" onClick={() => { setActiveTab('staff'); setIsMobileMenuOpen(false); }} />
              <NavItem active={activeTab === 'audit'} icon={History} label="Audit Trail" onClick={() => { setActiveTab('audit'); setIsMobileMenuOpen(false); }} />
              <NavItem active={activeTab === 'settings'} icon={SlidersHorizontal} label="Settings" onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} />
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t themed-border space-y-3">
          {(canInstall || isIOS) && !isInstalled && (
            <button
              onClick={isIOS ? () => setShowIOSInstall(true) : triggerInstall}
              className="w-full flex items-center gap-3 px-4 py-3 bg-[#4F6EF6]/5 border border-[#4F6EF6]/10 rounded-2xl hover:bg-[#4F6EF6]/10 transition-all"
            >
              <Download size={16} className="text-[#4F6EF6]" />
              <span className="text-xs font-black text-[#4F6EF6] uppercase tracking-widest">Install App</span>
            </button>
          )}

          {/* Online status + theme toggle */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-500'}`} />
              {isOnline
                ? <Wifi size={13} className="themed-text-dim" />
                : <WifiOff size={13} className="themed-text-dim" />
              }
              <span className="text-[9px] themed-text-dim font-black uppercase tracking-widest">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            {/* Theme selector */}
            <div className="flex items-center gap-1 bg-black/10 border themed-border rounded-xl p-0.5">
              <button
                onClick={() => setTheme('light')}
                title="Light mode"
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${theme === 'light' ? 'bg-[#4F6EF6] text-white shadow-sm' : 'themed-text-dim hover:themed-text'}`}
              >
                <Sun size={11} />
                <span className="hidden sm:inline">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                title="Dark mode"
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-[#4F6EF6] text-white shadow-sm' : 'themed-text-dim hover:themed-text'}`}
              >
                <Moon size={11} />
                <span className="hidden sm:inline">Dark</span>
              </button>
            </div>
          </div>

          {/* Current staff user card */}
          <div className="px-4 py-3 bg-black/5 rounded-2xl border themed-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#4F6EF6]/10 rounded-xl flex items-center justify-center border border-[#4F6EF6]/20">
                <UserIcon size={14} className="text-[#4F6EF6]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black themed-text truncate">{currentUser.name}</p>
                <p className="text-[9px] themed-text-dim uppercase font-bold tracking-widest">{currentUser.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:text-red-500 themed-text-dim transition-colors"
                title="Lock terminal"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          {isOwnerOrAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={onLogout}
                className="flex-1 text-[9px] themed-text-dim hover:text-red-400 transition-colors uppercase tracking-widest font-bold text-center py-1"
              >
                Switch Account
              </button>
              {onResetPassword && ownerEmail && (
                <>
                  <span className="text-white/10">·</span>
                  <button
                    onClick={async () => {
                      try {
                        await onResetPassword(ownerEmail);
                        showAlert('Password Reset', `A reset link has been sent to ${ownerEmail}.`);
                      } catch (e: any) {
                        showAlert('Error', e.message || 'Could not send reset email.');
                      }
                    }}
                    className="flex-1 text-[9px] text-[#4F6EF6]/60 hover:text-[#4F6EF6] transition-colors uppercase tracking-widest font-bold text-center py-1"
                  >
                    Reset Password
                  </button>
                </>
              )}
            </div>
          )}

          <p className="text-[8px] text-[#4F6EF6]/50 text-center uppercase tracking-widest font-bold">
            Powered by August
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">

        {/* Management action bar */}
        {isManagement && (
          <div className="sticky top-0 z-30 themed-bg-secondary border-b themed-border px-6 py-3 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#4F6EF6] animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[9px] themed-text-dim uppercase font-black tracking-[0.2em] hidden sm:block">
                  {isOnline ? 'Live Data' : 'Offline Mode'}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[10px] font-black themed-text-dim uppercase tracking-[0.15em]">
                <span>Today: <span className="text-[#4F6EF6]">KES {shiftRevenue.toLocaleString()}</span></span>
                <span>Tabs: <span className="themed-text">{shiftOpenCount}</span></span>
                {shiftDebtTotal > 0 && <span>Debts: <span className="text-red-500">KES {shiftDebtTotal.toLocaleString()}</span></span>}
              </div>
            </div>
            <button
              onClick={() => setShowShiftSummary(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#4F6EF6]/10 border border-[#4F6EF6]/20 rounded-xl hover:bg-[#4F6EF6]/20 transition-all"
            >
              <FileText size={14} className="text-[#4F6EF6]" />
              <span className="text-[9px] text-[#4F6EF6] font-black uppercase tracking-widest hidden sm:block">Close Shift</span>
            </button>
          </div>
        )}

        <div className="p-3 md:p-8 space-y-4 md:space-y-8 h-full">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full">
                <Dashboard
                  tabs={tabs}
                  inventory={inventory}
                  staff={staff}
                  currentUser={currentUser}
                  businessName={businessName}
                  onNavigate={(tab) => setActiveTab(tab as any)}
                />
              </motion.div>
            )}

            {activeTab === 'sales' && (
              <motion.div key="sales" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col gap-3 md:gap-6">
                {/* Sales header row with fullscreen toggle */}
                <div className="flex items-center justify-between">
                  <p className="text-[9px] themed-text-dim uppercase font-black tracking-[0.3em]">Point of Sale</p>
                  <button
                    onClick={isSalesFullscreen ? exitSalesFullscreen : enterSalesFullscreen}
                    className="flex items-center gap-1.5 text-[9px] themed-text-dim hover:text-[#4F6EF6] hover:border-[#4F6EF6]/30 border themed-border px-3 py-1.5 rounded-xl transition-all uppercase font-black tracking-widest"
                    title={isSalesFullscreen ? 'Exit fullscreen' : 'Fullscreen mode'}
                  >
                    {isSalesFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                    <span className="hidden sm:inline">{isSalesFullscreen ? 'Exit' : 'Fullscreen'}</span>
                  </button>
                </div>

                {/* Speed Menu */}
                {speedMenu.length > 0 && (
                  <div>
                    <p className="text-[9px] themed-text-dim uppercase font-black tracking-[0.3em] mb-2">Quick Sell</p>
                    <div className="flex flex-wrap gap-1.5">
                      {speedMenu.map(item => (
                        <button
                          key={item.id}
                          onClick={() => addToCart(item)}
                          disabled={item.stock === 0 && item.type !== ProductType.SERVICE}
                          className="px-3 py-1.5 bg-[#4F6EF6]/10 border border-[#4F6EF6]/20 text-[#4F6EF6] rounded-xl text-xs font-black hover:bg-[#4F6EF6]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 themed-text-dim" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full themed-bg-secondary border themed-border rounded-2xl py-3 pl-10 pr-4 themed-text focus:outline-none focus:border-[#4F6EF6]/40 transition-all text-sm"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${!selectedCategory ? 'bg-[#4F6EF6] text-white' : 'themed-bg-secondary border themed-border themed-text-dim hover:themed-text'}`}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${selectedCategory === cat ? 'bg-[#4F6EF6] text-white' : 'themed-bg-secondary border themed-border themed-text-dim hover:themed-text'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Grid — scrollable, keeps search pinned above */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-2">
                    {filteredInventory.map(item => (
                      <button
                        key={item.id}
                        onClick={() => { addToCart(item); setSearchQuery(''); }}
                        disabled={item.stock === 0 && item.type !== ProductType.SERVICE}
                        className="p-4 themed-bg-secondary border themed-border rounded-2xl text-left hover:border-[#4F6EF6]/30 transition-all group disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-black themed-text text-sm leading-tight group-hover:text-[#4F6EF6] transition-colors">{item.name}</p>
                          {item.stock < 10 && item.type !== ProductType.SERVICE && (
                            <span className="text-[8px] text-red-500 font-black uppercase shrink-0 ml-1">Low</span>
                          )}
                        </div>
                        <p className="text-[#4F6EF6] font-black text-base font-mono">KES {item.price.toLocaleString()}</p>
                        <p className="text-[10px] themed-text-dim mt-0.5">{item.category} {item.type !== ProductType.SERVICE && `· ${item.stock}`}</p>
                      </button>
                    ))}
                    {filteredInventory.length === 0 && (
                      <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-30">
                        <Search size={32} className="themed-text-dim mb-3" />
                        <p className="text-sm font-black themed-text uppercase tracking-widest">No items found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                  <div className="sticky bottom-0 themed-bg-secondary border-t themed-border rounded-t-3xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[9px] themed-text-dim uppercase font-black tracking-widest">Current Order ({cart.length} items)</p>
                      <div className="flex gap-2">
                        <button onClick={printCurrentCart} className="p-2 themed-text-dim hover:text-[#4F6EF6] transition-colors" title="Print preliminary receipt">
                          <Printer size={16} />
                        </button>
                        <button onClick={clearCart} className="p-2 text-red-500/50 hover:text-red-500 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar mb-4">
                      {cart.map(item => (
                        <div key={item.productId} className="flex items-center justify-between gap-4 text-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all shrink-0 text-xs font-black"
                            >×</button>
                            <span className="themed-text font-medium truncate">{item.quantity}× {item.name}</span>
                          </div>
                          <button
                            onClick={() => isManagement ? setOverrideItem(item) : null}
                            className={`font-black text-[#4F6EF6] font-mono shrink-0 ${isManagement ? 'hover:underline cursor-pointer' : ''}`}
                          >
                            KES {(item.priceAtSale * item.quantity).toLocaleString()}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Customer / Table inputs */}
                    <div className="flex gap-3 mb-4">
                      <input
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="Customer name..."
                        className="flex-1 themed-bg-primary border themed-border rounded-xl py-2.5 px-4 themed-text text-sm focus:outline-none focus:border-[#4F6EF6]/40 transition-all"
                      />
                      <input
                        value={selectedTable || ''}
                        onChange={e => setSelectedTable(e.target.value || null)}
                        placeholder="Table #"
                        className="w-20 themed-bg-primary border themed-border rounded-xl py-2.5 px-3 themed-text text-sm focus:outline-none focus:border-[#4F6EF6]/40 transition-all text-center"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-[9px] themed-text-dim uppercase font-black tracking-widest">Total</p>
                        <p className="text-2xl font-black text-[#4F6EF6] font-mono">KES {cartTotal.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => initiateTabCreation(TabStatus.OPEN)}
                          className="px-4 py-3 themed-bg-primary border themed-border rounded-xl text-xs font-black themed-text hover:border-[#4F6EF6]/30 transition-all uppercase tracking-wider"
                        >
                          Open Tab
                        </button>
                        {isManagement && (
                          <button
                            onClick={() => initiateTabCreation(TabStatus.UNPAID)}
                            className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-black text-red-500 hover:bg-red-500/20 transition-all uppercase tracking-wider"
                          >
                            Debt
                          </button>
                        )}
                        <button
                          onClick={() => initiateTabCreation(TabStatus.PAID)}
                          className="px-6 py-3 bg-[#4F6EF6] text-white rounded-xl text-xs font-black hover:scale-105 transition-all shadow-lg shadow-[#4F6EF6]/20 uppercase tracking-wider"
                        >
                          Charge
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tabs' && (
              <motion.div key="tabs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col gap-6">
                <header>
                  <h2 className="text-3xl font-black themed-text tracking-tighter">Active Tabs</h2>
                  <p className="themed-text-dim text-sm">Open orders and running bills</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tabs.filter(t => String(t.status).toUpperCase() === TabStatus.OPEN).map(tab => (
                    <TabCard
                      key={tab.id}
                      tab={tab}
                      staffName={staff.find(s => s.id === tab.staffId)?.name || 'Staff'}
                      onStatusChange={() => manageTab(tab.id)}
                      onPrint={() => manualPrint(tab)}
                      onInvoice={() => handlePrintCustomerInvoice(tab)}
                      onDelete={isManagement ? () => handleDeleteTab(tab.id, tab.customerName) : undefined}
                    />
                  ))}
                  {tabs.filter(t => String(t.status).toUpperCase() === TabStatus.OPEN).length === 0 && (
                    <div className="col-span-full h-48 flex items-center justify-center opacity-20">
                      <p className="text-sm font-black uppercase tracking-widest themed-text">No open tabs</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'debts' && isManagement && (
              <motion.div key="debts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col gap-6">
                <header>
                  <h2 className="text-3xl font-black themed-text tracking-tighter">Unpaid Debts</h2>
                  <p className="themed-text-dim text-sm">Outstanding balances and credit accounts</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tabs.filter(t => String(t.status).toUpperCase() === TabStatus.UNPAID).map(tab => (
                    <TabCard
                      key={tab.id}
                      tab={tab}
                      staffName={staff.find(s => s.id === tab.staffId)?.name || 'Staff'}
                      onStatusChange={() => settleTab(tab.id)}
                      onPrint={() => manualPrint(tab)}
                      onInvoice={() => handlePrintCustomerInvoice(tab)}
                      onDelete={isOwnerOrAdmin ? () => handleDeleteTab(tab.id, tab.customerName) : undefined}
                      isDebt
                    />
                  ))}
                  {tabs.filter(t => String(t.status).toUpperCase() === TabStatus.UNPAID).length === 0 && (
                    <div className="col-span-full h-48 flex items-center justify-center opacity-20">
                      <p className="text-sm font-black uppercase tracking-widest themed-text">No outstanding debts</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'inventory' && isManagement && (
              <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col">
                <InventoryManager
                  inventory={inventory}
                  setInventory={setInventory}
                  addAuditLog={addAuditLog}
                  currentUser={currentUser}
                  setEditingItem={setEditingItem}
                  onConfirmDialog={showConfirm}
                  businessType={businessType}
                  onImportCSV={() => setShowCSVImport(true)}
                  onRestockItem={handleRestockItem}
                />
              </motion.div>
            )}

            {activeTab === 'invoices' && isManagement && (
              <motion.div key="invoices" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col">
                <InvoiceManager
                  invoices={invoices}
                  inventory={inventory}
                  currentUser={currentUser}
                  onNew={() => setEditingInvoice({ id: 'NEW' } as Invoice)}
                  onEdit={(inv: Invoice) => setEditingInvoice(inv)}
                  onReceive={handleInvoiceReceive}
                  onDelete={handleInvoiceDelete}
                  onConfirmDialog={showConfirm}
                />
              </motion.div>
            )}

            {activeTab === 'appointments' && isAppointmentBusiness && isManagement && (
              <motion.div key="appointments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col">
                <AppointmentsManager
                  appointments={appointments}
                  setAppointments={setAppointments}
                  staff={staff}
                  inventory={inventory.filter(i => i.type === ProductType.SERVICE)}
                  currentUser={currentUser}
                  addAuditLog={addAuditLog}
                  editingAppointment={editingAppointment}
                  setEditingAppointment={setEditingAppointment}
                  onConfirmDialog={showConfirm}
                />
              </motion.div>
            )}

            {activeTab === 'staff' && isOwnerOrAdmin && (
              <motion.div key="staff" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col">
                <StaffManager
                  staff={staff}
                  setStaff={setStaff}
                  addAuditLog={addAuditLog}
                  currentUser={currentUser}
                  setEditingStaff={setEditingStaff}
                  onConfirmDialog={showConfirm}
                />
              </motion.div>
            )}

            {activeTab === 'rooms' && isManagement && rooms.length > 0 && (
              <motion.div key="rooms" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col">
                <RoomManager
                  rooms={rooms}
                  setRooms={setRooms}
                  tabs={tabs}
                  onBillToRoom={(room: Room) => {
                    addToCart({ id: room.id, name: `Room ${room.number}`, price: room.price, stock: 1, category: 'Rooms', isQuickSell: false, type: ProductType.ROOM });
                    setActiveTab('sales');
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'audit' && (
              <motion.div key="audit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col">
                <AuditViewer logs={auditLogs} />
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div key="reports" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col gap-8">
                <Reports
                  tabs={tabs}
                  inventory={inventory}
                  staff={staff}
                  onDeleteTab={(tabId, name) => showConfirm('Delete Sale', `Permanently delete the sale for "${name}"? This cannot be undone.`, async () => { await deleteTab(tabId); addAuditLog(currentUser!, 'Sale Deleted', `Deleted sale record for ${name}`); }, 'danger')}
                  onEditTab={async (tabId, customerName) => { const updated = tabs.map(t => t.id === tabId ? { ...t, customerName, updatedAt: Date.now() } : t); await setTabs(updated); addAuditLog(currentUser!, 'Sale Edited', `Updated customer name on sale to ${customerName}`); }}
                />
                {String(currentUser?.role).toUpperCase() === UserRole.OWNER && (
                  <div className="themed-bg-secondary border themed-border rounded-[2rem] p-8 flex flex-col gap-6" style={{ minHeight: '520px' }}>
                    <div className="flex items-center gap-3 pb-4 border-b themed-border shrink-0">
                      <div className="w-10 h-10 bg-[#4F6EF6]/10 border border-[#4F6EF6]/20 rounded-2xl flex items-center justify-center">
                        <Sparkles size={18} className="text-[#4F6EF6]" />
                      </div>
                      <div>
                        <h3 className="font-black themed-text text-lg tracking-tight">Madison</h3>
                        <p className="text-[10px] themed-text-dim uppercase tracking-widest font-black">Your private business advisor</p>
                      </div>
                    </div>
                    <BIChat
                      uid={uid}
                      businessName={businessName}
                      ownerName={ownerName}
                      tabs={tabs}
                      inventory={inventory}
                      staff={staff}
                      isOnline={isOnline}
                      isDemo={isDemo}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && isOwnerOrAdmin && (
              <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full overflow-y-auto p-1 custom-scrollbar">
                <SettingsPanel
                  settings={posSettings}
                  businessName={businessName}
                  ownerName={ownerName}
                  onSave={saveSettings}
                />
              </motion.div>
            )}

          </AnimatePresence>

          {showTransactionModal && (
            <TransactionModal
              total={cartTotal}
              onConfirm={(phone) => createTab(TabStatus.PAID, phone)}
              onPrint={printCurrentCart}
              onCancel={() => setShowTransactionModal(false)}
            />
          )}

          {overrideItem && (
            <PriceOverrideModal
              item={overrideItem}
              onConfirm={(price) => handlePriceOverride(overrideItem.productId, price)}
              onCancel={() => setOverrideItem(null)}
            />
          )}

          {editingStaff && (
            <StaffEditModal
              staff={editingStaff}
              currentUser={currentUser}
              onConfirm={handleStaffSave}
              onCancel={() => setEditingStaff(null)}
            />
          )}

          {editingInvoice && (
            <InvoiceModal
              invoice={editingInvoice.id === 'NEW' ? null : editingInvoice}
              inventory={inventory}
              invoiceCount={invoices.length}
              onSave={handleInvoiceSave}
              onReceive={handleInvoiceReceive}
              onCancel={() => setEditingInvoice(null)}
            />
          )}

          {showCSVImport && (
            <CSVImportModal
              businessType={businessType}
              existingCategories={categories}
              onImport={(items) => {
                const newItems = items.map(item => ({
                  ...item,
                  id: crypto.randomUUID(),
                  isQuickSell: false,
                  type: ProductType.DRINK,
                  updatedAt: Date.now(),
                }));
                setInventory([...inventory, ...(newItems as any)]);
                addAuditLog(currentUser, 'CSV Import', `Imported ${newItems.length} items from CSV`);
                setShowCSVImport(false);
              }}
              onCancel={() => setShowCSVImport(false)}
            />
          )}

          {editingItem && (
            <InventoryEditModal
              item={editingItem}
              businessType={businessType}
              existingCategories={categories}
              onConfirm={(updated: any) => {
                if (editingItem.id === 'NEW') {
                  const newItem = { ...updated, id: crypto.randomUUID() };
                  setInventory([...inventory, newItem]);
                  addAuditLog(currentUser, 'Inventory Added', `Added new item: ${newItem.name}`);
                } else {
                  setInventory(inventory.map(i => i.id === updated.id ? updated : i));
                  addAuditLog(currentUser, 'Inventory Updated', `Updated item: ${updated.name}`);
                }
                setEditingItem(null);
              }}
              onCancel={() => setEditingItem(null)}
            />
          )}

          {/* Shift Close-Out Modal */}
          {showShiftSummary && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md themed-bg-secondary border themed-border rounded-[2.5rem] p-10 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-[#4F6EF6]/10 border border-[#4F6EF6]/20 rounded-2xl flex items-center justify-center">
                    <FileText size={24} className="text-[#4F6EF6]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black themed-text uppercase tracking-tight">Close Shift</h3>
                    <p className="text-[10px] themed-text-dim font-black uppercase tracking-widest">{new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-[#4F6EF6]/5 border border-[#4F6EF6]/10 rounded-2xl">
                    <p className="text-[9px] themed-text-dim font-black uppercase tracking-widest mb-1">Revenue</p>
                    <p className="text-xl font-black text-[#4F6EF6]">KES {shiftRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-black/5 border themed-border rounded-2xl">
                    <p className="text-[9px] themed-text-dim font-black uppercase tracking-widest mb-1">Transactions</p>
                    <p className="text-xl font-black themed-text">{shiftTransactions}</p>
                  </div>
                  <div className="p-4 bg-black/5 border themed-border rounded-2xl">
                    <p className="text-[9px] themed-text-dim font-black uppercase tracking-widest mb-1">Open Tabs</p>
                    <p className="text-xl font-black themed-text">{shiftOpenCount}</p>
                  </div>
                  <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                    <p className="text-[9px] themed-text-dim font-black uppercase tracking-widest mb-1">Unpaid Debts</p>
                    <p className="text-xl font-black text-red-400">KES {shiftDebtTotal.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="text-[9px] themed-text-dim uppercase font-black tracking-[0.3em] block mb-3">Shift Notes (Optional)</label>
                  <textarea
                    value={shiftNote}
                    onChange={(e) => setShiftNote(e.target.value)}
                    placeholder="Any issues, incidents, or handover notes..."
                    rows={3}
                    className="w-full themed-bg-primary border themed-border rounded-2xl py-4 px-5 text-sm themed-text focus:outline-none focus:border-[#4F6EF6]/40 transition-all font-medium resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setShowShiftSummary(false); setShiftNote(''); }}
                    className="py-4 bg-black/5 themed-text-dim border themed-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCloseShift}
                    className="py-4 bg-[#4F6EF6] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,255,136,0.3)]"
                  >
                    Log & Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      {/* Global scroll button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToBottom}
            className="fixed bottom-8 right-8 z-[100] p-4 bg-[#4F6EF6] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce print:hidden"
          >
            <ArrowDown size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <ConfirmDialog dialog={dialog} onClose={closeDialog} />

      <AnimatePresence>
        {showIOSInstall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowIOSInstall(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm themed-bg-secondary border themed-border rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-[#4F6EF6] rounded-2xl flex items-center justify-center">
                  <Download size={22} className="text-black" />
                </div>
                <button onClick={() => setShowIOSInstall(false)} className="themed-text-dim hover:themed-text">
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-xl font-black themed-text mb-1">Install MADIS on iPhone</h3>
              <p className="themed-text-dim text-sm mb-6">Add MADIS to your home screen for a full-screen experience.</p>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#4F6EF6]/20 text-[#4F6EF6] rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</span>
                  <p className="text-sm themed-text font-medium">Tap the <Share size={14} className="inline mx-1 text-blue-400" /> <strong>Share</strong> button at the bottom of Safari</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#4F6EF6]/20 text-[#4F6EF6] rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</span>
                  <p className="text-sm themed-text font-medium">Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#4F6EF6]/20 text-[#4F6EF6] rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">3</span>
                  <p className="text-sm themed-text font-medium">Tap <strong>"Add"</strong> in the top right corner</p>
                </li>
              </ol>
              <button
                onClick={() => setShowIOSInstall(false)}
                className="mt-8 w-full py-4 bg-[#4F6EF6] text-white rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NavItem({ active, icon: Icon, label, onClick }: { active: boolean; icon: any; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative border ${
        active
          ? 'bg-[#4F6EF6]/10 themed-text border-[#4F6EF6]/20 shadow-sm'
          : 'themed-text-dim border-transparent hover:themed-bg-secondary hover:themed-text'
      }`}
    >
      <Icon size={18} className={active ? 'text-[#4F6EF6] drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]' : 'group-hover:text-[#4F6EF6]/60'} />
      <span className="font-black text-[11px] uppercase tracking-widest">{label}</span>
    </button>
  );
}

function TabCard({ tab, onStatusChange, onPrint, onInvoice, onDelete, isDebt = false, staffName }: {
  tab: Tab;
  onStatusChange: () => void;
  onPrint: () => void;
  onInvoice?: () => void;
  onDelete?: () => void;
  isDebt?: boolean;
  staffName: string;
}) {
  return (
    <div className="p-6 themed-bg-secondary border themed-border rounded-[2rem] shadow-xl flex flex-col gap-5">
      {/* Header row: customer + status badge + action icons */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] themed-text-dim uppercase font-black tracking-[0.2em] mb-0.5">Holder</p>
          <h4 className="text-lg font-black themed-text truncate leading-tight">{tab.customerName}</h4>
          <p className="text-[10px] themed-text-dim font-bold mt-0.5">Served by: <span className="themed-text">{staffName}</span></p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black shadow-sm ${isDebt ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#4F6EF6]/10 text-[#4F6EF6] border border-[#4F6EF6]/20'} uppercase tracking-widest`}>
            {tab.status}
          </div>
          {onInvoice && (
            <button
              onClick={(e) => { e.stopPropagation(); onInvoice(); }}
              className="p-1.5 bg-black/5 hover:bg-emerald-500/15 hover:text-emerald-400 themed-text-dim rounded-xl transition-all border themed-border print:hidden"
              title="Customer Invoice (A4)"
            >
              <FileText size={14} />
            </button>
          )}
          {onPrint && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrint(); }}
              className="p-1.5 bg-black/5 hover:bg-[#4F6EF6]/20 hover:text-[#4F6EF6] themed-text-dim rounded-xl transition-all border themed-border print:hidden"
              title="Print Receipt"
            >
              <Printer size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 bg-red-500/5 hover:bg-red-500/20 text-red-500/40 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/20"
              title="Delete Tab"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-2 max-h-28 overflow-y-auto custom-scrollbar">
        {tab.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-[11px] font-medium">
            <span className="themed-text-dim">{item.quantity}× {item.name}</span>
            <span className="themed-text font-black">KES {(item.priceAtSale * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Footer: total + action button */}
      <div className="pt-4 border-t themed-border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[9px] themed-text-dim uppercase font-black tracking-[0.2em] mb-0.5">Total</p>
            <p className="text-2xl font-black themed-text tracking-tighter leading-none">KES {tab.total.toLocaleString()}</p>
          </div>
          <p className="text-[8px] themed-text-dim font-black uppercase opacity-20 text-right">REF: {tab.id.slice(0, 8)}</p>
        </div>
        <button
          onClick={onStatusChange}
          className={`w-full py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg ${isDebt ? 'bg-[#4F6EF6] text-white hover:bg-[#3D5CE4]' : 'bg-black/5 themed-text border themed-border hover:bg-black/10'}`}
        >
          {isDebt ? 'Process Payment →' : 'Modify Registry'}
        </button>
      </div>
    </div>
  );
}

function PriceOverrideModal({ item, onConfirm, onCancel }: { item: TabItem; onConfirm: (price: number) => void; onCancel: () => void }) {
  const [newPrice, setNewPrice] = useState(item.priceAtSale.toString());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-sm themed-bg-secondary border themed-border rounded-[2.5rem] p-10 shadow-2xl">
        <h3 className="text-2xl font-black themed-text mb-2 tracking-tighter">Price Adjustment</h3>
        <p className="themed-text-dim text-[10px] mb-8 font-black uppercase tracking-widest">Applying to: {item.name}</p>

        <div className="mb-10">
          <label className="text-[9px] themed-text-dim uppercase font-black tracking-[0.3em] block mb-3 font-mono">One-Time Sale Price (KES)</label>
          <input
            type="number"
            autoFocus
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="w-full themed-bg-primary border themed-border rounded-2xl py-5 px-6 text-2xl text-[#4F6EF6] focus:outline-none focus:border-[#4F6EF6] transition-all font-mono font-black"
          />
        </div>

        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 bg-black/5 themed-text-dim border themed-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/10 transition-all">ABORT</button>
          <button onClick={() => onConfirm(Math.round(Number(newPrice)))} className="flex-1 py-4 bg-[#4F6EF6] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_10px_20px_rgba(0,255,136,0.3)]">AUTHORIZE</button>
        </div>
      </div>
    </div>
  );
}

function InventoryManager({ inventory, setInventory, addAuditLog, currentUser, setEditingItem, onConfirmDialog, businessType, onImportCSV, onRestockItem }: any) {
  const deleteItem = (id: string) => {
    const item = inventory.find((i: Product) => i.id === id);
    onConfirmDialog(
      'Delete Item',
      `Permanently delete "${item?.name}" from inventory?`,
      () => {
        setInventory(inventory.filter((i: Product) => i.id !== id));
        addAuditLog(currentUser, 'Inventory Delete', `Deleted item: ${item?.name}`);
      },
      'danger'
    );
  };

  const adjustStock = (id: string, delta: number) => {
    const updated = inventory.map((i: Product) => {
      if (i.id === id) {
        const newStock = Math.max(0, i.stock + delta);
        addAuditLog(currentUser, 'Stock Adjustment', `Adjusted ${i.name} stock to ${newStock}`);
        return { ...i, stock: newStock };
      }
      return i;
    });
    setInventory(updated);
  };

  const toggleQuickSell = (id: string) => {
    const updated = inventory.map((i: Product) => {
      if (i.id === id) {
        addAuditLog(currentUser, 'Inventory Update', `Toggled Quick-Sell for ${i.name}`);
        return { ...i, isQuickSell: !i.isQuickSell };
      }
      return i;
    });
    setInventory(updated);
  };

  const lowStockCount = inventory.filter((i: Product) => i.stock < 10 && i.type !== ProductType.SERVICE).length;

  return (
    <div className="h-full flex flex-col space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black themed-text tracking-tighter">Inventory Management</h2>
          <p className="themed-text-dim text-sm font-medium mt-1">Real-time stock monitoring and replenishment</p>
        </div>
        <div className="flex items-center gap-4">
          {lowStockCount > 0 && (
            <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-pulse">
              <Zap size={16} className="text-red-500" />
              <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">{lowStockCount} Items Low Stock</span>
            </div>
          )}
          <button
            onClick={onImportCSV}
            className="border themed-border themed-text-dim px-6 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 hover:border-[#4F6EF6]/40 hover:text-[#4F6EF6] transition-all"
          >
            <Upload size={16} /> Import CSV
          </button>
          <button
            onClick={() => setEditingItem({ id: 'NEW', name: '', category: '', price: 0, stock: 0, isQuickSell: false, type: 'DRINK' })}
            className="bg-[#4F6EF6] text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-[0_10px_20px_rgba(0,255,136,0.3)]"
          >
            <Plus size={18} /> Add New Product
          </button>
        </div>
      </header>

      <div className="luxury-card overflow-hidden flex-1 flex flex-col themed-bg-secondary border themed-border">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b themed-border text-[10px] themed-text-dim uppercase tracking-[0.2em] font-black bg-black/5">
                <th className="py-6 px-8">Product Details</th>
                <th className="py-6">Category</th>
                <th className="py-6">Price</th>
                <th className="py-6 min-w-[150px]">Current Stock</th>
                <th className="py-6 text-center">Quick Sell</th>
                <th className="py-6 px-8 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y themed-border">
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                      <Package size={40} className="themed-text-dim" />
                      <div className="text-center">
                        <p className="font-black themed-text uppercase tracking-widest text-sm">No items yet</p>
                        <p className="themed-text-dim text-xs mt-1">Click "Add New Product" to build your inventory</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {inventory.map((item: Product) => (
                <tr key={item.id} className={`hover:bg-black/5 transition-colors group ${item.stock < 10 && item.type !== ProductType.SERVICE ? 'bg-red-500/[0.02]' : ''}`}>
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${item.stock < 10 && item.type !== ProductType.SERVICE ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-[#4F6EF6]'}`} />
                      <div>
                        <p className="font-black themed-text text-lg leading-tight">{item.name}</p>
                        <p className="text-[9px] themed-text-dim uppercase font-black tracking-widest mt-1 opacity-50">SKU: {item.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className="px-3 py-1 bg-black/5 border themed-border rounded-lg text-[9px] font-black themed-text-dim uppercase tracking-widest">{item.category}</span>
                  </td>
                  <td className="py-6 font-mono font-black text-[#4F6EF6]">
                    <button onClick={() => setEditingItem(item)} className="hover:bg-[#4F6EF6]/10 px-3 py-1 rounded-lg transition-all" title="Click to edit price">
                      KES {item.price.toLocaleString()}
                    </button>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-black/5 rounded-xl border themed-border overflow-hidden">
                        <button onClick={() => adjustStock(item.id, -1)} className="p-2 hover:bg-red-500/20 hover:text-red-500 themed-text-dim transition-colors border-r themed-border">
                          <X size={14} className="rotate-45" />
                        </button>
                        <span className={`px-4 font-mono font-black text-sm ${item.stock < 10 && item.type !== ProductType.SERVICE ? 'text-red-500' : 'themed-text'}`}>{item.stock}</span>
                        <button onClick={() => adjustStock(item.id, 1)} className="p-2 hover:bg-[#4F6EF6]/20 hover:text-[#4F6EF6] themed-text-dim transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      {item.stock < 10 && item.type !== ProductType.SERVICE && (
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Running Low</span>
                      )}
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleQuickSell(item.id)}
                        className={`w-10 h-6 rounded-full flex items-center p-1 transition-all border ${item.isQuickSell ? 'bg-[#4F6EF6] border-[#4F6EF6]' : 'bg-black/10 border-white/5'}`}
                      >
                        <motion.div animate={{ x: item.isQuickSell ? 16 : 0 }} className={`w-4 h-4 rounded-full shadow-lg ${item.isQuickSell ? 'bg-black' : 'bg-white/40'}`} />
                      </button>
                    </div>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.stock < 10 && item.type !== ProductType.SERVICE && onRestockItem && (
                        <button
                          onClick={() => onRestockItem(item)}
                          className="p-2.5 bg-amber-500/8 border border-amber-500/20 rounded-2xl text-amber-400 hover:bg-amber-500/15 transition-all"
                          title="Create supplier restock invoice"
                        >
                          <ShoppingCart size={16} />
                        </button>
                      )}
                      <button onClick={() => setEditingItem(item)} className="p-2.5 bg-black/5 border themed-border rounded-2xl themed-text-dim hover:text-[#4F6EF6] hover:border-[#4F6EF6]/20 transition-all" title="Edit Item">
                        <Settings size={16} />
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="p-2.5 bg-red-500/5 border border-transparent hover:border-red-500/20 rounded-2xl text-red-500/50 hover:text-red-500 transition-all" title="Delete Item">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-black/5 border-t themed-border flex justify-between items-center">
          <span className="text-[9px] themed-text-dim font-black uppercase tracking-[0.2em]">Total Inventory Count: {inventory.length} SKUs</span>
          {lowStockCount > 0 && <span className="text-[9px] text-red-500 font-black uppercase tracking-[0.2em]">{lowStockCount} Warnings active</span>}
        </div>
      </div>
    </div>
  );
}

// ── CSV Import Modal ──────────────────────────────────────────────────────────

interface CSVRow {
  name: string;
  category: string;
  price: number;
  stock: number;
  errors: string[];
  valid: boolean;
}

function parseCSVText(text: string, validCategories: string[]): CSVRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''));
  const nameIdx  = header.findIndex(h => h === 'name' || h === 'itemname' || h === 'product');
  const catIdx   = header.findIndex(h => h === 'category' || h === 'cat');
  const priceIdx = header.findIndex(h => h === 'price' || h === 'cost' || h === 'amount');
  const stockIdx = header.findIndex(h => h === 'stock' || h === 'qty' || h === 'quantity');

  const results: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(/[,;\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
    const errors: string[] = [];

    const name     = nameIdx >= 0 ? cols[nameIdx] || '' : '';
    const category = catIdx  >= 0 ? cols[catIdx]  || '' : '';
    const rawPrice = priceIdx >= 0 ? cols[priceIdx] : '';
    const rawStock = stockIdx >= 0 ? cols[stockIdx] : '';

    if (!name)     errors.push('Name is required');
    if (!category) errors.push('Category is required');

    const price = parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
    const stock = parseInt(rawStock.replace(/[^0-9]/g, ''), 10);

    if (isNaN(price) || price < 0) errors.push('Invalid price');
    if (isNaN(stock) || stock < 0) errors.push('Invalid stock');

    results.push({
      name,
      category: category || 'General',
      price: isNaN(price) ? 0 : Math.round(price),
      stock: isNaN(stock) ? 0 : stock,
      errors,
      valid: errors.length === 0,
    });
  }
  return results;
}

function CSVImportModal({ businessType, existingCategories = [], onImport, onCancel }: {
  businessType: string;
  existingCategories?: string[];
  onImport: (items: Omit<CSVRow, 'errors' | 'valid'>[]) => void;
  onCancel: () => void;
}) {
  const [stage, setStage] = useState<'upload' | 'preview'>('upload');
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const suggestedCategories = getBusinessCategories(businessType, existingCategories);
  const validRows  = rows.filter(r => r.valid);
  const invalidRows = rows.filter(r => !r.valid);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSVText(text, suggestedCategories);
      setRows(parsed);
      setStage('preview');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const downloadTemplate = () => {
    const cats = suggestedCategories.slice(0, 3).join(' / ');
    const csv = [
      'name,category,price,stock',
      `Example Item,${suggestedCategories[0] || 'General'},500,100`,
      `Another Item,${suggestedCategories[1] || 'General'},1200,50`,
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'madis_inventory_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl themed-bg-secondary border themed-border rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6 shrink-0">
          <div>
            <h3 className="text-2xl font-black themed-text tracking-tighter flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4F6EF6]/10 border border-[#4F6EF6]/20 rounded-2xl flex items-center justify-center">
                <Upload size={18} className="text-[#4F6EF6]" />
              </div>
              Bulk Import CSV
            </h3>
            <p className="themed-text-dim text-sm mt-1 ml-[3.25rem]">
              {stage === 'upload' ? 'Upload a spreadsheet to add many items at once' : `${rows.length} rows parsed from "${fileName}"`}
            </p>
          </div>
          <button onClick={onCancel} className="p-2 themed-text-dim hover:themed-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Upload stage ── */}
          {stage === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#4F6EF6] bg-[#4F6EF6]/5 scale-[1.01]'
                    : 'border-white/10 hover:border-[#4F6EF6]/40 hover:bg-[#4F6EF6]/3'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-[#4F6EF6]/20' : 'bg-white/5'}`}>
                  <Upload size={28} className={isDragging ? 'text-[#4F6EF6]' : 'themed-text-dim'} />
                </div>
                <div className="text-center">
                  <p className="themed-text font-black text-sm">
                    {isDragging ? 'Drop your CSV here' : 'Drag & drop your CSV file'}
                  </p>
                  <p className="themed-text-dim text-xs mt-1">or click to browse · .csv files only</p>
                </div>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />

              {/* Format info */}
              <div className="bg-[#4F6EF6]/5 border border-[#4F6EF6]/15 rounded-2xl p-5 space-y-3">
                <p className="text-xs font-black themed-text uppercase tracking-widest flex items-center gap-2">
                  <FileText size={13} className="text-[#4F6EF6]" /> Required CSV columns
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { col: 'name', desc: 'Product name', req: true },
                    { col: 'category', desc: 'e.g. Beers, Hair', req: true },
                    { col: 'price', desc: 'Amount in KES', req: true },
                    { col: 'stock', desc: 'Starting quantity', req: true },
                  ].map(({ col, desc, req }) => (
                    <div key={col} className="bg-black/10 rounded-xl px-3 py-2">
                      <span className="font-mono text-[#4F6EF6] text-xs font-black">{col}</span>
                      {req && <span className="text-red-400 text-[10px] ml-1">*</span>}
                      <p className="themed-text-dim text-[10px] mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>
                <p className="themed-text-dim text-[10px]">* Required &nbsp;·&nbsp; Supports comma, semicolon, and tab-separated files</p>
              </div>

              {/* Template download */}
              <button
                onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                className="flex items-center justify-center gap-2 w-full py-3 border themed-border themed-text-dim rounded-2xl hover:border-[#4F6EF6]/30 hover:text-[#4F6EF6] transition-all text-xs font-black uppercase tracking-widest"
              >
                <Download size={14} /> Download template for {businessType || 'your business'}
              </button>
            </motion.div>
          )}

          {/* ── Preview stage ── */}
          {stage === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 min-h-0">

              {/* Summary bar */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#4F6EF6]/8 border border-[#4F6EF6]/20 rounded-xl">
                  <CheckCircle2 size={14} className="text-[#4F6EF6]" />
                  <span className="text-xs font-black text-[#4F6EF6]">{validRows.length} ready to import</span>
                </div>
                {invalidRows.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-500/8 border border-red-500/20 rounded-xl">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-xs font-black text-red-400">{invalidRows.length} rows with errors (will be skipped)</span>
                  </div>
                )}
                <button onClick={() => { setStage('upload'); setRows([]); setFileName(''); }} className="ml-auto text-[10px] themed-text-dim hover:themed-text underline transition-colors">
                  Upload different file
                </button>
              </div>

              {/* Preview table */}
              <div className="overflow-auto rounded-2xl border themed-border flex-1 min-h-0 max-h-[40vh]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-black/20 backdrop-blur-sm">
                    <tr className="border-b themed-border">
                      <th className="py-3 px-4 themed-text-dim font-black uppercase tracking-widest">Status</th>
                      <th className="py-3 px-4 themed-text-dim font-black uppercase tracking-widest">Name</th>
                      <th className="py-3 px-4 themed-text-dim font-black uppercase tracking-widest">Category</th>
                      <th className="py-3 px-4 themed-text-dim font-black uppercase tracking-widest">Price</th>
                      <th className="py-3 px-4 themed-text-dim font-black uppercase tracking-widest">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y themed-border">
                    {rows.map((row, i) => (
                      <tr key={i} className={`${row.valid ? 'opacity-100' : 'opacity-50 bg-red-500/3'}`}>
                        <td className="py-2.5 px-4">
                          {row.valid
                            ? <Check size={14} className="text-[#4F6EF6]" />
                            : <div title={row.errors.join(', ')}><AlertTriangle size={14} className="text-red-400 cursor-help" /></div>
                          }
                        </td>
                        <td className="py-2.5 px-4 themed-text font-bold max-w-[140px] truncate">{row.name || <span className="text-red-400 italic">missing</span>}</td>
                        <td className="py-2.5 px-4 themed-text-dim">{row.category}</td>
                        <td className="py-2.5 px-4 font-mono text-[#4F6EF6]">KES {row.price.toLocaleString()}</td>
                        <td className="py-2.5 px-4 themed-text">{row.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Error details (if any) */}
              {invalidRows.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3 shrink-0">
                  <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-1.5">Rows with errors</p>
                  <ul className="space-y-0.5">
                    {invalidRows.slice(0, 5).map((r, i) => (
                      <li key={i} className="text-[11px] text-red-400/80">
                        <span className="font-bold">{r.name || `Row ${i + 1}`}:</span> {r.errors.join(', ')}
                      </li>
                    ))}
                    {invalidRows.length > 5 && <li className="text-[11px] text-red-400/60">…and {invalidRows.length - 5} more</li>}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 shrink-0">
                <button onClick={onCancel} className="flex-1 py-4 bg-black/5 themed-text-dim border themed-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/10 transition-all">
                  Cancel
                </button>
                <button
                  onClick={() => onImport(validRows.map(({ errors, valid, ...rest }) => rest))}
                  disabled={validRows.length === 0}
                  className="flex-1 py-4 bg-[#4F6EF6] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 shadow-[0_10px_20px_rgba(79,110,246,0.3)] flex items-center justify-center gap-2"
                >
                  <Upload size={14} /> Import {validRows.length} Item{validRows.length !== 1 ? 's' : ''}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Invoice Manager ────────────────────────────────────────────────────────────

function InvoiceManager({ invoices, inventory, onNew, onEdit, onReceive, onDelete, onConfirmDialog }: any) {
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'received' | 'cancelled'>('all');

  const counts = {
    all: invoices.length,
    draft: invoices.filter((i: Invoice) => i.status === 'draft').length,
    sent: invoices.filter((i: Invoice) => i.status === 'sent').length,
    received: invoices.filter((i: Invoice) => i.status === 'received').length,
    cancelled: invoices.filter((i: Invoice) => i.status === 'cancelled').length,
  };

  const filtered = filter === 'all' ? invoices : invoices.filter((i: Invoice) => i.status === filter);

  const statusStyle = (s: string) => {
    switch (s) {
      case 'draft':     return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      case 'sent':      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'received':  return 'text-[#4F6EF6] bg-[#4F6EF6]/10 border-[#4F6EF6]/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:          return 'themed-text-dim';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black themed-text tracking-tighter">Purchase Invoices</h2>
          <p className="themed-text-dim text-sm font-medium mt-1">Restock from suppliers — inventory auto-updates on receipt</p>
        </div>
        <button
          onClick={onNew}
          className="bg-[#4F6EF6] text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-[0_10px_20px_rgba(79,110,246,0.3)]"
        >
          <Plus size={18} /> New Invoice
        </button>
      </header>

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'draft', 'sent', 'received', 'cancelled'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === f
                ? 'bg-[#4F6EF6] text-white'
                : 'themed-bg-secondary border themed-border themed-text-dim hover:border-[#4F6EF6]/30'
            }`}
          >
            {f} {counts[f] > 0 && <span className="ml-1 opacity-60">{counts[f]}</span>}
          </button>
        ))}
      </div>

      <div className="luxury-card overflow-hidden flex-1 flex flex-col themed-bg-secondary border themed-border">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
            <FileText size={48} className="themed-text-dim opacity-20" />
            <p className="themed-text-dim font-black text-sm uppercase tracking-widest opacity-40">
              {filter === 'all' ? 'No invoices yet' : `No ${filter} invoices`}
            </p>
            {filter === 'all' && (
              <button onClick={onNew} className="text-[#4F6EF6] text-xs font-black uppercase tracking-widest hover:underline">
                Create your first invoice →
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b themed-border text-[10px] themed-text-dim uppercase tracking-[0.2em] font-black bg-black/5">
                  <th className="py-5 px-6">Invoice</th>
                  <th className="py-5">Supplier</th>
                  <th className="py-5">Date</th>
                  <th className="py-5 text-right">Items</th>
                  <th className="py-5 text-right">Total</th>
                  <th className="py-5 text-center">Status</th>
                  <th className="py-5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y themed-border">
                {filtered.map((inv: Invoice) => (
                  <tr key={inv.id} className="hover:bg-black/5 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-black themed-text text-sm">{inv.invoiceNumber}</p>
                      {inv.notes && <p className="themed-text-dim text-[10px] mt-0.5 truncate max-w-[140px]">{inv.notes}</p>}
                    </td>
                    <td className="py-4">
                      <p className="themed-text font-bold text-sm">{inv.supplierName}</p>
                      {inv.supplierContact && <p className="themed-text-dim text-[10px]">{inv.supplierContact}</p>}
                    </td>
                    <td className="py-4 themed-text-dim text-xs">
                      {new Date(inv.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 text-right themed-text text-sm font-bold">{inv.items.length}</td>
                    <td className="py-4 text-right font-mono text-[#4F6EF6] font-black text-sm">
                      KES {inv.total.toLocaleString()}
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${statusStyle(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(inv)}
                          className="p-2 rounded-xl themed-text-dim hover:text-[#4F6EF6] hover:bg-[#4F6EF6]/5 transition-all"
                          title="View / Edit"
                        >
                          <Eye size={15} />
                        </button>
                        {(inv.status === 'draft' || inv.status === 'sent') && (
                          <button
                            onClick={() => onConfirmDialog(
                              'Receive Invoice',
                              `Mark ${inv.invoiceNumber} as received? Inventory will be restocked automatically for linked items.`,
                              () => onReceive(inv),
                              'success'
                            )}
                            className="p-2 rounded-xl themed-text-dim hover:text-[#4F6EF6] hover:bg-[#4F6EF6]/5 transition-all"
                            title="Mark as Received"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                        {inv.status !== 'received' && (
                          <button
                            onClick={() => onDelete(inv)}
                            className="p-2 rounded-xl themed-text-dim hover:text-red-500 hover:bg-red-500/5 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Invoice Modal ───────────────────────────────────────────────────────────────

interface LineItemForm {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitCost: number;
}

function InvoiceModal({ invoice, inventory, invoiceCount, onSave, onReceive, onCancel }: {
  invoice: Invoice | null;
  inventory: any[];
  invoiceCount: number;
  onSave: (inv: Invoice) => void;
  onReceive: (inv: Invoice) => void;
  onCancel: () => void;
}) {
  const isReadOnly = invoice?.status === 'received' || invoice?.status === 'cancelled';
  const year = new Date().getFullYear();
  const invoiceNumber = invoice?.invoiceNumber || `INV-${year}-${String(invoiceCount + 1).padStart(4, '0')}`;

  const [supplierName, setSupplierName] = useState(invoice?.supplierName || '');
  const [supplierContact, setSupplierContact] = useState(invoice?.supplierContact || '');
  const [notes, setNotes] = useState(invoice?.notes || '');
  const [lineItems, setLineItems] = useState<LineItemForm[]>(
    invoice?.items?.length
      ? invoice.items.map((i: any) => ({ id: i.id, productId: i.productId || '', name: i.name, quantity: i.quantity, unitCost: i.unitCost }))
      : [{ id: crypto.randomUUID(), productId: '', name: '', quantity: 1, unitCost: 0 }]
  );
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');

  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const validItems = lineItems.filter(i => i.name.trim());

  const updateItem = (id: string, field: keyof LineItemForm, value: any) =>
    setLineItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const removeItem = (id: string) => {
    if (lineItems.length > 1) setLineItems(prev => prev.filter(i => i.id !== id));
  };

  const selectFromInventory = (product: any, itemId: string) => {
    setLineItems(prev => prev.map(i => i.id === itemId
      ? { ...i, productId: product.id, name: product.name, unitCost: product.price }
      : i
    ));
    setPickerFor(null);
    setProductSearch('');
  };

  const buildInvoice = (status: InvoiceStatus): Invoice => ({
    id: invoice?.id || crypto.randomUUID(),
    invoiceNumber,
    supplierName,
    supplierContact: supplierContact || undefined,
    notes: notes || undefined,
    items: validItems.map(i => ({
      id: i.id,
      productId: i.productId || undefined,
      name: i.name,
      quantity: i.quantity,
      unitCost: i.unitCost,
      total: i.quantity * i.unitCost,
    })),
    subtotal,
    total: subtotal,
    status,
    createdAt: invoice?.createdAt || Date.now(),
    updatedAt: Date.now(),
    receivedAt: invoice?.receivedAt,
  });

  const pickerResults = inventory
    .filter((p: any) => productSearch ? p.name.toLowerCase().includes(productSearch.toLowerCase()) : true)
    .slice(0, 8);

  const statusColor = (s?: string) => {
    switch (s) {
      case 'received':  return 'text-[#4F6EF6] bg-[#4F6EF6]/10 border-[#4F6EF6]/20';
      case 'sent':      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:          return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl themed-bg-secondary border themed-border rounded-[2.5rem] flex flex-col max-h-[92vh] shadow-2xl"
      >
        {/* Header */}
        <div className="p-8 pb-4 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-black themed-text tracking-tighter">
                {!invoice ? 'New Purchase Invoice' : invoiceNumber}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                {invoice?.status && (
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${statusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                )}
                {invoice?.receivedAt && (
                  <span className="text-[10px] themed-text-dim">
                    Received {new Date(invoice.receivedAt).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
                  </span>
                )}
                {!invoice && <span className="text-[10px] themed-text-dim font-mono">{invoiceNumber}</span>}
              </div>
            </div>
            <button onClick={onCancel} className="p-2 themed-text-dim hover:themed-text transition-colors mt-1">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pb-4 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {/* Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] themed-text-dim font-black uppercase tracking-widest mb-2">Supplier Name *</label>
              <input
                type="text"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                disabled={isReadOnly}
                placeholder="e.g. Nairobi Distributors Ltd"
                className="w-full bg-black/10 border themed-border rounded-2xl px-4 py-3 themed-text text-sm outline-none focus:border-[#4F6EF6]/40 transition-colors disabled:opacity-50 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] themed-text-dim font-black uppercase tracking-widest mb-2">Contact (optional)</label>
              <input
                type="text"
                value={supplierContact}
                onChange={e => setSupplierContact(e.target.value)}
                disabled={isReadOnly}
                placeholder="Phone or email"
                className="w-full bg-black/10 border themed-border rounded-2xl px-4 py-3 themed-text text-sm outline-none focus:border-[#4F6EF6]/40 transition-colors disabled:opacity-50 font-medium"
              />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] themed-text-dim font-black uppercase tracking-widest">Items</label>
              {!isReadOnly && (
                <button
                  onClick={() => setLineItems(prev => [...prev, { id: crypto.randomUUID(), productId: '', name: '', quantity: 1, unitCost: 0 }])}
                  className="flex items-center gap-1.5 text-[10px] text-[#4F6EF6] font-black uppercase tracking-widest hover:opacity-70 transition-all"
                >
                  <Plus size={11} /> Add Row
                </button>
              )}
            </div>
            <div className="rounded-2xl border themed-border overflow-visible">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-black/10 border-b themed-border">
                    <th className="py-3 px-4 text-left themed-text-dim font-black uppercase tracking-widest">Item</th>
                    <th className="py-3 px-3 text-right themed-text-dim font-black uppercase tracking-widest w-16">Qty</th>
                    <th className="py-3 px-3 text-right themed-text-dim font-black uppercase tracking-widest w-28">Unit Cost</th>
                    <th className="py-3 px-4 text-right themed-text-dim font-black uppercase tracking-widest w-24">Total</th>
                    {!isReadOnly && <th className="py-3 px-3 w-8" />}
                  </tr>
                </thead>
                <tbody className="divide-y themed-border">
                  {lineItems.map(item => (
                    <tr key={item.id}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={e => updateItem(item.id, 'name', e.target.value)}
                            disabled={isReadOnly}
                            placeholder="Item name"
                            className="flex-1 bg-transparent themed-text font-medium outline-none placeholder:opacity-30 text-sm disabled:opacity-60"
                          />
                          {!isReadOnly && (
                            <div className="relative">
                              <button
                                onClick={() => { setPickerFor(pickerFor === item.id ? null : item.id); setProductSearch(''); }}
                                className="text-[#4F6EF6]/30 hover:text-[#4F6EF6] transition-colors"
                                title="Pick from inventory"
                              >
                                <Package size={13} />
                              </button>
                              {pickerFor === item.id && (
                                <div className="absolute left-0 top-7 z-[60] w-60 themed-bg-secondary border themed-border rounded-2xl shadow-2xl overflow-hidden">
                                  <div className="p-2">
                                    <input
                                      autoFocus
                                      type="text"
                                      value={productSearch}
                                      onChange={e => setProductSearch(e.target.value)}
                                      placeholder="Search inventory..."
                                      className="w-full bg-black/10 border themed-border rounded-xl px-3 py-2 text-xs themed-text outline-none"
                                    />
                                  </div>
                                  <div className="max-h-44 overflow-y-auto">
                                    {pickerResults.length === 0
                                      ? <p className="px-4 py-3 text-xs themed-text-dim">No matches</p>
                                      : pickerResults.map((p: any) => (
                                          <button
                                            key={p.id}
                                            onClick={() => selectFromInventory(p, item.id)}
                                            className="w-full text-left px-4 py-2.5 hover:bg-[#4F6EF6]/8 transition-colors"
                                          >
                                            <p className="text-xs themed-text font-bold">{p.name}</p>
                                            <p className="text-[10px] themed-text-dim">{p.category} · KES {p.price.toLocaleString()}</p>
                                          </button>
                                        ))
                                    }
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {item.productId && <p className="text-[9px] text-[#4F6EF6]/50 mt-0.5 pl-0">linked to inventory</p>}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number" min="1"
                          value={item.quantity}
                          onChange={e => updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          disabled={isReadOnly}
                          className="w-14 bg-transparent themed-text font-bold text-right outline-none disabled:opacity-60"
                        />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number" min="0"
                          value={item.unitCost}
                          onChange={e => updateItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly}
                          className="w-24 bg-transparent font-mono text-[#4F6EF6] font-bold text-right outline-none disabled:opacity-60"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#4F6EF6] font-black">
                        {(item.quantity * item.unitCost).toLocaleString()}
                      </td>
                      {!isReadOnly && (
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={lineItems.length === 1}
                            className="themed-text-dim hover:text-red-400 transition-colors disabled:opacity-20"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] themed-text-dim font-black uppercase tracking-widest mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={isReadOnly}
              placeholder="Payment terms, delivery date, PO reference..."
              rows={2}
              className="w-full bg-black/10 border themed-border rounded-2xl px-4 py-3 themed-text text-sm outline-none focus:border-[#4F6EF6]/40 transition-colors resize-none disabled:opacity-50 font-medium"
            />
          </div>

          {/* Total */}
          <div className="bg-[#4F6EF6]/5 border border-[#4F6EF6]/15 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black themed-text-dim uppercase tracking-widest">Invoice Total</p>
              <p className="text-[10px] themed-text-dim mt-0.5">
                {validItems.filter(i => i.productId).length}/{validItems.length} items linked to inventory
              </p>
            </div>
            <p className="text-2xl font-black font-mono text-[#4F6EF6]">KES {subtotal.toLocaleString()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 pt-4 shrink-0 flex gap-3 flex-wrap border-t themed-border">
          <button onClick={onCancel} className="px-6 py-3.5 bg-black/5 themed-text-dim border themed-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/10 transition-all">
            {isReadOnly ? 'Close' : 'Cancel'}
          </button>

          {!isReadOnly && (
            <>
              <button
                onClick={() => onSave(buildInvoice('draft'))}
                disabled={!supplierName.trim()}
                className="flex-1 px-6 py-3.5 border themed-border themed-text rounded-2xl font-black text-xs uppercase tracking-widest hover:border-[#4F6EF6]/40 transition-all disabled:opacity-30"
              >
                Save Draft
              </button>
              <button
                onClick={() => onSave(buildInvoice('sent'))}
                disabled={!supplierName.trim() || validItems.length === 0}
                className="flex-1 px-6 py-3.5 border border-amber-500/25 text-amber-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-500/5 transition-all disabled:opacity-30"
              >
                Mark Sent
              </button>
              <button
                onClick={() => onReceive(buildInvoice('received'))}
                disabled={!supplierName.trim() || validItems.length === 0}
                className="flex-1 px-6 py-3.5 bg-[#4F6EF6] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 shadow-[0_8px_20px_rgba(79,110,246,0.3)] flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={14} /> Receive &amp; Restock
              </button>
            </>
          )}

          {isReadOnly && invoice?.status === 'sent' && (
            <button
              onClick={() => onReceive(invoice)}
              className="flex-1 px-6 py-3.5 bg-[#4F6EF6] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_8px_20px_rgba(79,110,246,0.3)] flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={14} /> Receive &amp; Restock
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const CATEGORIES_BY_BUSINESS_TYPE: Record<string, string[]> = {
  bar:        ['Beers', 'Spirits', 'Wines', 'Cocktails', 'Non-Alcoholic', 'Food', 'Shisha / Hookah', 'Other'],
  nightclub:  ['Beers', 'Spirits', 'Wines', 'Cocktails', 'Non-Alcoholic', 'Food', 'Shisha / Hookah', 'VIP Packages', 'Other'],
  restaurant: ['Mains', 'Starters', 'Sides', 'Desserts', 'Hot Drinks', 'Cold Drinks', 'Specials', 'Takeaway', 'Other'],
  cafe:       ['Hot Drinks', 'Cold Drinks', 'Pastries & Snacks', 'Meals', 'Smoothies', 'Other'],
  spa:        ['Hair', 'Nails', 'Skin & Facials', 'Massage', 'Waxing', 'Make-up', 'Spa Packages', 'Products', 'Other'],
  salon:      ['Hair', 'Nails', 'Skin & Facials', 'Waxing', 'Make-up', 'Products', 'Other'],
  gym:        ['Access', 'Membership', 'Classes', 'Personal Training', 'Supplements', 'Merchandise', 'Other'],
  shop:       ['Electronics', 'Clothing', 'Food & Groceries', 'Household', 'Beauty & Personal Care', 'Stationery', 'General', 'Other'],
  hardware:   ['Building Materials', 'Plumbing', 'Electrical', 'Paints', 'Tools', 'Timber & Boards', 'Fasteners', 'Other'],
  rental:     ['Rooms', 'Conference & Events', 'Laundry', 'Food & Beverages', 'Transport', 'Extras', 'Other'],
  hotel:      ['Rooms', 'Restaurant', 'Bar', 'Conference & Events', 'Laundry', 'Spa', 'Transport', 'Extras', 'Other'],
  pharmacy:   ['OTC Medicines', 'Prescription', 'Vitamins & Supplements', 'Cosmetics & Beauty', 'Baby Care', 'Medical Devices', 'Other'],
};

function getBusinessCategories(businessType: string, existingCategories: string[] = []): string[] {
  const base = CATEGORIES_BY_BUSINESS_TYPE[businessType] ?? ['General', 'Other'];
  return Array.from(new Set([...base, ...existingCategories.filter(c => c && !base.includes(c))]));
}

function InventoryEditModal({ item, businessType = '', existingCategories = [], onConfirm, onCancel }: {
  item: any;
  businessType?: string;
  existingCategories?: string[];
  onConfirm: (updated: any) => void;
  onCancel: () => void;
}) {
  const isService = item.type === ProductType.SERVICE;
  const [formData, setFormData] = useState({
    ...item,
    price: item.price === 0 ? '' : item.price,
    stock: isService ? '' : (item.stock === 0 ? '' : item.stock),
    type: item.type || 'DRINK',
  });
  const [customCategory, setCustomCategory] = useState('');
  const itemIsService = formData.type === ProductType.SERVICE;

  const suggestedCategories = getBusinessCategories(businessType, existingCategories);
  const isCurrentCustom = formData.category && !suggestedCategories.includes(formData.category);
  const [showCustom, setShowCustom] = useState(isCurrentCustom);

  const handleConfirm = () => {
    onConfirm({
      ...formData,
      price: Math.round(Number(formData.price || 0)),
      stock: itemIsService ? 9999 : Number(formData.stock || 0),
      type: itemIsService ? ProductType.SERVICE : (formData.type || 'DRINK'),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md themed-bg-secondary border themed-border rounded-[2.5rem] p-8 shadow-2xl my-4">
        <h3 className="text-2xl font-black themed-text mb-2">{item.id === 'NEW' ? 'New Inventory Item' : 'Edit Item'}</h3>
        <p className="themed-text-dim text-sm mb-6 font-medium uppercase tracking-[0.2em]">MADIS Inventory System</p>

        <div className="space-y-5">

          {/* Item Type toggle */}
          <div className="space-y-2">
            <label className="text-[10px] themed-text-dim uppercase font-black tracking-widest block font-mono">Item Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'DRINK' })}
                className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                  !itemIsService
                    ? 'bg-[#4F6EF6] text-white border-[#4F6EF6]'
                    : 'bg-black/5 themed-text-dim themed-border hover:border-[#4F6EF6]/30'
                }`}
              >
                Physical / Product
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: ProductType.SERVICE })}
                className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                  itemIsService
                    ? 'bg-[#4F6EF6] text-white border-[#4F6EF6]'
                    : 'bg-black/5 themed-text-dim themed-border hover:border-[#4F6EF6]/30'
                }`}
              >
                Service
              </button>
            </div>
            {itemIsService && (
              <p className="text-[10px] text-[#4F6EF6]/70 font-medium">
                Services don't have stock counts — they won't appear as low stock.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] themed-text-dim uppercase font-black tracking-widest block font-mono">Item Name</label>
            <input
              type="text"
              required
              autoFocus
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full themed-bg-primary border themed-border rounded-2xl py-4 px-6 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold"
              placeholder={itemIsService ? 'e.g. Manicure, Full Body Massage, Day Pass…' : 'e.g. Tusker Cider, Chapati, Paracetamol…'}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] themed-text-dim uppercase font-black tracking-widest block font-mono">Category</label>
            <select
              value={showCustom ? '__custom__' : (formData.category || '')}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setShowCustom(true);
                  setFormData({ ...formData, category: customCategory });
                } else {
                  setShowCustom(false);
                  setFormData({ ...formData, category: e.target.value });
                }
              }}
              className="w-full themed-bg-primary border themed-border rounded-2xl py-4 px-6 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold appearance-none"
            >
              <option value="" disabled>Select category…</option>
              {suggestedCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__custom__">+ New category…</option>
            </select>
            {showCustom && (
              <input
                type="text"
                autoFocus
                value={customCategory}
                onChange={(e) => {
                  setCustomCategory(e.target.value);
                  setFormData({ ...formData, category: e.target.value });
                }}
                className="w-full themed-bg-primary border border-[#4F6EF6]/40 rounded-2xl py-4 px-6 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold mt-2"
                placeholder="Type new category name…"
              />
            )}
          </div>

          <div className={`grid gap-4 ${itemIsService ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="space-y-2">
              <label className="text-[10px] themed-text-dim uppercase font-black tracking-widest block font-mono">Price (KES)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full themed-bg-primary border themed-border rounded-2xl py-4 px-6 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold"
                placeholder="0"
              />
            </div>
            {!itemIsService && (
              <div className="space-y-2">
                <label className="text-[10px] themed-text-dim uppercase font-black tracking-widest block font-mono">Stock Level</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full themed-bg-primary border themed-border rounded-2xl py-4 px-6 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold"
                  placeholder="0"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <button onClick={onCancel} className="py-4 bg-black/5 themed-text-dim border themed-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/10 transition-all font-mono">DISCARD</button>
          <button
            onClick={handleConfirm}
            disabled={!formData.name || !formData.category}
            className="py-4 bg-[#4F6EF6] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 shadow-[0_10px_20px_rgba(79,110,246,0.3)]"
          >CONFIRM</button>
        </div>
      </div>
    </div>
  );
}

function RoomManager({ rooms, setRooms, tabs, onBillToRoom }: any) {
  const [editingRoom, setEditingRoom] = useState<any | null>(null);

  const getActiveTabForRoom = (roomNum: string) => {
    return tabs.find((t: any) =>
      (t.customerName.includes(`Room ${roomNum}`) || t.items.some((i: any) => i.name === `Room ${roomNum}`)) &&
      String(t.status).toUpperCase() === TabStatus.OPEN
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black themed-text tracking-tighter">Room Directory</h2>
          <p className="themed-text-dim text-sm">Accommodation management and charging</p>
        </div>
        <button
          onClick={() => setEditingRoom({ id: 'NEW', number: '', type: 'Standard', price: 3500, status: 'AVAILABLE' })}
          className="bg-[#4F6EF6] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
        >
          <Plus size={18} /> Add Room
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {rooms.map((room: any) => {
          const activeTab = getActiveTabForRoom(room.number);
          return (
            <div key={room.id} className="p-8 themed-bg-secondary border themed-border rounded-[2.5rem] shadow-xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] themed-text-dim uppercase font-black tracking-widest mb-1">Room {room.type}</p>
                  <h4 className="text-4xl font-black themed-text tracking-tighter">{room.number}</h4>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${room.status === 'AVAILABLE' ? 'bg-[#4F6EF6]/10 text-[#4F6EF6] border-[#4F6EF6]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {room.status}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-xs">
                  <span className="themed-text-dim font-bold uppercase tracking-widest">Base Rate</span>
                  <span className="themed-text font-black">KES {room.price.toLocaleString()}</span>
                </div>
                {activeTab && (
                  <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
                    <p className="text-[9px] text-orange-500 uppercase font-black tracking-wider mb-1">Pending Bill</p>
                    <p className="text-lg font-black themed-text leading-tight">KES {activeTab.total.toLocaleString()}</p>
                    <p className="text-[9px] themed-text-dim mt-1 truncate">Current Tab: {activeTab.id.slice(0, 8)}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => onBillToRoom(room)} className="flex-1 py-4 bg-[#4F6EF6] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md">
                  Bill Room
                </button>
                <button onClick={() => setEditingRoom(room)} className="p-4 bg-black/5 themed-text-dim border themed-border rounded-2xl hover:bg-black/10 transition-all">
                  <Settings size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md themed-bg-secondary border themed-border rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-2xl font-black themed-text mb-2">{editingRoom.id === 'NEW' ? 'New Room Registry' : 'Edit Room'}</h3>
            <div className="space-y-4 mt-6">
              <input value={editingRoom.number} onChange={e => setEditingRoom({ ...editingRoom, number: e.target.value })} placeholder="Room Number" className="w-full themed-bg-primary border themed-border rounded-2xl py-4 px-6 themed-text font-bold" />
              <input value={editingRoom.type} onChange={e => setEditingRoom({ ...editingRoom, type: e.target.value })} placeholder="Room Type (e.g. Deluxe)" className="w-full themed-bg-primary border themed-border rounded-2xl py-4 px-6 themed-text font-bold" />
              <input type="number" value={editingRoom.price || ''} onChange={e => setEditingRoom({ ...editingRoom, price: e.target.value })} placeholder="Nightly Rate" className="w-full themed-bg-primary border themed-border rounded-2xl py-4 px-6 themed-text font-bold" />
              <select value={editingRoom.status} onChange={e => setEditingRoom({ ...editingRoom, status: e.target.value })} className="w-full themed-bg-primary border themed-border rounded-2xl py-4 px-6 themed-text font-bold appearance-none">
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setEditingRoom(null)} className="py-4 bg-black/5 themed-text-dim border themed-border rounded-2xl font-black text-xs uppercase">Discard</button>
              <button
                onClick={() => {
                  const finalRoom = { ...editingRoom, price: Math.round(Number(editingRoom.price || 0)) };
                  if (editingRoom.id === 'NEW') setRooms([...rooms, { ...finalRoom, id: crypto.randomUUID() }]);
                  else setRooms(rooms.map((r: any) => r.id === editingRoom.id ? finalRoom : r));
                  setEditingRoom(null);
                }}
                className="py-4 bg-[#4F6EF6] text-white rounded-2xl font-black text-xs uppercase shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffManager({ staff, setStaff, addAuditLog, currentUser, setEditingStaff, onConfirmDialog }: any) {
  const revokeAccess = (id: string) => {
    const staffMember = staff.find((s: any) => s.id === id);
    if (staffMember?.id === currentUser.id) return;
    onConfirmDialog(
      'Revoke Access',
      `Remove "${staffMember?.name}" from the system? This cannot be undone.`,
      () => {
        setStaff(staff.filter((s: any) => s.id !== id));
        addAuditLog(currentUser, 'Access Revoked', `Revoked access for ${staffMember?.name}`);
      },
      'danger'
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black themed-text tracking-tighter">Staff Roster</h2>
          <p className="themed-text-dim text-sm">Security clearance and PIN management</p>
        </div>
        <button
          onClick={() => setEditingStaff({ id: 'NEW', name: '', pin: '', role: UserRole.STAFF })}
          className="bg-[#4F6EF6] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus size={20} /> ADD NEW
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((u: User) => (
          <div key={u.id} className="p-6 themed-bg-secondary border themed-border rounded-3xl group relative overflow-hidden transition-all hover:border-black/10 shadow-lg">
            <div className={`absolute top-0 right-0 p-3 text-[10px] font-black uppercase tracking-widest ${String(u.role).toUpperCase() === UserRole.OWNER ? 'bg-[#4F6EF6] text-white' : 'bg-black/5 themed-text-dim'}`}>
              {u.role}
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center themed-border border">
                <UserIcon className="themed-text-dim" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-lg font-black themed-text truncate">{u.name}</h4>
                <p className="text-xs themed-text-dim truncate">Employee ID: {u.id.slice(0, 8)}</p>
              </div>
            </div>

            <div className="bg-black/5 rounded-xl p-4 flex items-center justify-between border themed-border">
              <div>
                <p className="text-[10px] themed-text-dim uppercase font-black">Assigned PIN</p>
                <p className="text-lg font-mono font-black tracking-widest text-[#4F6EF6]">****</p>
              </div>
              <button onClick={() => setEditingStaff(u)} className="text-xs font-black themed-text-dim hover:text-[#4F6EF6] transition-colors flex items-center gap-2">
                <Settings size={14} /> EDIT
              </button>
            </div>

            {u.id !== currentUser.id && (
              <button
                onClick={() => revokeAccess(u.id)}
                className="mt-6 w-full py-3 text-red-500 opacity-40 hover:opacity-100 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all text-sm font-black md:opacity-0 group-hover:opacity-100"
              >
                REVOKE ACCESS
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StaffEditModal({ staff, onConfirm, onCancel, currentUser }: { staff: any; onConfirm: (updated: any) => void; onCancel: () => void; currentUser: User }) {
  const [formData, setFormData] = useState({ ...staff, pin: '' });
  const [showPin, setShowPin] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md themed-bg-secondary border themed-border rounded-[2.5rem] p-8 shadow-2xl">
        <h3 className="text-2xl font-black themed-text mb-2">{staff.id === 'NEW' ? 'Register New Staff' : 'Modify Credentials'}</h3>
        <p className="themed-text-dim text-sm mb-8 font-medium uppercase tracking-[0.2em]">MADIS Security Protocol</p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] themed-text-dim uppercase font-black tracking-widest block font-mono">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full themed-bg-primary border themed-border rounded-2xl py-4 px-6 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold"
              placeholder="e.g. John Smith"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] themed-text-dim uppercase font-black tracking-widest block font-mono">Permission Tier</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full themed-bg-primary border themed-border rounded-2xl py-4 px-6 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold appearance-none"
            >
              <option value={UserRole.STAFF}>Service Staff</option>
              <option value={UserRole.SUPERVISOR}>Supervisor</option>
              <option value={UserRole.ADMIN}>Admin</option>
              {(String(formData.role).toUpperCase() === UserRole.OWNER || String(currentUser.role).toUpperCase() === UserRole.OWNER) && (
                <option value={UserRole.OWNER}>System Owner</option>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] themed-text-dim uppercase font-black tracking-widest block font-mono">
              Security PIN (4 Digits){staff.id !== 'NEW' && <span className="text-[#4F6EF6]/50 ml-2">— leave blank to keep current</span>}
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                className="w-full themed-bg-primary border themed-border rounded-2xl py-4 px-6 text-2xl text-[#4F6EF6] focus:outline-none focus:border-[#4F6EF6] transition-all font-mono font-black tracking-[1em]"
                placeholder={staff.id === 'NEW' ? '0000' : '••••'}
              />
              <button onClick={() => setShowPin(!showPin)} className="absolute right-4 top-1/2 -translate-y-1/2 themed-text-dim hover:themed-text transition-all">
                {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-10">
          <button onClick={onCancel} className="py-4 bg-black/5 themed-text-dim border themed-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/10 transition-all font-mono">DISCARD</button>
          <button
            onClick={() => onConfirm(formData)}
            disabled={!formData.name || (staff.id === 'NEW' && formData.pin.length !== 4)}
            className="py-4 bg-[#4F6EF6] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 shadow-[0_10px_20px_rgba(0,255,136,0.3)]"
          >
            AUTHORIZE
          </button>
        </div>
      </div>
    </div>
  );
}

function AppointmentsManager({ appointments, setAppointments, staff, inventory, currentUser, addAuditLog, editingAppointment, setEditingAppointment, onConfirmDialog }: any) {
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'in_progress' | 'done' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const today = new Date().toISOString().split('T')[0];
  const filtered = appointments.filter((a: Appointment) => {
    const matchStatus = filter === 'all' || a.status === filter;
    const matchDate = !dateFilter || a.date === dateFilter;
    return matchStatus && matchDate;
  }).sort((a: Appointment, b: Appointment) => a.time.localeCompare(b.time));

  const statusColor: Record<string, string> = {
    scheduled:   'bg-[#4F6EF6]/10 text-[#4F6EF6] border-[#4F6EF6]/20',
    in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    done:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled:   'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const advanceStatus = (appt: Appointment) => {
    const next: Record<string, Appointment['status']> = {
      scheduled: 'in_progress', in_progress: 'done', done: 'done', cancelled: 'cancelled',
    };
    const updated = appointments.map((a: Appointment) =>
      a.id === appt.id ? { ...a, status: next[a.status] } : a
    );
    setAppointments(updated);
    addAuditLog(currentUser, 'Appointment Updated', `${appt.clientName} → ${next[appt.status]}`);
  };

  const cancelAppt = (appt: Appointment) => {
    onConfirmDialog('Cancel Appointment', `Cancel appointment for ${appt.clientName}?`, () => {
      setAppointments(appointments.map((a: Appointment) =>
        a.id === appt.id ? { ...a, status: 'cancelled' } : a
      ));
      addAuditLog(currentUser, 'Appointment Cancelled', `Cancelled for ${appt.clientName}`);
    }, 'danger');
  };

  const deleteAppt = (appt: Appointment) => {
    onConfirmDialog('Delete Appointment', `Permanently remove appointment for ${appt.clientName}?`, () => {
      setAppointments(appointments.filter((a: Appointment) => a.id !== appt.id));
      addAuditLog(currentUser, 'Appointment Deleted', `Deleted for ${appt.clientName}`);
    }, 'danger');
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black themed-text tracking-tighter">Appointments</h2>
          <p className="themed-text-dim text-sm">Client bookings, schedule & status</p>
        </div>
        <button
          onClick={() => setEditingAppointment({ id: 'NEW' } as Appointment)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#4F6EF6] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_8px_20px_rgba(79,110,246,0.3)] shrink-0"
        >
          <Plus size={14} /> New
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="themed-bg-secondary border themed-border rounded-2xl py-2.5 px-4 themed-text text-sm focus:outline-none focus:border-[#4F6EF6]/40"
        />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'scheduled', 'in_progress', 'done', 'cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-[#4F6EF6] text-white' : 'themed-bg-secondary border themed-border themed-text-dim hover:themed-text'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
        {filtered.map((appt: Appointment) => {
          const assignedStaff = staff.find((s: any) => s.id === appt.staffId);
          return (
            <div key={appt.id} className="p-5 themed-bg-secondary border themed-border rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[#4F6EF6]/20 transition-all shadow-sm">
              {/* Time column */}
              <div className="text-center w-16 shrink-0">
                <p className="text-xl font-black text-[#4F6EF6] font-mono leading-none">{appt.time}</p>
                <p className="text-[9px] themed-text-dim font-black uppercase tracking-widest mt-1">{appt.duration}min</p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-black themed-text text-base">{appt.clientName}</h4>
                  {appt.clientPhone && <span className="text-[10px] themed-text-dim font-mono">{appt.clientPhone}</span>}
                </div>
                <p className="text-sm themed-text-dim font-medium">{appt.serviceName}</p>
                {assignedStaff && <p className="text-[10px] themed-text-dim mt-0.5">Staff: <span className="themed-text font-bold">{assignedStaff.name}</span></p>}
                {appt.notes && <p className="text-[10px] text-[#4F6EF6]/60 mt-1 italic">{appt.notes}</p>}
              </div>

              {/* Status + actions */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColor[appt.status]}`}>
                  {appt.status.replace('_', ' ')}
                </span>
                {appt.status !== 'done' && appt.status !== 'cancelled' && (
                  <button
                    onClick={() => advanceStatus(appt)}
                    className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                  >
                    {appt.status === 'scheduled' ? 'Start' : 'Done'}
                  </button>
                )}
                <button onClick={() => setEditingAppointment(appt)} className="p-2 themed-text-dim hover:text-[#4F6EF6] border themed-border rounded-xl transition-all">
                  <Settings size={14} />
                </button>
                {appt.status !== 'cancelled' && (
                  <button onClick={() => cancelAppt(appt)} className="p-2 text-amber-400/50 hover:text-amber-400 border border-transparent hover:border-amber-500/20 rounded-xl transition-all">
                    <X size={14} />
                  </button>
                )}
                <button onClick={() => deleteAppt(appt)} className="p-2 text-red-500/40 hover:text-red-500 border border-transparent hover:border-red-500/20 rounded-xl transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 opacity-20">
            <Calendar size={36} className="themed-text-dim mb-3" />
            <p className="text-sm font-black themed-text uppercase tracking-widest">No appointments {dateFilter === today ? 'today' : 'for this date'}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {editingAppointment && (
          <AppointmentEditModal
            appt={editingAppointment}
            staff={staff}
            services={inventory}
            onConfirm={(data: Appointment) => {
              if (data.id === 'NEW') {
                const newAppt = { ...data, id: `appt_${Date.now()}`, createdAt: Date.now() };
                setAppointments([...appointments, newAppt]);
                addAuditLog(currentUser, 'Appointment Created', `Booked ${data.clientName} for ${data.serviceName}`);
              } else {
                setAppointments(appointments.map((a: Appointment) => a.id === data.id ? data : a));
                addAuditLog(currentUser, 'Appointment Updated', `Updated ${data.clientName}`);
              }
              setEditingAppointment(null);
            }}
            onCancel={() => setEditingAppointment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AppointmentEditModal({ appt, staff, services, onConfirm, onCancel }: {
  appt: Appointment;
  staff: any[];
  services: any[];
  onConfirm: (a: Appointment) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Appointment>({
    id: appt.id,
    clientName: appt.clientName || '',
    clientPhone: appt.clientPhone || '',
    serviceName: appt.serviceName || '',
    serviceId: appt.serviceId || '',
    staffId: appt.staffId || (staff[0]?.id ?? ''),
    date: appt.date || new Date().toISOString().split('T')[0],
    time: appt.time || '09:00',
    duration: appt.duration || 60,
    notes: appt.notes || '',
    status: appt.status || 'scheduled',
    createdAt: appt.createdAt || Date.now(),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md themed-bg-secondary border themed-border rounded-[2.5rem] p-8 shadow-2xl my-4">
        <h3 className="text-2xl font-black themed-text mb-1">{appt.id === 'NEW' ? 'New Appointment' : 'Edit Appointment'}</h3>
        <p className="themed-text-dim text-[10px] uppercase tracking-widest font-black mb-6">MADIS Scheduling</p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] themed-text-dim uppercase font-black tracking-widest block">Client Name</label>
            <input type="text" autoFocus value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })}
              className="w-full themed-bg-primary border themed-border rounded-2xl py-3.5 px-5 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold"
              placeholder="e.g. Jane Wanjiru" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] themed-text-dim uppercase font-black tracking-widest block">Phone (optional)</label>
            <input type="tel" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })}
              className="w-full themed-bg-primary border themed-border rounded-2xl py-3.5 px-5 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold"
              placeholder="+254 7XX XXX XXX" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] themed-text-dim uppercase font-black tracking-widest block">Service</label>
            {services.length > 0 ? (
              <select value={form.serviceId} onChange={e => {
                const svc = services.find((s: any) => s.id === e.target.value);
                setForm({ ...form, serviceId: e.target.value, serviceName: svc?.name || '' });
              }} className="w-full themed-bg-primary border themed-border rounded-2xl py-3.5 px-5 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold appearance-none">
                <option value="">Select service…</option>
                {services.map((s: any) => <option key={s.id} value={s.id}>{s.name} — KES {s.price}</option>)}
              </select>
            ) : (
              <input type="text" value={form.serviceName} onChange={e => setForm({ ...form, serviceName: e.target.value })}
                className="w-full themed-bg-primary border themed-border rounded-2xl py-3.5 px-5 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold"
                placeholder="e.g. Deep Tissue Massage" />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] themed-text-dim uppercase font-black tracking-widest block">Assigned Staff</label>
            <select value={form.staffId} onChange={e => setForm({ ...form, staffId: e.target.value })}
              className="w-full themed-bg-primary border themed-border rounded-2xl py-3.5 px-5 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold appearance-none">
              {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] themed-text-dim uppercase font-black tracking-widest block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full themed-bg-primary border themed-border rounded-2xl py-3.5 px-4 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] themed-text-dim uppercase font-black tracking-widest block">Time</label>
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                className="w-full themed-bg-primary border themed-border rounded-2xl py-3.5 px-4 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] themed-text-dim uppercase font-black tracking-widest block">Duration (minutes)</label>
            <select value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
              className="w-full themed-bg-primary border themed-border rounded-2xl py-3.5 px-5 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-bold appearance-none">
              {[15, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} minutes</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] themed-text-dim uppercase font-black tracking-widest block">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full themed-bg-primary border themed-border rounded-2xl py-3.5 px-5 themed-text focus:outline-none focus:border-[#4F6EF6] transition-all font-medium resize-none text-sm"
              placeholder="Allergies, preferences, etc." />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button onClick={onCancel} className="py-4 bg-black/5 themed-text-dim border themed-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/10 transition-all">Cancel</button>
          <button
            onClick={() => onConfirm(form)}
            disabled={!form.clientName || !form.serviceName || !form.staffId}
            className="py-4 bg-[#4F6EF6] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 shadow-[0_10px_20px_rgba(79,110,246,0.3)]"
          >
            {appt.id === 'NEW' ? 'Book' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AuditViewer({ logs }: { logs: any[] }) {
  const actionColor = (action: string) => {
    if (action.includes('Login') || action.includes('Logout')) return 'bg-blue-400';
    if (action.includes('Delete') || action.includes('Revoke') || action.includes('Cancel')) return 'bg-red-500';
    if (action.includes('Settled') || action.includes('Paid') || action.includes('Closed')) return 'bg-[#4F6EF6]';
    return 'bg-[#4F6EF6]/50';
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <header>
        <h2 className="text-2xl font-black themed-text tracking-tighter">System Audit</h2>
        <p className="themed-text-dim text-sm">Immutable log of all critical actions</p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {logs.map(log => (
          <div key={log.id} className="p-4 themed-bg-secondary border themed-border rounded-2xl flex items-center justify-between gap-6 hover:border-[#4F6EF6]/20 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full shrink-0 ${actionColor(log.action)}`} />
              <div>
                <p className="text-sm font-black themed-text">{log.action}</p>
                <p className="text-xs themed-text-dim">{log.details}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] themed-text font-black uppercase tracking-wider">{log.userName}</p>
              <p className="text-[10px] themed-text-dim font-mono">{new Date(log.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="h-48 flex items-center justify-center opacity-20">
            <p className="text-sm font-black uppercase tracking-widest themed-text">No audit events yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
