import React from 'react'
import { createRoot } from 'react-dom/client'
import './css/application.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { HelmetProvider } from 'react-helmet-async'

import { GoogleOAuthProvider } from '@react-oauth/google'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const container = document.getElementById('root')
const root = createRoot(container)

const queryClient = new QueryClient()

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="238970433340-j5pk0ub2gnml42cstn0spcbp6js9fvke.apps.googleusercontent.com">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <HelmetProvider>
              <App />
            </HelmetProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
