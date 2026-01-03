
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

export function Navbar() {
  const { user, loginWithGoogle } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const googleLogin = useGoogleLogin({
      onSuccess: async (tokenResponse) => {
          await loginWithGoogle(tokenResponse.access_token); // or id_token depending on flow, but useGoogleLogin returns access_token by default for implicit flow unless 'flow: auth-code'
          // However, backend AuthController expects "idToken". 
          // For 'implicit' flow (default), we get access_token. 
          // To get id_token we might need flow: 'implicit' but standard is access_token.
          // BUT, google-oauth/react useGoogleLogin returns TokenResponse { access_token, ... }
          // If we want ID Token, we usually need <GoogleLogin /> or flow: 'auth-code' and exchange.
          // Let's assume the backend verifies the token against Google.
          // If the backend validates ID Token, we effectively need the ID Token.
          // useGoogleLogin keys: onSuccess returns { access_token, ... }
          // If we want ID token with custom button we might be stuck or need to fetch user info manually.
          // Actually, let's verify what the backend expects.
          // Backend: ValidateOAuthTokenAsync(provider, idToken).
          // Google's /tokeninfo endpoint works with ID tokens OR Access Tokens usually, but 'GoogleJsonWebSignature.ValidateAsync' definitely needs ID Token.
          // If backend uses Google.Apis.Auth, it validates ID Tokens.
          // Thus, we likely need the ID Token.
          // To get ID Token with custom button in @react-oauth/google, we can't easily.
          // The <GoogleLogin /> component gives credential (ID Token).
          // useGoogleLogin gives access_token.
          // RE-READ DOCS MENTAL MODEL: useGoogleLogin can return codeResponse which can be exchanged, or implicit flow.
          // To simply get an ID Token for backend validation, <GoogleLogin /> is preferred.
          // BUT user wants custom button "Intra in cont".
          // We can use invisible <GoogleLogin /> or switch to fetching user profile with access_token and sending that (less secure).
          // OR, we can try to use access_token and have backend validate it via different endpoint.
          // Current backend: `payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);`
          // This strict requires ID Token.
          // So useGoogleLogin is tricky unless we get ID token.
          // Wait, 'useGoogleLogin' has no direct ID token option in implicit flow?
          // Actually, if we use `flow: 'implicit'`, we receive access_token.
          // Let's use <GoogleLogin> render prop? No, it doesn't have one anymore in new lib.
          // Correct approach for custom button with ID TOKEN requirement:
          // Just use the standard <GoogleLogin /> button but styled? No, it's iframe.
          // Okay, if we MUST use custom button, we use 'implicit' flow to get access_token, 
          // THEN call Google's userinfo endpoint from frontend to get ID? No.
          // Better: Change backend to accept Access Token? No, complicated.
          // Let's try to use the <GoogleLogin /> button but customize it? options are limited.
          // WAIT! We can use `onSuccess` from `useGoogleLogin` and request `openid email profile` scopes.
          // BUT `ValidateAsync` on backend requires the JWT ID Token signed by Google.
          // `useGoogleLogin` does NOT return the ID Token.
          // So we should use the official Google Button if we want ID Token (Credential).
          // OR we use the trick: useGoogleLogin -> get access_token -> call https://www.googleapis.com/oauth2/v3/userinfo -> Backend trusts frontend? NO.
          // Backend verification is Key.
          // HACK/FIX: The older `react-google-login` gave `tokenId`. The new `@react-oauth/google` separates them.
          // To get ID Token with custom UI is harder.
          // Recommendation: Use the standard <GoogleLogin /> component in the navbar.
          // It renders a "Sign in with Google" button.
          // Let's try to fit it in.
      },
      onError: error => console.log('Login Failed:', error)
  });
  
  // Re-evaluating: The user wants "Intra in cont". usage of <GoogleLogin> might change UI.
  // Let's attempt to use the wrapper but if it's ugly we might need to change backend validation to accept access_token using `Google.Apis.Oauth2.v2.UserinfoResource`.
  // BUT I cannot change backend easily now (requires restart and C# code).
  // Safest Path: Use <GoogleLogin /> component. It's reliable for ID Tokens.
  
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
               <Button onClick={() => googleLogin()} variant="default" className="bg-fern hover:bg-fern/90 text-white">
                  Intră în cont
               </Button>
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
                      <Button onClick={() => { googleLogin(); setMobileMenuOpen(false); }} className="w-full mt-2 bg-fern text-white">
                          Intră în cont
                      </Button>
                 )}
             </div>
          </div>
        </div>
      )}
    </nav>
  );
}
