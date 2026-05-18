import { User, UserRole, Product, ProductType, Tab, TabStatus, AuditLog, Room } from '../types';

const now = Date.now();
const h = (hrs: number) => now - hrs * 3600000;

export const DEMO_BUSINESS_NAME = 'The Grand Bar';
export const DEMO_OWNER_NAME = 'Demo Owner';
export const DEMO_BUSINESS_TYPE = 'bar' as const;
export const DEMO_UID = 'demo-user-001';

export const demoStaff: User[] = [
  { id: 'staff-1', name: 'Alice Kamau',   pin: '1234', role: UserRole.OWNER },
  { id: 'staff-2', name: 'Brian Otieno',  pin: '2222', role: UserRole.SUPERVISOR },
  { id: 'staff-3', name: 'Carol Njeri',   pin: '3333', role: UserRole.STAFF },
  { id: 'staff-4', name: 'David Mwangi',  pin: '4444', role: UserRole.STAFF },
];

export const demoInventory: Product[] = [
  { id: 'p1',  name: 'Tusker Lager',       price: 250,  stock: 48, category: 'Beer',     isQuickSell: true,  type: ProductType.DRINK },
  { id: 'p2',  name: 'Guinness',            price: 300,  stock: 36, category: 'Beer',     isQuickSell: true,  type: ProductType.DRINK },
  { id: 'p3',  name: 'Whitecap',            price: 220,  stock: 60, category: 'Beer',     isQuickSell: false, type: ProductType.DRINK },
  { id: 'p4',  name: 'Smirnoff Vodka',      price: 450,  stock: 20, category: 'Spirits',  isQuickSell: true,  type: ProductType.DRINK },
  { id: 'p5',  name: 'Johnnie Walker Red',  price: 600,  stock: 12, category: 'Spirits',  isQuickSell: false, type: ProductType.DRINK },
  { id: 'p6',  name: 'Hennessy VSOP',       price: 1200, stock: 8,  category: 'Spirits',  isQuickSell: false, type: ProductType.DRINK },
  { id: 'p7',  name: 'Red Wine (Glass)',     price: 350,  stock: 30, category: 'Wine',     isQuickSell: false, type: ProductType.DRINK },
  { id: 'p8',  name: 'Rosé (Glass)',         price: 380,  stock: 24, category: 'Wine',     isQuickSell: false, type: ProductType.DRINK },
  { id: 'p9',  name: 'Chicken Wings',        price: 650,  stock: 25, category: 'Food',     isQuickSell: true,  type: ProductType.FOOD  },
  { id: 'p10', name: 'Nyama Choma (500g)',   price: 900,  stock: 15, category: 'Food',     isQuickSell: true,  type: ProductType.FOOD  },
  { id: 'p11', name: 'Fries',               price: 300,  stock: 40, category: 'Food',     isQuickSell: true,  type: ProductType.FOOD  },
  { id: 'p12', name: 'Soda (Coke/Fanta)',   price: 100,  stock: 80, category: 'Soft',     isQuickSell: true,  type: ProductType.DRINK },
  { id: 'p13', name: 'Water (500ml)',        price: 60,   stock: 100,category: 'Soft',     isQuickSell: false, type: ProductType.DRINK },
  { id: 'p14', name: 'Hookah / Shisha',      price: 1500, stock: 6,  category: 'Services', isQuickSell: false, type: ProductType.SERVICE},
  { id: 'p15', name: 'VIP Table Booking',    price: 5000, stock: 4,  category: 'Services', isQuickSell: false, type: ProductType.SERVICE},
];

export const demoTabs: Tab[] = [
  {
    id: 'tab-1', staffId: 'staff-3', customerName: 'Table 3 - James',
    items: [
      { productId: 'p1', name: 'Tusker Lager',    quantity: 4, priceAtSale: 250 },
      { productId: 'p9', name: 'Chicken Wings',   quantity: 1, priceAtSale: 650 },
    ],
    total: 1650, status: TabStatus.PAID, isDebt: false,
    paymentType: 'Cash', createdAt: h(1.5), updatedAt: h(1.2),
  },
  {
    id: 'tab-2', staffId: 'staff-2', customerName: 'VIP Booth - Grace',
    items: [
      { productId: 'p6', name: 'Hennessy VSOP',   quantity: 1, priceAtSale: 1200 },
      { productId: 'p15', name: 'VIP Table',       quantity: 1, priceAtSale: 5000 },
      { productId: 'p12', name: 'Soda',            quantity: 3, priceAtSale: 100  },
    ],
    total: 6500, status: TabStatus.PAID, isDebt: false,
    paymentType: 'M-Pesa', createdAt: h(3), updatedAt: h(2.5),
  },
  {
    id: 'tab-3', staffId: 'staff-3', customerName: 'Bar Seat 7 - Kevin',
    items: [
      { productId: 'p4', name: 'Smirnoff Vodka',  quantity: 2, priceAtSale: 450 },
      { productId: 'p11', name: 'Fries',           quantity: 1, priceAtSale: 300 },
    ],
    total: 1200, status: TabStatus.OPEN, isDebt: false,
    createdAt: h(0.5), updatedAt: h(0.5),
  },
  {
    id: 'tab-4', staffId: 'staff-4', customerName: 'Table 1 - Celebration Group',
    items: [
      { productId: 'p2', name: 'Guinness',          quantity: 6, priceAtSale: 300 },
      { productId: 'p10', name: 'Nyama Choma',      quantity: 2, priceAtSale: 900 },
      { productId: 'p14', name: 'Hookah / Shisha',  quantity: 1, priceAtSale: 1500},
    ],
    total: 5700, status: TabStatus.PAID, isDebt: false,
    paymentType: 'M-Pesa', createdAt: h(4), updatedAt: h(3.5),
  },
  {
    id: 'tab-5', staffId: 'staff-4', customerName: 'Table 5 - Tony',
    items: [
      { productId: 'p5', name: 'Johnnie Walker',   quantity: 1, priceAtSale: 600 },
      { productId: 'p8', name: 'Rosé (Glass)',      quantity: 2, priceAtSale: 380 },
    ],
    total: 1360, status: TabStatus.UNPAID, isDebt: true,
    createdAt: h(2), updatedAt: h(2),
  },
  {
    id: 'tab-6', staffId: 'staff-2', customerName: 'Bar Seat 2 - Mary',
    items: [
      { productId: 'p1', name: 'Tusker Lager',     quantity: 2, priceAtSale: 250 },
      { productId: 'p12', name: 'Soda',             quantity: 1, priceAtSale: 100 },
    ],
    total: 600, status: TabStatus.PAID, isDebt: false,
    paymentType: 'Cash', createdAt: h(5), updatedAt: h(4.8),
  },
  {
    id: 'tab-7', staffId: 'staff-3', customerName: 'Table 8 - Friends',
    items: [
      { productId: 'p3', name: 'Whitecap',          quantity: 5, priceAtSale: 220 },
      { productId: 'p9', name: 'Chicken Wings',      quantity: 2, priceAtSale: 650 },
      { productId: 'p11', name: 'Fries',             quantity: 2, priceAtSale: 300 },
    ],
    total: 2800, status: TabStatus.PAID, isDebt: false,
    paymentType: 'Cash', createdAt: h(6), updatedAt: h(5.5),
  },
  {
    id: 'tab-8', staffId: 'staff-2', customerName: 'Terrace - Amina & Co.',
    items: [
      { productId: 'p7', name: 'Red Wine (Glass)',  quantity: 4, priceAtSale: 350 },
      { productId: 'p13', name: 'Water',             quantity: 2, priceAtSale: 60  },
    ],
    total: 1520, status: TabStatus.OPEN, isDebt: false,
    createdAt: h(0.3), updatedAt: h(0.3),
  },
];

export const demoAuditLogs: AuditLog[] = [
  { id: 'log-1', userName: 'Alice Kamau',  userId: 'staff-1', action: 'Login',        details: 'Owner logged in to terminal',            timestamp: h(8) },
  { id: 'log-2', userName: 'Brian Otieno', userId: 'staff-2', action: 'Login',        details: 'Supervisor logged in to terminal',        timestamp: h(7) },
  { id: 'log-3', userName: 'Carol Njeri',  userId: 'staff-3', action: 'Login',        details: 'Staff logged in to terminal',             timestamp: h(6.5) },
  { id: 'log-4', userName: 'Carol Njeri',  userId: 'staff-3', action: 'Tab Created',  details: 'Created PAID tab for Table 8 - Friends', timestamp: h(6) },
  { id: 'log-5', userName: 'Brian Otieno', userId: 'staff-2', action: 'Tab Created',  details: 'Created PAID tab for Bar Seat 2 - Mary', timestamp: h(5) },
  { id: 'log-6', userName: 'Carol Njeri',  userId: 'staff-3', action: 'Tab Created',  details: 'Created PAID tab for Table 3 - James',   timestamp: h(4) },
  { id: 'log-7', userName: 'David Mwangi', userId: 'staff-4', action: 'Tab Created',  details: 'Created PAID tab for Celebration Group', timestamp: h(3.5) },
  { id: 'log-8', userName: 'Alice Kamau',  userId: 'staff-1', action: 'Stock Update', details: 'Restocked Tusker Lager: +24 units',       timestamp: h(3) },
  { id: 'log-9', userName: 'Brian Otieno', userId: 'staff-2', action: 'Tab Created',  details: 'Created PAID tab for VIP Booth - Grace',  timestamp: h(2.5) },
  { id: 'log-10',userName: 'David Mwangi', userId: 'staff-4', action: 'Debt Noted',   details: 'Tab for Tony marked as UNPAID - KES 1,360',timestamp: h(2) },
];

export const demoRooms: Room[] = [];
