import React, { createContext, useContext, ReactNode, useEffect, useMemo } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: () => void; // Dev login
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { useAuthStore } from '../stores/useAuthStore';

// ... interface AuthContextType kept for compatibility ...

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const { user, login, logout, initialize, isAuthenticated, isLoading } = useAuthStore();
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  const loginWithGoogle = async (token: string) => {
      await login('google', token);
  };

  const loginDev = () => login('google', 'dev-test-token');

  const contextValue = useMemo(() => ({
    user,
    login: loginDev,
    loginWithGoogle,
    logout,
    isAuthenticated,
    isLoading
  }), [user, loginDev, loginWithGoogle, logout, isAuthenticated, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
