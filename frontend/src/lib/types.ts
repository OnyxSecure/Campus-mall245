export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export type ProductCategory =
  | 'PHONES'
  | 'LAPTOPS'
  | 'TABLETS'
  | 'TEXTBOOKS'
  | 'ELECTRONICS'
  | 'FASHION'
  | 'ACCESSORIES'
  | 'HOSTEL_ESSENTIALS'
  | 'OTHERS';

export type TransactionStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_SECURED'
  | 'AWAITING_DELIVERY'
  | 'DELIVERED'
  | 'BUYER_CONFIRMED'
  | 'ESCROW_RELEASED'
  | 'DISPUTED'
  | 'REFUNDED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  studentId?: string;
  phone?: string;
  emailVerified?: boolean;
  sellerProfile?: SellerProfile;
}

export interface SellerProfile {
  id: string;
  department: string;
  profilePhoto?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
  wallet?: Wallet;
}

export interface Wallet {
  id: string;
  availableBalance: number;
  pendingEscrow: number;
  transactions?: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  images: string[];
  price: number;
  condition: 'NEW' | 'FAIRLY_USED';
  sellerId: string;
  isActive: boolean;
  createdAt: string;
  seller?: {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    sellerProfile?: Partial<SellerProfile>;
  };
}

export interface Transaction {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: TransactionStatus;
  paystackRef?: string;
  createdAt: string;
  product?: Product;
  buyer?: { fullName: string; phone?: string };
  seller?: { fullName: string; phone?: string };
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  PHONES: 'Phones',
  LAPTOPS: 'Laptops',
  TABLETS: 'Tablets',
  TEXTBOOKS: 'Textbooks',
  ELECTRONICS: 'Electronics',
  FASHION: 'Fashion',
  ACCESSORIES: 'Accessories',
  HOSTEL_ESSENTIALS: 'Hostel Essentials',
  OTHERS: 'Others',
};

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING_PAYMENT: 'Pending Payment',
  PAYMENT_SECURED: 'Payment Secured',
  AWAITING_DELIVERY: 'Awaiting Delivery',
  DELIVERED: 'Delivered',
  BUYER_CONFIRMED: 'Buyer Confirmed',
  ESCROW_RELEASED: 'Escrow Released',
  DISPUTED: 'Disputed',
  REFUNDED: 'Refunded',
};
