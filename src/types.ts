export enum UserRole {
  STAFF = 'STAFF',
  SUPERVISOR = 'SUPERVISOR',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  pin: string;
  role: UserRole;
}

export enum ProductType {
  DRINK = 'DRINK',
  FOOD = 'FOOD',
  ROOM = 'ROOM',
  SERVICE = 'SERVICE'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  isQuickSell: boolean;
  type?: ProductType;
}

export enum TabStatus {
  OPEN = 'OPEN',
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

export interface TabItem {
  productId: string;
  name: string;
  quantity: number;
  priceAtSale: number;
}

export interface Tab {
  id: string;
  staffId: string;
  customerName: string;
  items: TabItem[];
  total: number;
  status: TabStatus;
  mpesaPhone?: string;
  paymentType?: 'Cash' | 'M-Pesa' | 'Card';
  isDebt: boolean;
  createdAt: number;
  updatedAt: number;
  roomId?: string;
  isCarwash?: boolean;
}

export interface Room {
  id: string;
  number: string;
  type: string;
  price: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

export interface AuditLog {
  id: string;
  userName: string;
  userId: string;
  action: string;
  details: string;
  timestamp: number;
}

export interface InventoryItem extends Product {}

export type BusinessType =
  | 'bar'
  | 'nightclub'
  | 'restaurant'
  | 'cafe'
  | 'spa'
  | 'gym'
  | 'shop'
  | 'hardware'
  | 'rental'
  | 'hotel'
  | 'salon'
  | 'pharmacy';

export interface BusinessProfile {
  uid: string;
  email: string;
  businessName: string;
  businessType: BusinessType;
  ownerName: string;
  subscriptionStatus: 'active' | 'expired' | 'pending' | 'trial';
  subscriptionExpiry: number;
  trialStartDate?: number;
  createdAt: number;
}

// ── Appointments ──────────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone?: string;
  serviceName: string;
  serviceId?: string;
  staffId: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'done' | 'cancelled';
  createdAt: number;
}

// ── Invoice / Purchase Order types ────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'received' | 'cancelled';

export interface InvoiceLineItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  supplierContact?: string;
  items: InvoiceLineItem[];
  subtotal: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  receivedAt?: number;
}
