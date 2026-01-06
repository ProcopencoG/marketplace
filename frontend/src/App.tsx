import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { AdminLayout } from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import HowItWorksPage from './pages/HowItWorksPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import SellerOrdersPage from './pages/SellerOrdersPage';
import SellerOrderDetailsPage from './pages/SellerOrderDetailsPage';
import StallPage from './pages/StallPage';
import CreateStallPage from './pages/seller/CreateStallPage';

// Admin Pages
// Admin Pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import AdminOrderDetailsPage from './pages/admin/OrderDetailsPage';
import AdminUsersPage from './pages/admin/UsersPage';
import UserDetailPage from './pages/admin/UserDetailPage';
import AdminStallsPage from './pages/admin/StallsPage';
import StallDetailPage from './pages/admin/StallDetailPage';
import LogsPage from './pages/admin/LogsPage';
import ManageAdminsPage from './pages/admin/ManageAdminsPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootLayout><HomePage /></RootLayout>} />
            <Route path="/cart" element={<RootLayout><CartPage /></RootLayout>} />
            <Route path="/orders" element={<RootLayout><OrdersPage /></RootLayout>} />
            <Route path="/orders/:id" element={<RootLayout><OrderDetailsPage /></RootLayout>} />
            
            {/* Seller Routes */}
            <Route path="/seller" element={<RootLayout><SellerDashboardPage /></RootLayout>} />
            <Route path="/seller/dashboard" element={<RootLayout><SellerDashboardPage /></RootLayout>} />
            <Route path="/seller/orders" element={<RootLayout><SellerOrdersPage /></RootLayout>} />
            <Route path="/seller/orders/:id" element={<RootLayout><SellerOrderDetailsPage /></RootLayout>} />
            <Route path="/seller/stall/new" element={<CreateStallPage />} />
            
            {/* Public Routes */}
            <Route path="/stalls/:id" element={<RootLayout><StallPage /></RootLayout>} />
            <Route path="/termeni" element={<RootLayout><TermsPage /></RootLayout>} />
            <Route path="/contact" element={<RootLayout><ContactPage /></RootLayout>} />
            <Route path="/cum-functioneaza" element={<RootLayout><HowItWorksPage /></RootLayout>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
            <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
            <Route path="/admin/orders" element={<AdminLayout><AdminOrdersPage /></AdminLayout>} />
            <Route path="/admin/orders/:id" element={<AdminLayout><AdminOrderDetailsPage /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><AdminUsersPage /></AdminLayout>} />
            <Route path="/admin/users/:id" element={<AdminLayout><UserDetailPage /></AdminLayout>} />
            <Route path="/admin/stalls" element={<AdminLayout><AdminStallsPage /></AdminLayout>} />
            <Route path="/admin/stalls/:id" element={<AdminLayout><StallDetailPage /></AdminLayout>} />
            <Route path="/admin/logs" element={<AdminLayout><LogsPage /></AdminLayout>} />
            <Route path="/admin/admins" element={<AdminLayout><ManageAdminsPage /></AdminLayout>} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
