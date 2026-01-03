import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (provider: string, idToken: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // Start loading to check token

      login: async (provider: string, idToken: string) => {
        try {
            const res = await axios.post('/api/auth/login', { provider, idToken });
            console.log("Login Response Data:", res.data);
            const { accessToken, user } = res.data;
            
            // Set global header
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            
            set({ 
                user, 
                token: accessToken, 
                isAuthenticated: true,
                isLoading: false 
            });
        } catch (error) {
            console.error('Login failed', error);
            throw error; // Let component handle UI feedback
        }
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false });
        
        // Optional: Redirect or cleanup
        window.location.href = '/';
      },

      initialize: async () => {
        const { token } = get();
        if (token) {
            try {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const res = await axios.get('/api/auth/me');
                console.log("Initialize Me Data:", res.data);
                set({ user: res.data, isAuthenticated: true, isLoading: false });
            } catch (error) {
                console.error('Session expired', error);
                // Clear invalid token
                get().logout();
                set({ isLoading: false });
            }
        } else {
            set({ isLoading: false });
        }
      },
      
      updateUser: (user: User) => {
          set({ user });
      }
    }),
    {
      name: 'auth-storage', // key in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }), // Only persist token, fetch user on load
    }
  )
);
