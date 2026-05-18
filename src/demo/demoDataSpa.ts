import { User, UserRole, Product, ProductType, Tab, TabStatus, AuditLog, Room } from '../types';

const now = Date.now();
const h = (hrs: number) => now - hrs * 3600000;

export const DEMO_SPA_BUSINESS_NAME = 'Serenity Spa & Salon';
export const DEMO_SPA_OWNER_NAME = 'Demo Owner';
export const DEMO_SPA_BUSINESS_TYPE = 'spa' as const;
export const DEMO_SPA_UID = 'demo-spa-001';

export const demoSpaStaff: User[] = [
  { id: 'spa-staff-1', name: 'Amina Wanjiru',   pin: '1234', role: UserRole.OWNER },
  { id: 'spa-staff-2', name: 'Grace Odhiambo',  pin: '2222', role: UserRole.SUPERVISOR },
  { id: 'spa-staff-3', name: 'Faith Muthoni',   pin: '3333', role: UserRole.STAFF },
  { id: 'spa-staff-4', name: 'Lilian Achieng',  pin: '4444', role: UserRole.STAFF },
];

export const demoSpaInventory: Product[] = [
  { id: 'sp1',  name: 'Classic Manicure',        price: 800,  stock: 50, category: 'Nails',    isQuickSell: true,  type: ProductType.SERVICE },
  { id: 'sp2',  name: 'Gel Manicure',             price: 1200, stock: 50, category: 'Nails',    isQuickSell: true,  type: ProductType.SERVICE },
  { id: 'sp3',  name: 'Classic Pedicure',         price: 1000, stock: 50, category: 'Nails',    isQuickSell: true,  type: ProductType.SERVICE },
  { id: 'sp4',  name: 'Gel Pedicure',             price: 1500, stock: 50, category: 'Nails',    isQuickSell: false, type: ProductType.SERVICE },
  { id: 'sp5',  name: 'Swedish Massage (60min)',  price: 2500, stock: 50, category: 'Massage',  isQuickSell: true,  type: ProductType.SERVICE },
  { id: 'sp6',  name: 'Deep Tissue (90min)',      price: 3500, stock: 50, category: 'Massage',  isQuickSell: false, type: ProductType.SERVICE },
  { id: 'sp7',  name: 'Hot Stone Massage',        price: 4000, stock: 50, category: 'Massage',  isQuickSell: false, type: ProductType.SERVICE },
  { id: 'sp8',  name: 'Classic Facial',           price: 2000, stock: 50, category: 'Facial',   isQuickSell: true,  type: ProductType.SERVICE },
  { id: 'sp9',  name: 'Anti-Ageing Facial',       price: 3000, stock: 50, category: 'Facial',   isQuickSell: false, type: ProductType.SERVICE },
  { id: 'sp10', name: 'Full Body Waxing',         price: 3500, stock: 50, category: 'Waxing',   isQuickSell: false, type: ProductType.SERVICE },
  { id: 'sp11', name: 'Eyebrow Threading',        price: 300,  stock: 50, category: 'Beauty',   isQuickSell: true,  type: ProductType.SERVICE },
  { id: 'sp12', name: 'Eyelash Extensions',       price: 2500, stock: 50, category: 'Beauty',   isQuickSell: false, type: ProductType.SERVICE },
  { id: 'sp13', name: 'Hair Treatment',           price: 1500, stock: 50, category: 'Hair',     isQuickSell: false, type: ProductType.SERVICE },
  { id: 'sp14', name: 'Blow Dry & Style',         price: 1000, stock: 50, category: 'Hair',     isQuickSell: true,  type: ProductType.SERVICE },
  { id: 'sp15', name: 'Aromatherapy Add-on',      price: 500,  stock: 20, category: 'Extras',   isQuickSell: false, type: ProductType.SERVICE },
  { id: 'sp16', name: 'Herbal Tea',               price: 200,  stock: 30, category: 'Drinks',   isQuickSell: false, type: ProductType.DRINK   },
  { id: 'sp17', name: 'Infused Water',            price: 150,  stock: 40, category: 'Drinks',   isQuickSell: false, type: ProductType.DRINK   },
];

export const demoSpaTabs: Tab[] = [
  {
    id: 'spa-tab-1', staffId: 'spa-staff-3', customerName: 'Linda Kamau',
    items: [
      { productId: 'sp2', name: 'Gel Manicure',         quantity: 1, priceAtSale: 1200 },
      { productId: 'sp3', name: 'Classic Pedicure',     quantity: 1, priceAtSale: 1000 },
    ],
    total: 2200, status: TabStatus.PAID, isDebt: false,
    paymentType: 'M-Pesa', createdAt: h(1.5), updatedAt: h(1.1),
  },
  {
    id: 'spa-tab-2', staffId: 'spa-staff-2', customerName: 'Patricia Njeri',
    items: [
      { productId: 'sp5', name: 'Swedish Massage',      quantity: 1, priceAtSale: 2500 },
      { productId: 'sp8', name: 'Classic Facial',       quantity: 1, priceAtSale: 2000 },
      { productId: 'sp15', name: 'Aromatherapy Add-on', quantity: 1, priceAtSale: 500  },
      { productId: 'sp16', name: 'Herbal Tea',          quantity: 1, priceAtSale: 200  },
    ],
    total: 5200, status: TabStatus.PAID, isDebt: false,
    paymentType: 'Cash', createdAt: h(3), updatedAt: h(2.5),
  },
  {
    id: 'spa-tab-3', staffId: 'spa-staff-3', customerName: 'Cynthia Otieno',
    items: [
      { productId: 'sp6', name: 'Deep Tissue Massage',  quantity: 1, priceAtSale: 3500 },
      { productId: 'sp17', name: 'Infused Water',       quantity: 2, priceAtSale: 150  },
    ],
    total: 3800, status: TabStatus.OPEN, isDebt: false,
    createdAt: h(0.5), updatedAt: h(0.5),
  },
  {
    id: 'spa-tab-4', staffId: 'spa-staff-4', customerName: 'Stella Mwangi',
    items: [
      { productId: 'sp12', name: 'Eyelash Extensions', quantity: 1, priceAtSale: 2500 },
      { productId: 'sp11', name: 'Eyebrow Threading',  quantity: 1, priceAtSale: 300  },
      { productId: 'sp14', name: 'Blow Dry & Style',   quantity: 1, priceAtSale: 1000 },
    ],
    total: 3800, status: TabStatus.PAID, isDebt: false,
    paymentType: 'M-Pesa', createdAt: h(4), updatedAt: h(3.5),
  },
  {
    id: 'spa-tab-5', staffId: 'spa-staff-4', customerName: 'Ann Wambua',
    items: [
      { productId: 'sp7', name: 'Hot Stone Massage',   quantity: 1, priceAtSale: 4000 },
      { productId: 'sp9', name: 'Anti-Ageing Facial',  quantity: 1, priceAtSale: 3000 },
    ],
    total: 7000, status: TabStatus.UNPAID, isDebt: true,
    createdAt: h(2), updatedAt: h(2),
  },
  {
    id: 'spa-tab-6', staffId: 'spa-staff-2', customerName: 'Rose Akinyi',
    items: [
      { productId: 'sp1', name: 'Classic Manicure',    quantity: 1, priceAtSale: 800  },
      { productId: 'sp3', name: 'Classic Pedicure',    quantity: 1, priceAtSale: 1000 },
      { productId: 'sp16', name: 'Herbal Tea',         quantity: 2, priceAtSale: 200  },
    ],
    total: 2200, status: TabStatus.PAID, isDebt: false,
    paymentType: 'Cash', createdAt: h(5), updatedAt: h(4.8),
  },
  {
    id: 'spa-tab-7', staffId: 'spa-staff-3', customerName: 'Nancy Chebet',
    items: [
      { productId: 'sp8', name: 'Classic Facial',      quantity: 1, priceAtSale: 2000 },
      { productId: 'sp13', name: 'Hair Treatment',     quantity: 1, priceAtSale: 1500 },
    ],
    total: 3500, status: TabStatus.OPEN, isDebt: false,
    createdAt: h(0.3), updatedAt: h(0.3),
  },
];

export const demoSpaAuditLogs = [
  { id: 'sl-1', userName: 'Amina Wanjiru',  userId: 'spa-staff-1', action: 'Login',        details: 'Owner logged in to terminal',              timestamp: h(8) },
  { id: 'sl-2', userName: 'Grace Odhiambo', userId: 'spa-staff-2', action: 'Login',        details: 'Supervisor logged in to terminal',          timestamp: h(7) },
  { id: 'sl-3', userName: 'Faith Muthoni',  userId: 'spa-staff-3', action: 'Login',        details: 'Staff logged in to terminal',               timestamp: h(6.5) },
  { id: 'sl-4', userName: 'Faith Muthoni',  userId: 'spa-staff-3', action: 'Tab Created',  details: 'Created PAID tab for Nancy Chebet',         timestamp: h(6) },
  { id: 'sl-5', userName: 'Grace Odhiambo', userId: 'spa-staff-2', action: 'Tab Created',  details: 'Created PAID tab for Rose Akinyi',          timestamp: h(5) },
  { id: 'sl-6', userName: 'Faith Muthoni',  userId: 'spa-staff-3', action: 'Tab Created',  details: 'Created PAID tab for Linda Kamau',          timestamp: h(4) },
  { id: 'sl-7', userName: 'Lilian Achieng', userId: 'spa-staff-4', action: 'Tab Created',  details: 'Created PAID tab for Stella Mwangi',        timestamp: h(3.5) },
  { id: 'sl-8', userName: 'Grace Odhiambo', userId: 'spa-staff-2', action: 'Tab Created',  details: 'Created PAID tab for Patricia Njeri',       timestamp: h(2.5) },
  { id: 'sl-9', userName: 'Lilian Achieng', userId: 'spa-staff-4', action: 'Debt Noted',   details: 'Tab for Ann Wambua marked UNPAID — KES 7,000', timestamp: h(2) },
];

export const demoSpaRooms: Room[] = [];
