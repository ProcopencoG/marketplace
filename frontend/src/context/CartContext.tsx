import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

interface CartContextType {
  items: CartItem[];
  stallId: number | null;
  addItem: (product: Product, quantity: number) => Promise<{ success: boolean; error?: string }>;
  removeItem: (itemId: number) => Promise<void>; 
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [stallId, setStallId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to calculate totals
  const total = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Initialize from LocalStorage for guests
  useEffect(() => {
    if (!user) {
        const storedCart = localStorage.getItem('guest_cart');
        if (storedCart) {
            try {
                const parsed = JSON.parse(storedCart);
                setItems(parsed);
                if (parsed.length > 0) {
                    setStallId(parsed[0].product.stallId);
                }
            } catch (e) {
                console.error("Failed to parse guest cart", e);
                localStorage.removeItem('guest_cart');
            }
        }
    }
  }, [user]);

  // Sync and Fetch Logic
  useEffect(() => {
    const syncAndFetch = async () => {
        if (!user) return;
        setIsLoading(true);

        // 1. Check for guest items to sync
        const guestCartStr = localStorage.getItem('guest_cart');
        if (guestCartStr) {
            try {
                const guestItems: CartItem[] = JSON.parse(guestCartStr);
                // Sync each item to backend
                // Note: This could be optimized with a batch endpoint, but we'll loop for now
                for (const item of guestItems) {
                    try {
                        await axios.post(`/api/carts/user/${user.id}/items`, { 
                            productId: item.product.id, 
                            quantity: item.quantity 
                        });
                    } catch (e) {
                        console.error("Failed to sync item", item, e);
                    }
                }
                // Clear local storage after sync attempt
                localStorage.removeItem('guest_cart');
                toast.success("Coșul tău a fost sincronizat!");
            } catch (e) {
                console.error("Sync error", e);
            }
        }

        // 2. Fetch updated cart from backend
        try {
            const res = await axios.get(`/api/carts/user/${user.id}`);
            const cart = res.data;
            const mappedItems = cart.items.map((i: any) => ({
                 product: {
                     id: i.productId,
                     name: i.productName,
                     price: i.productPrice,
                     imageUrl: i.imageUrl || 'https://via.placeholder.com/100',
                     stallId: i.stallId, // Ensure backend sends this
                 },
                 quantity: i.quantity,
                 id: i.id
            }));

            // 3. Validation: If user is logged in and has own products in cart, clear it
            const hasOwnProducts = mappedItems.some((item: CartItem) => 
               user.stallId && item.product.stallId && Number(item.product.stallId) === Number(user.stallId)
            );

            if (hasOwnProducts) {
               await clearCart(true); // Internal clear that calls backend
               Swal.fire({
                   title: 'Coș Golit',
                   text: 'Am golit coșul deoarece conținea propriile tale produse. Nu poți cumpăra de la propria tarabă.',
                   icon: 'warning',
                   confirmButtonColor: '#b7472a'
               });
               setItems([]);
               setStallId(null);
            } else {
               setItems(mappedItems);
               if (mappedItems.length > 0) {
                   setStallId(mappedItems[0].product.stallId);
               } else {
                   setStallId(null);
               }
            }
        } catch (e) {
            console.error("Fetch cart error", e);
        } finally {
            setIsLoading(false);
        }
    };

    if (user) {
        syncAndFetch();
    }
  }, [user]);

  const addItem = async (product: Product, quantity: number) => {
    // Guest Logic
    if (!user) {
        // Validation: Only one stall per cart (Guest)
        if (items.length > 0 && Number(items[0].product.stallId) !== Number(product.stallId)) {
            const result = await Swal.fire({
                title: 'Altă tarabă?',
                text: 'Poți avea produse dintr-o singură tarabă în coș. Vrei să golește coșul și să adaugi acest produs?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Da, golește coșul',
                cancelButtonText: 'Anulează',
                confirmButtonColor: '#b7472a',
                cancelButtonColor: '#78716c'
            });

            if (result.isConfirmed) {
                // Clear and add new
                const newItem: CartItem = { id: Date.now(), product, quantity };
                const newItems = [newItem];
                setItems(newItems);
                setStallId(Number(product.stallId));
                localStorage.setItem('guest_cart', JSON.stringify(newItems));
                return { success: true };
            } else {
                return { success: false, error: 'Multiple stalls' };
            }
        }

        // Add to guest cart
        const existingItemIndex = items.findIndex(i => i.product.id === product.id);
        let newItems = [...items];
        
        if (existingItemIndex >= 0) {
            newItems[existingItemIndex].quantity += quantity;
        } else {
            newItems.push({ id: Date.now(), product, quantity }); // Temp ID
        }

        setItems(newItems);
        if (newItems.length > 0) setStallId(Number(newItems[0].product.stallId));
        localStorage.setItem('guest_cart', JSON.stringify(newItems));
        return { success: true };
    }

    // Authenticated Logic
    else {
        // Validation: Cannot add own product
        if (user.stallId && product.stallId && Number(product.stallId) === Number(user.stallId)) {
            Swal.fire({
                title: 'Acțiune nepermisă',
                text: 'Nu poți adăuga propriile produse în coș.',
                icon: 'error',
                confirmButtonColor: '#b7472a'
            });
            return { success: false, error: 'Cannot add own product' };
        }

        // Validation: Only one stall per cart (Backend check handles this usually, but good to check pending frontend state)
        if (items.length > 0 && Number(items[0].product.stallId) !== Number(product.stallId)) {
             const result = await Swal.fire({
                title: 'Altă tarabă?',
                text: 'Poți avea produse dintr-o singură tarabă în coș. Vrei să golește coșul și să adaugi acest produs?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Da, golește coșul',
                cancelButtonText: 'Anulează',
                confirmButtonColor: '#b7472a',
                cancelButtonColor: '#78716c'
            });
    
            if (result.isConfirmed) {
                await clearCart(true);
            } else {
                return { success: false, error: 'Multiple stalls' };
            }
        }

        try {
            await axios.post(`/api/carts/user/${user.id}/items`, { productId: product.id, quantity });
            // Refresh cart
            const res = await axios.get(`/api/carts/user/${user.id}`);
            const cart = res.data;
            const mappedItems = cart.items.map((i: any) => ({
                 product: {
                     id: i.productId,
                     name: i.productName,
                     price: i.productPrice,
                     imageUrl: i.imageUrl || 'https://via.placeholder.com/100',
                     stallId: i.stallId,
                 },
                 quantity: i.quantity,
                 id: i.id
            }));
            setItems(mappedItems);
            if (mappedItems.length > 0) setStallId(mappedItems[0].product.stallId);
            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Failed to add' };
        }
    }
  };

  const removeItem = async (itemId: number) => { 
    if (!user) {
        const newItems = items.filter(i => Number(i.id) !== itemId);
        setItems(newItems);
        if (newItems.length === 0) setStallId(null);
        localStorage.setItem('guest_cart', JSON.stringify(newItems));
        return;
    }
    
    try {
        await axios.delete(`/api/carts/user/${user.id}/items/${itemId}`);
        setItems(prev => prev.filter(i => (i as any).id !== itemId));
        // If empty?
        if (items.length <= 1) setStallId(null); 
    } catch (e) { console.error(e); }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
     if (quantity < 1) return;

     if (!user) {
         const newItems = items.map(i => Number(i.id) === itemId ? { ...i, quantity } : i);
         setItems(newItems);
         localStorage.setItem('guest_cart', JSON.stringify(newItems));
         return;
     }

     try {
         await axios.put(`/api/carts/user/${user.id}/items/${itemId}`, { quantity });
         setItems(prev => prev.map(i => (i as any).id === itemId ? { ...i, quantity } : i));
     } catch (e) { console.error(e); }
  };

  const clearCart = async (skipLocalClear = false) => {
      if (!user) {
          setItems([]);
          setStallId(null);
          if (!skipLocalClear) localStorage.removeItem('guest_cart');
          return;
      }

      try {
          await axios.delete(`/api/carts/user/${user.id}`);
          setItems([]);
          setStallId(null);
      } catch(e) { console.error(e); }
  };

  return (
    <CartContext.Provider value={{ items, stallId, addItem, removeItem, updateQuantity, clearCart, total, itemCount, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
