import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  stallId: number | string | null; // Cart can only imply items from one stall
  
  // Getters
  total: () => number;
  itemsCount: () => number;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (isOpen?: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      stallId: null,

      total: () => {
        return get().items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      },

      itemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      addItem: (product, quantity = 1) => {
        const { items, stallId } = get();
        
        // Validation: Can only add items from the same stall
        if (stallId !== null && stallId !== product.stallId) {
            // Choice: Throw error or confirm clear?
            // For now, simple logic: if stall differs, request manual clear (handled by UI) or auto-replace?
            // Let's implement strict check here and let UI handle the prompt.
            throw new Error(`Conflict: Cart contains items from another stall (ID: ${stallId}). Clear cart first.`);
        }

        const existingItem = items.find(i => i.product.id === product.id);
        
        if (existingItem) {
            // Update quantity
            set({
                items: items.map(i => 
                    i.product.id === product.id 
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                ),
                stallId: product.stallId, // Confirm stall ID
                isOpen: true // Auto open cart on add
            });
        } else {
            set({
                items: [...items, { id: Date.now(), product, quantity }],
                stallId: product.stallId,
                isOpen: true
            });
        }
      },

      removeItem: (productId) => {
        set(state => {
            const newItems = state.items.filter(i => i.product.id !== productId);
            return {
                items: newItems,
                stallId: newItems.length === 0 ? null : state.stallId // Reset stallId if empty
            };
        });
      },

      updateQuantity: (productId, quantity) => {
         if (quantity <= 0) {
             get().removeItem(productId);
             return;
         }
         
         set(state => ({
             items: state.items.map(i => 
                 i.product.id === productId ? { ...i, quantity } : i
             )
         }));
      },

      clearCart: () => {
          set({ items: [], stallId: null });
      },

      toggleCart: (isOpen) => {
          set(state => ({ isOpen: isOpen ?? !state.isOpen }));
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, stallId: state.stallId }), // Don't persist isOpen
    }
  )
);
