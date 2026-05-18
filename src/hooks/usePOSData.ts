import { useState, useEffect, useRef } from 'react';
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { User, InventoryItem, Tab, AuditLog, TabStatus, ProductType, Room, BusinessType } from '../types';

function cleanData(data: any): any {
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(cleanData);
  const clean: any = {};
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== undefined) {
      clean[key] = cleanData(value);
    }
  });
  return clean;
}

export interface POSData {
  staff: User[];
  setStaff: (staff: User[]) => Promise<void>;
  inventory: InventoryItem[];
  setInventory: (inventory: InventoryItem[]) => Promise<void>;
  tabs: Tab[];
  setTabs: (tabs: Tab[]) => Promise<void>;
  deleteTab: (tabId: string) => Promise<void>;
  rooms: Room[];
  setRooms: (rooms: Room[]) => Promise<void>;
  auditLogs: AuditLog[];
  addAuditLog: (user: User, action: string, details: string) => Promise<void>;
  isOnline: boolean;
  isLoading: boolean;
}

const LS = {
  get: <T>(key: string, fallback: T): T => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (key: string, value: unknown) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full */ }
  },
};

function getDefaultInventory(businessType: BusinessType): InventoryItem[] {
  switch (businessType) {
    case 'bar':
    case 'nightclub':
      return [
        { id: 'i1', name: 'Tusker Lager', price: 400, stock: 120, category: 'Beers', isQuickSell: true, type: ProductType.DRINK },
        { id: 'i2', name: 'Hennessy VS 750ml', price: 8500, stock: 24, category: 'Spirits', isQuickSell: true, type: ProductType.DRINK },
        { id: 'i3', name: 'Whisky (Single)', price: 600, stock: 200, category: 'Spirits', isQuickSell: true, type: ProductType.DRINK },
        { id: 'i4', name: 'Soda / Mixers', price: 150, stock: 200, category: 'Non-Alcoholic', isQuickSell: true, type: ProductType.DRINK },
        { id: 'f1', name: 'Nyama Choma (500g)', price: 900, stock: 50, category: 'Food', isQuickSell: false, type: ProductType.FOOD },
      ];
    case 'restaurant':
    case 'cafe':
      return [
        { id: 'f1', name: 'Ugali & Sukuma', price: 150, stock: 999, category: 'Meals', isQuickSell: true, type: ProductType.FOOD },
        { id: 'f2', name: 'Pilau', price: 200, stock: 50, category: 'Meals', isQuickSell: true, type: ProductType.FOOD },
        { id: 'f3', name: 'Chapati', price: 30, stock: 100, category: 'Extras', isQuickSell: true, type: ProductType.FOOD },
        { id: 'd1', name: 'Tea / Chai', price: 50, stock: 999, category: 'Drinks', isQuickSell: true, type: ProductType.DRINK },
        { id: 'd2', name: 'Soda (500ml)', price: 100, stock: 100, category: 'Drinks', isQuickSell: true, type: ProductType.DRINK },
      ];
    case 'spa':
    case 'salon':
      return [
        { id: 's1', name: 'Hair Wash & Set', price: 500, stock: 999, category: 'Hair', isQuickSell: true, type: ProductType.SERVICE },
        { id: 's2', name: 'Manicure', price: 400, stock: 999, category: 'Nails', isQuickSell: true, type: ProductType.SERVICE },
        { id: 's3', name: 'Pedicure', price: 500, stock: 999, category: 'Nails', isQuickSell: true, type: ProductType.SERVICE },
        { id: 's4', name: 'Full Body Massage', price: 1500, stock: 999, category: 'Spa', isQuickSell: false, type: ProductType.SERVICE },
        { id: 's5', name: 'Facial Treatment', price: 800, stock: 999, category: 'Spa', isQuickSell: false, type: ProductType.SERVICE },
      ];
    case 'gym':
      return [
        { id: 'g1', name: 'Day Pass', price: 200, stock: 999, category: 'Access', isQuickSell: true, type: ProductType.SERVICE },
        { id: 'g2', name: 'Monthly Membership', price: 2500, stock: 999, category: 'Membership', isQuickSell: true, type: ProductType.SERVICE },
        { id: 'g3', name: 'Personal Training (1hr)', price: 1500, stock: 999, category: 'Training', isQuickSell: false, type: ProductType.SERVICE },
        { id: 'g4', name: 'Protein Shake', price: 250, stock: 60, category: 'Supplements', isQuickSell: true, type: ProductType.FOOD },
      ];
    case 'pharmacy':
      return [
        { id: 'p1', name: 'Paracetamol (Strip)', price: 30, stock: 500, category: 'OTC', isQuickSell: true, type: ProductType.SERVICE },
        { id: 'p2', name: 'Antibiotics', price: 200, stock: 100, category: 'Prescription', isQuickSell: false, type: ProductType.SERVICE },
        { id: 'p3', name: 'Antacid', price: 50, stock: 200, category: 'OTC', isQuickSell: true, type: ProductType.SERVICE },
      ];
    case 'hardware':
      return [
        { id: 'h1', name: 'Cement Bag (50kg)', price: 1200, stock: 200, category: 'Building', isQuickSell: true, type: ProductType.SERVICE },
        { id: 'h2', name: 'Paint (4L)', price: 1800, stock: 50, category: 'Paints', isQuickSell: false, type: ProductType.SERVICE },
        { id: 'h3', name: 'Nails (1kg)', price: 200, stock: 300, category: 'Hardware', isQuickSell: true, type: ProductType.SERVICE },
      ];
    case 'rental':
    case 'hotel':
      return [
        { id: 'r1', name: 'Standard Room (Night)', price: 3500, stock: 10, category: 'Rooms', isQuickSell: true, type: ProductType.ROOM },
        { id: 'r2', name: 'Deluxe Room (Night)', price: 5500, stock: 5, category: 'Rooms', isQuickSell: true, type: ProductType.ROOM },
      ];
    default:
      return [
        { id: 'def1', name: 'Item 1', price: 100, stock: 100, category: 'General', isQuickSell: true, type: ProductType.SERVICE },
        { id: 'def2', name: 'Item 2', price: 250, stock: 50, category: 'General', isQuickSell: false, type: ProductType.SERVICE },
      ];
  }
}

function getDefaultRooms(businessType: BusinessType): Room[] {
  if (['rental', 'hotel', 'nightclub'].includes(businessType)) {
    return [
      { id: 'room1', number: '101', type: 'Standard', price: 3500, status: 'AVAILABLE' },
      { id: 'room2', number: '102', type: 'Standard', price: 3500, status: 'AVAILABLE' },
      { id: 'room3', number: '103', type: 'Deluxe', price: 5500, status: 'AVAILABLE' },
    ];
  }
  return [];
}

export function usePOSData(uid: string, businessType: BusinessType): POSData {
  const lsKey = (k: string) => `madis_${uid}_${k}`;
  const userCol = (col: string) => collection(db, 'users', uid, col);
  const userDoc = (col: string, id: string) => doc(db, 'users', uid, col, id);

  const [staff, setStaffState] = useState<User[]>(() => LS.get(lsKey('staff'), []));
  const [inventory, setInventoryState] = useState<InventoryItem[]>(() => LS.get(lsKey('inventory'), []));
  const [tabs, setTabsState] = useState<Tab[]>(() => LS.get(lsKey('tabs'), []));
  const [rooms, setRoomsState] = useState<Room[]>(() => LS.get(lsKey('rooms'), []));
  const [auditLogs, setAuditLogsState] = useState<AuditLog[]>(() => LS.get(lsKey('auditLogs'), []));
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);

  const loadingDoneRef = useRef(false);
  const tabsRef = useRef<Tab[]>([]);
  const staffRef = useRef<User[]>([]);
  const inventoryRef = useRef<InventoryItem[]>([]);
  tabsRef.current = tabs;
  staffRef.current = staff;
  inventoryRef.current = inventory;

  const finishLoading = () => {
    if (!loadingDoneRef.current) {
      loadingDoneRef.current = true;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      userCol('staff'),
      (snapshot) => {
        const docs = snapshot.docs.map(d => d.data() as User);
        if (docs.length > 0) {
          setStaffState(docs);
          LS.set(lsKey('staff'), docs);
        } else {
          const ownerStaff: User[] = [
            { id: `${uid}-owner`, name: 'Owner', pin: '1234', role: 'OWNER' as any },
            { id: `${uid}-staff1`, name: 'Staff Member', pin: '1111', role: 'STAFF' as any },
          ];
          ownerStaff.forEach(s => setDoc(userDoc('staff', s.id), s).catch(() => {}));
        }
        finishLoading();
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${uid}/staff`);
        finishLoading();
      }
    );
    return unsub;
  }, [uid]);

  useEffect(() => {
    const unsub = onSnapshot(
      userCol('inventory'),
      (snapshot) => {
        const docs = snapshot.docs.map(d => d.data() as InventoryItem);
        if (docs.length > 0) {
          setInventoryState(docs);
          LS.set(lsKey('inventory'), docs);
        } else {
          const initial = getDefaultInventory(businessType);
          initial.forEach(item => setDoc(userDoc('inventory', item.id), item).catch(() => {}));
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/inventory`)
    );
    return unsub;
  }, [uid]);

  useEffect(() => {
    const q = query(userCol('tabs'), orderBy('updatedAt', 'desc'), limit(500));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(d => d.data() as Tab);
        setTabsState(docs);
        LS.set(lsKey('tabs'), docs);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/tabs`)
    );
    return unsub;
  }, [uid]);

  useEffect(() => {
    const unsub = onSnapshot(
      userCol('rooms'),
      (snapshot) => {
        const docs = snapshot.docs.map(d => d.data() as Room);
        if (docs.length > 0) {
          setRoomsState(docs);
          LS.set(lsKey('rooms'), docs);
        } else {
          const initial = getDefaultRooms(businessType);
          if (initial.length > 0) {
            initial.forEach(r => setDoc(userDoc('rooms', r.id), r).catch(() => {}));
          }
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/rooms`)
    );
    return unsub;
  }, [uid]);

  useEffect(() => {
    const q = query(userCol('auditLogs'), orderBy('timestamp', 'desc'), limit(200));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(d => d.data() as AuditLog);
        setAuditLogsState(docs);
        LS.set(lsKey('auditLogs'), docs);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/auditLogs`)
    );
    return unsub;
  }, [uid]);

  const setStaff = async (newStaff: User[]) => {
    setStaffState(newStaff);
    LS.set(lsKey('staff'), newStaff);
    for (const s of newStaff) {
      try { await setDoc(userDoc('staff', s.id), cleanData(s)); }
      catch (err) { handleFirestoreError(err, OperationType.WRITE, `users/${uid}/staff/${s.id}`); }
    }
    const toDelete = staffRef.current.map(s => s.id).filter(id => !newStaff.find(s => s.id === id));
    for (const id of toDelete) {
      try { await deleteDoc(userDoc('staff', id)); }
      catch (err) { handleFirestoreError(err, OperationType.DELETE, `users/${uid}/staff/${id}`); }
    }
  };

  const setInventory = async (newInventory: InventoryItem[]) => {
    setInventoryState(newInventory);
    LS.set(lsKey('inventory'), newInventory);
    for (const item of newInventory) {
      try { await setDoc(userDoc('inventory', item.id), cleanData(item)); }
      catch (err) { handleFirestoreError(err, OperationType.WRITE, `users/${uid}/inventory/${item.id}`); }
    }
    const toDelete = inventoryRef.current.map(i => i.id).filter(id => !newInventory.find(i => i.id === id));
    for (const id of toDelete) {
      try { await deleteDoc(userDoc('inventory', id)); }
      catch (err) { handleFirestoreError(err, OperationType.DELETE, `users/${uid}/inventory/${id}`); }
    }
  };

  const setTabs = async (newTabs: Tab[]) => {
    setTabsState(newTabs);
    LS.set(lsKey('tabs'), newTabs);
    const currentTabMap = new Map<string, Tab>(tabsRef.current.map(t => [t.id, t]));
    for (const tab of newTabs) {
      const existing = currentTabMap.get(tab.id);
      if (!existing || existing.updatedAt !== tab.updatedAt || existing.status !== tab.status) {
        try { await setDoc(userDoc('tabs', tab.id), cleanData(tab)); }
        catch (err) { handleFirestoreError(err, OperationType.WRITE, `users/${uid}/tabs/${tab.id}`); }
      }
    }
  };

  const deleteTab = async (tabId: string) => {
    setTabsState(prev => prev.filter(t => t.id !== tabId));
    try { await deleteDoc(userDoc('tabs', tabId)); }
    catch (err) { handleFirestoreError(err, OperationType.DELETE, `users/${uid}/tabs/${tabId}`); }
  };

  const setRooms = async (newRooms: Room[]) => {
    setRoomsState(newRooms);
    LS.set(lsKey('rooms'), newRooms);
    for (const r of newRooms) {
      try { await setDoc(userDoc('rooms', r.id), cleanData(r)); }
      catch (err) { handleFirestoreError(err, OperationType.WRITE, `users/${uid}/rooms/${r.id}`); }
    }
  };

  const addAuditLog = async (user: User, action: string, details: string) => {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      userName: user.name,
      userId: user.id,
      action,
      details,
      timestamp: Date.now(),
    };
    setAuditLogsState(prev => [newLog, ...prev]);
    LS.set(lsKey('auditLogs'), [newLog, ...auditLogs]);
    try { await setDoc(userDoc('auditLogs', newLog.id), cleanData(newLog)); }
    catch (err) { handleFirestoreError(err, OperationType.CREATE, `users/${uid}/auditLogs/${newLog.id}`); }
  };

  return {
    staff, setStaff,
    inventory, setInventory,
    tabs, setTabs, deleteTab,
    rooms, setRooms,
    auditLogs, addAuditLog,
    isOnline,
    isLoading,
  };
}
