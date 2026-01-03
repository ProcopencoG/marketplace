import type { User, Stall, Product, Order } from '../types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Gabriel', // Simulation
  email: 'gabriel@example.com',
  avatar: 'https://ui-avatars.com/api/?name=Gabriel&background=4a7c59&color=fff',
  location: 'București'
};

export const MOCK_USERS: User[] = [];

export const MOCK_STALLS: Stall[] = [];

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_ORDERS: Order[] = [];
