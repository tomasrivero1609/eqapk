// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

// Event Types
export interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  guestCount: number;
  dishCount: number;
  pricePerDish: number;
  adultCount: number;
  juvenileCount: number;
  childCount: number;
  adultPrice: number;
  juvenilePrice: number;
  childPrice: number;
  quarterlyAdjustmentPercent: number;
  quarterlyAdjustmentEnabled: boolean;
  lastAdjustmentAt?: string | null;
  menuDescription?: string;
  eventHours?: string;
  receptionType?: string;
  courseCountAdult?: string;
  courseCountJuvenile?: string;
  courseCountChild?: string;
  islandType?: string;
  dessert?: string;
  sweetTable?: string;
  partyEnd?: string;
  specialDishes?: string;
  cake?: string;
  familyMembers?: string;
  hallSetupDescription?: string;
  tablecloth?: string;
  tableNumbers?: string;
  centerpieces?: string;
  souvenirs?: string;
  bouquet?: string;
  candles?: string;
  charms?: string;
  roses?: string;
  cotillon?: string;
  photographer?: string;
  currency: Currency;
  totalAmount: number;
  capacity?: number;
  status: EventStatus;
  notes?: string;
  calendarEventId?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  clientId?: string;
  client?: Client;
  menus?: EventMenu[];
  orders?: Order[];
  payments?: Payment[];
}

export enum EventStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Currency {
  ARS = 'ARS',
  USD = 'USD',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export interface CreateEventDto {
  name: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  guestCount: number;
  dishCount?: number;
  pricePerDish?: number;
  adultCount?: number;
  juvenileCount?: number;
  childCount?: number;
  adultPrice?: number;
  juvenilePrice?: number;
  childPrice?: number;
  quarterlyAdjustmentPercent?: number;
  menuDescription?: string;
  eventHours?: string;
  receptionType?: string;
  courseCountAdult?: string;
  courseCountJuvenile?: string;
  courseCountChild?: string;
  islandType?: string;
  dessert?: string;
  sweetTable?: string;
  partyEnd?: string;
  specialDishes?: string;
  cake?: string;
  familyMembers?: string;
  hallSetupDescription?: string;
  tablecloth?: string;
  tableNumbers?: string;
  centerpieces?: string;
  souvenirs?: string;
  bouquet?: string;
  candles?: string;
  charms?: string;
  roses?: string;
  cotillon?: string;
  photographer?: string;
  currency?: Currency;
  capacity?: number;
  status?: EventStatus;
  notes?: string;
  clientId?: string;
}

export interface CalendarAvailability {
  available: boolean;
  status: 'ok' | 'disabled' | 'error';
  busyCount?: number;
}

// Client Types
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  events?: Array<{
    id: string;
    name: string;
    date: string;
    status: EventStatus;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

// Dish Types
export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDishDto {
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
}

// Menu Types
export interface MenuDish {
  dishId: string;
  quantity: number;
}

export interface Menu {
  id: string;
  name: string;
  description?: string;
  price?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  menuDishes?: Array<{
    id: string;
    quantity: number;
    dish: Dish;
  }>;
}

export interface CreateMenuDto {
  name: string;
  description?: string;
  price?: number;
  dishes?: MenuDish[];
}

// Order Types
export interface OrderItem {
  dishId?: string;
  menuId?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  total: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  eventId: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    subtotal: number;
    dish?: Dish;
    menu?: Menu;
  }>;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface CreateOrderDto {
  eventId: string;
  items: OrderItem[];
  notes?: string;
}

export interface Payment {
  id: string;
  eventId: string;
  amount: number;
  currency: Currency;
  exchangeRate?: number | null;
  exchangeRateDate?: string | null;
  platesCovered?: number | null;
  pricePerDishAtPayment?: number | null;
  adultCovered?: number | null;
  juvenileCovered?: number | null;
  childCovered?: number | null;
  adultPriceAtPayment?: number | null;
  juvenilePriceAtPayment?: number | null;
  childPriceAtPayment?: number | null;
  method?: string;
  notes?: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  eventId: string;
  amount: number;
  currency?: Currency;
  exchangeRate?: number;
  exchangeRateDate?: string;
  platesCovered?: number;
  adultCovered?: number;
  juvenileCovered?: number;
  childCovered?: number;
  method?: string;
  notes?: string;
  paidAt?: string;
}

// EventMenu Types
export interface EventMenu {
  id: string;
  quantity: number;
  price?: number;
  eventId: string;
  menuId: string;
  menu: Menu;
}
