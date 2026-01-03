export type UserRole = 'buyer' | 'seller';

export interface User {
  id: number | string;
  name: string;
  email: string;
  avatarUrl?: string; 
  avatar?: string; // Legacy
  location: string;
  isAdmin?: boolean;
  hasStall?: boolean;
  stallId?: number | string;
  provider?: string;
  uid?: string;
}

export interface Stall {
  id: number | string;
  userId: number | string; 
  ownerId?: number | string; // Legacy
  name: string;
  description: string;
  location: string;
  logoUrl?: string; 
  logo?: string; // Legacy
  coverUrl?: string;
  cover?: string; // Legacy
  rating: number;
  reviewsCount: number;
  status?: string;
}

// Match .NET DTOs but keep compatibility with legacy mock data
export type Unit = 'Kg' | 'Bucată' | 'Grams100' | 'Borcan' | 'Litru' | 'kg' | 'bucată' | '100g' | 'borcan' | 'litru';

export type Category = 'Ouă' | 'Lactate' | 'Carne' | 'Legume' | 'Fructe' | 'Conserve' | 'Afumături' | 'Meșteșuguri' | 'Altele';
export type StockType = 'InStock' | 'Limited' | 'OnePiece' | 'OutOfStock' | 'in_stock' | 'limited' | 'one_piece' | 'out_of_stock';

export interface Product {
  id: number | string;
  stallId: number | string;
  name: string;
  description: string;
  price: number; 
  priceCents?: number; // Optional
  measureUnit?: string; // Optional/Refactored
  unit?: Unit; // Legacy support
  category: string;
  stockType: string;
  stockQuantity?: number;
  imageUrl?: string;
  image?: string; // Legacy support
  rating?: number;
}


export interface CartItem {
  id: number | string;
  product: Product;
  quantity: number;
}

export interface Cart {
  stallId: number | string | null;
  items: CartItem[];
}

export type OrderStatus = 'new_order' | 'confirmed' | 'completed' | 'cancelled';

export interface OrderItem {
  id: number | string;
  productId: number | string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  unit: Unit;
}

export interface Order {
  id: number | string;
  number?: string;
  buyerId: number | string;
  sellerId?: number | string; // derived from stall
  stallId: number | string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string; // Updated to match my controller's camelCase mapping
  updatedAt: string;
  deliveryLocation?: string;
  estimatedPickup?: string;
}

export interface Message {
  id: number | string;
  orderId?: number | string;
  senderId: number | string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}
