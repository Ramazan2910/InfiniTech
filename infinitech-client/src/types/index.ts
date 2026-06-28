export type UserRole = 'Client' | 'Master' | 'Admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  iconEmoji: string;
  productCount: number;
}

export type ProductCondition = 'New' | 'Used';

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  stockQuantity: number;
  condition: ProductCondition;
  categoryId: number;
  categoryName: string;
  categoryEmoji: string;
  imagePath?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export type TicketStatus =
  | 'WaitingForMaster'
  | 'Diagnosis'
  | 'PriceApproval'
  | 'InRepair'
  | 'WaitingForParts'
  | 'ReadyForPickup'
  | 'Completed'
  | 'Cancelled';

export type DeviceType = 'Laptop' | 'Desktop' | 'Phone' | 'Tablet' | 'Printer' | 'Monitor' | 'Console' | 'SmartWatch' | 'Other';

export interface TicketPhoto {
  id: string;
  filePath: string;
  originalFileName: string;
  uploadedAt: string;
}

export interface TicketComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface RepairTicket {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  masterId?: string;
  masterName?: string;
  deviceType: DeviceType;
  deviceBrand: string;
  deviceModel: string;
  problemDescription: string;
  serialNumber?: string;
  status: TicketStatus;
  diagnosisResult?: string;
  repairCost?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  photos: TicketPhoto[];
  comments: TicketComment[];
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  categoryEmoji: string;
  condition: ProductCondition;
  unitPrice: number;
  stockQuantity: number;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  ordersThisMonth: number;
  activeRepairs: number;
  totalUsers: number;
  lowStockProducts: LowStockProduct[];
  recentOrders: Order[];
  ticketsByStatus: Record<string, number>;
  topCategories: CategoryStats[];
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  categoryName: string;
}

export interface CategoryStats {
  categoryId: number;
  categoryName: string;
  orderCount: number;
}

export interface UserDetail extends User {
  orderCount: number;
  ticketCount: number;
}

export interface ApiError {
  error: string;
  details?: string[];
  statusCode: number;
}
