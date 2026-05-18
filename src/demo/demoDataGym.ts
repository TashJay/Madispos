import { User, UserRole, Product, ProductType, Tab, TabStatus, AuditLog, Room } from '../types';

const now = Date.now();
const h = (hrs: number) => now - hrs * 3600000;

export const DEMO_GYM_BUSINESS_NAME = 'Apex Fitness Centre';
export const DEMO_GYM_OWNER_NAME = 'Demo Owner';
export const DEMO_GYM_BUSINESS_TYPE = 'gym' as const;
export const DEMO_GYM_UID = 'demo-gym-001';

export const demoGymStaff: User[] = [
  { id: 'gym-staff-1', name: 'Marcus Ochieng',   pin: '1234', role: UserRole.OWNER },
  { id: 'gym-staff-2', name: 'Pauline Waweru',   pin: '2222', role: UserRole.SUPERVISOR },
  { id: 'gym-staff-3', name: 'Isaac Kimani',     pin: '3333', role: UserRole.STAFF },
  { id: 'gym-staff-4', name: 'Beatrice Ndungu',  pin: '4444', role: UserRole.STAFF },
];

export const demoGymInventory: Product[] = [
  { id: 'gp1',  name: 'Monthly Membership',       price: 3500,  stock: 50, category: 'Memberships',  isQuickSell: true,  type: ProductType.SERVICE },
  { id: 'gp2',  name: 'Quarterly Membership',     price: 9000,  stock: 50, category: 'Memberships',  isQuickSell: false, type: ProductType.SERVICE },
  { id: 'gp3',  name: 'Annual Membership',        price: 30000, stock: 50, category: 'Memberships',  isQuickSell: false, type: ProductType.SERVICE },
  { id: 'gp4',  name: 'Day Pass',                 price: 400,   stock: 50, category: 'Memberships',  isQuickSell: true,  type: ProductType.SERVICE },
  { id: 'gp5',  name: 'Personal Training (1hr)',  price: 2500,  stock: 50, category: 'Training',     isQuickSell: true,  type: ProductType.SERVICE },
  { id: 'gp6',  name: 'PT Package (10 sessions)', price: 20000, stock: 50, category: 'Training',     isQuickSell: false, type: ProductType.SERVICE },
  { id: 'gp7',  name: 'Yoga Class',               price: 800,   stock: 50, category: 'Classes',      isQuickSell: true,  type: ProductType.SERVICE },
  { id: 'gp8',  name: 'Zumba Class',              price: 700,   stock: 50, category: 'Classes',      isQuickSell: true,  type: ProductType.SERVICE },
  { id: 'gp9',  name: 'Spin Class',               price: 900,   stock: 50, category: 'Classes',      isQuickSell: false, type: ProductType.SERVICE },
  { id: 'gp10', name: 'Protein Shake',            price: 350,   stock: 40, category: 'Nutrition',    isQuickSell: true,  type: ProductType.FOOD    },
  { id: 'gp11', name: 'Energy Bar',               price: 200,   stock: 60, category: 'Nutrition',    isQuickSell: true,  type: ProductType.FOOD    },
  { id: 'gp12', name: 'Whey Protein (1kg)',       price: 4500,  stock: 15, category: 'Supplements',  isQuickSell: false, type: ProductType.FOOD    },
  { id: 'gp13', name: 'Creatine (250g)',          price: 2200,  stock: 10, category: 'Supplements',  isQuickSell: false, type: ProductType.FOOD    },
  { id: 'gp14', name: 'Gym Gloves',               price: 1200,  stock: 20, category: 'Accessories',  isQuickSell: false, type: ProductType.SERVICE },
  { id: 'gp15', name: 'Towel Rental',             price: 100,   stock: 30, category: 'Accessories',  isQuickSell: true,  type: ProductType.SERVICE },
  { id: 'gp16', name: 'Locker (Monthly)',         price: 500,   stock: 20, category: 'Accessories',  isQuickSell: false, type: ProductType.SERVICE },
  { id: 'gp17', name: 'Water (500ml)',            price: 80,    stock: 100,category: 'Nutrition',    isQuickSell: true,  type: ProductType.DRINK   },
];

export const demoGymTabs: Tab[] = [
  {
    id: 'gym-tab-1', staffId: 'gym-staff-3', customerName: 'John Mwangi',
    items: [
      { productId: 'gp1',  name: 'Monthly Membership',      quantity: 1, priceAtSale: 3500 },
      { productId: 'gp15', name: 'Towel Rental',            quantity: 1, priceAtSale: 100  },
    ],
    total: 3600, status: TabStatus.PAID, isDebt: false,
    paymentType: 'M-Pesa', createdAt: h(1.5), updatedAt: h(1.2),
  },
  {
    id: 'gym-tab-2', staffId: 'gym-staff-2', customerName: 'Sandra Adhiambo',
    items: [
      { productId: 'gp6',  name: 'PT Package (10 sessions)', quantity: 1, priceAtSale: 20000 },
    ],
    total: 20000, status: TabStatus.PAID, isDebt: false,
    paymentType: 'Cash', createdAt: h(3), updatedAt: h(2.8),
  },
  {
    id: 'gym-tab-3', staffId: 'gym-staff-3', customerName: 'Victor Ngugi',
    items: [
      { productId: 'gp4',  name: 'Day Pass',                quantity: 1, priceAtSale: 400 },
      { productId: 'gp10', name: 'Protein Shake',           quantity: 1, priceAtSale: 350 },
      { productId: 'gp17', name: 'Water',                   quantity: 2, priceAtSale: 80  },
    ],
    total: 910, status: TabStatus.PAID, isDebt: false,
    paymentType: 'Cash', createdAt: h(2), updatedAt: h(1.8),
  },
  {
    id: 'gym-tab-4', staffId: 'gym-staff-4', customerName: 'Aisha Hassan',
    items: [
      { productId: 'gp7',  name: 'Yoga Class',              quantity: 1, priceAtSale: 800  },
      { productId: 'gp8',  name: 'Zumba Class',             quantity: 1, priceAtSale: 700  },
    ],
    total: 1500, status: TabStatus.PAID, isDebt: false,
    paymentType: 'M-Pesa', createdAt: h(4), updatedAt: h(3.7),
  },
  {
    id: 'gym-tab-5', staffId: 'gym-staff-3', customerName: 'Dennis Kiprotich',
    items: [
      { productId: 'gp2',  name: 'Quarterly Membership',    quantity: 1, priceAtSale: 9000 },
      { productId: 'gp16', name: 'Locker (Monthly)',        quantity: 1, priceAtSale: 500  },
    ],
    total: 9500, status: TabStatus.UNPAID, isDebt: true,
    createdAt: h(5), updatedAt: h(5),
  },
  {
    id: 'gym-tab-6', staffId: 'gym-staff-4', customerName: 'Mercy Wairimu',
    items: [
      { productId: 'gp12', name: 'Whey Protein (1kg)',      quantity: 1, priceAtSale: 4500 },
      { productId: 'gp13', name: 'Creatine (250g)',         quantity: 1, priceAtSale: 2200 },
    ],
    total: 6700, status: TabStatus.PAID, isDebt: false,
    paymentType: 'Cash', createdAt: h(6), updatedAt: h(5.8),
  },
  {
    id: 'gym-tab-7', staffId: 'gym-staff-3', customerName: 'Kevin Omondi',
    items: [
      { productId: 'gp5',  name: 'Personal Training (1hr)', quantity: 1, priceAtSale: 2500 },
      { productId: 'gp10', name: 'Protein Shake',           quantity: 1, priceAtSale: 350  },
    ],
    total: 2850, status: TabStatus.OPEN, isDebt: false,
    createdAt: h(0.3), updatedAt: h(0.3),
  },
  {
    id: 'gym-tab-8', staffId: 'gym-staff-2', customerName: 'Fatuma Ali',
    items: [
      { productId: 'gp3',  name: 'Annual Membership',       quantity: 1, priceAtSale: 30000 },
    ],
    total: 30000, status: TabStatus.PAID, isDebt: false,
    paymentType: 'M-Pesa', createdAt: h(7), updatedAt: h(6.9),
  },
];

export const demoGymAuditLogs: AuditLog[] = [
  { id: 'gl-1', userName: 'Marcus Ochieng',  userId: 'gym-staff-1', action: 'Login',       details: 'Owner logged in to terminal',              timestamp: h(8) },
  { id: 'gl-2', userName: 'Pauline Waweru',  userId: 'gym-staff-2', action: 'Login',       details: 'Supervisor logged in to terminal',          timestamp: h(7.5) },
  { id: 'gl-3', userName: 'Pauline Waweru',  userId: 'gym-staff-2', action: 'Tab Created', details: 'Created PAID tab for Fatuma Ali — Annual Membership', timestamp: h(7) },
  { id: 'gl-4', userName: 'Isaac Kimani',    userId: 'gym-staff-3', action: 'Login',       details: 'Staff logged in to terminal',               timestamp: h(6.8) },
  { id: 'gl-5', userName: 'Beatrice Ndungu', userId: 'gym-staff-4', action: 'Tab Created', details: 'Created PAID tab for Mercy Wairimu',        timestamp: h(6) },
  { id: 'gl-6', userName: 'Beatrice Ndungu', userId: 'gym-staff-4', action: 'Tab Created', details: 'Created PAID tab for Aisha Hassan',         timestamp: h(4) },
  { id: 'gl-7', userName: 'Isaac Kimani',    userId: 'gym-staff-3', action: 'Tab Created', details: 'Created PAID tab for Dennis Kiprotich — marked UNPAID', timestamp: h(5) },
  { id: 'gl-8', userName: 'Pauline Waweru',  userId: 'gym-staff-2', action: 'Tab Created', details: 'Created PAID tab for Sandra Adhiambo',      timestamp: h(3) },
  { id: 'gl-9', userName: 'Isaac Kimani',    userId: 'gym-staff-3', action: 'Tab Created', details: 'Created PAID tab for Victor Ngugi',         timestamp: h(2) },
];

export const demoGymRooms: Room[] = [];
