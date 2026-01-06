
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { useState } from 'react';
import { useGoogleLogin, GoogleLogin, CredentialResponse } from '@react-oauth/google';

import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

export function Navbar() {
  const { user, loginWithGoogle } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const googleLogin = useGoogleLogin({
      onSuccess: async (tokenResponse) => {
          await loginWithGoogle(tokenResponse.access_token);
      },
      onError: error => console.log('Login Failed:', error)
  });

  // Handle Google One Tap credential response (ID Token)
  const handleOneTapSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      await loginWithGoogle(credentialResponse.credential);
    }
  };

  return (
    <nav className="bg-cream border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* ... same Logo ... */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center select-none">
               <span className="text-2xl font-serif font-bold text-fern flex items-center">
                  <span className="mr-2">❖</span> Piața Online
               </span>
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-8">
              <Link to="/cum-functioneaza" className="flex items-center text-stone-600 hover:text-fern transition-colors group">
                 <div className="bg-fern/10 p-1.5 rounded-full mr-2 group-hover:bg-fern/20 transition-colors">
                    <Play className="h-4 w-4 text-fern fill-current" />
                 </div>
                 <span className="font-bold">Cum Funcționează</span>
              </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-4">
             {user && <NotificationBell />}
             
             <Link to="/cart">
               <Button variant="ghost" size="icon" className="relative text-stone-600 hover:text-fern">
                 <ShoppingCart className="h-6 w-6" />
                 {itemCount > 0 && (
                   <span className="absolute -top-1 -right-1 bg-marigold text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                     {itemCount}
                   </span>
                 )}
               </Button>
             </Link>

             {user ? (
               <UserMenu />
             ) : (
               <>
                 {/* Google One Tap prompt - shows automatically */}
                 <div className="hidden">
                   <GoogleLogin
                     onSuccess={handleOneTapSuccess}
                     onError={() => console.log('One Tap Failed')}
                     useOneTap
                     auto_select
                   />
                 </div>
                 {/* Regular login button - fallback */}
                 <button 
                   onClick={() => googleLogin()}
                   className="flex items-center gap-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 px-4 py-2 rounded-full font-medium shadow-sm transition-all hover:shadow"
                 >
                   <svg className="w-5 h-5" viewBox="0 0 24 24">
                     <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                     <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                     <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                     <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                   </svg>
                   Intră în cont
                 </button>
               </>
             )}
          </div>
          {/* ... Mobile ... */}
           <div className="flex items-center sm:hidden space-x-4">
            <Link to="/cart" className="relative text-stone-600 hover:text-fern">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-marigold text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </Link>
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-stone-600 hover:text-fern focus:outline-none"
            >
                <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
       {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-cream border-t border-stone-200">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <Link to="/" className="block text-stone-600 hover:text-fern py-2 text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
                Acasă
            </Link>
            <Link to="/cum-functioneaza" className="block text-stone-600 hover:text-fern py-2 text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
                Cum Funcționează
            </Link>
             <div className="border-t border-stone-200 mt-2 pt-2">
                 {user ? (
                     <div className="flex items-center justify-between py-2">
                         <div className="flex items-center space-x-2">
                            <img src={user.avatarUrl || 'https://ui-avatars.com/api/?name=' + user.name} alt={user.name} className="h-8 w-8 rounded-full" />
                            <span className="text-sm font-medium text-stone-700">{user.name}</span>
                         </div>
                         <div className="space-y-2 text-right">
                             {user.isAdmin && (
                                <Link to="/admin/dashboard" className="block text-sm font-bold text-red-600" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
                             )}
                            <Link to="/orders" className="block text-sm text-stone-600" onClick={() => setMobileMenuOpen(false)}>Comenzile Mele</Link>
                             <Link to="/seller/dashboard" className="block text-sm text-stone-600" onClick={() => setMobileMenuOpen(false)}>Taraba Mea</Link>
                         </div>
                     </div>
                 ) : (
                      <button 
                        onClick={() => { googleLogin(); setMobileMenuOpen(false); }}
                        className="w-full mt-2 flex items-center justify-center gap-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 px-4 py-2.5 rounded-full font-medium shadow-sm"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Intră în cont
                      </button>
                 )}
             </div>
          </div>
        </div>
      )}
    </nav>
  );
}
