import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Store, ShoppingBag, LogOut, Menu, X, Home, FileText, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
// NavLinks component moved outside to avoid recreating on each render
function NavLinks({ 
  isActive, 
  setMobileMenuOpen 
}: { 
  readonly isActive: (path: string) => boolean; 
  readonly setMobileMenuOpen: (open: boolean) => void;
}) {
  return (
    <>
       <Link 
         to="/admin/dashboard" 
         className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${isActive('/admin/dashboard') ? 'bg-fern text-white font-medium' : 'hover:bg-stone-800 hover:text-white'}`}
         onClick={() => setMobileMenuOpen(false)}
       >
         <LayoutDashboard className="h-4 w-4 mr-3" />
         Panou de Control
       </Link>
       
       <Link 
         to="/admin/stalls" 
         className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${isActive('/admin/stalls') ? 'bg-fern text-white font-medium' : 'hover:bg-stone-800 hover:text-white'}`}
         onClick={() => setMobileMenuOpen(false)}
       >
         <Store className="h-4 w-4 mr-3" />
         Tarabe
       </Link>
       
       <Link 
         to="/admin/users" 
         className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${isActive('/admin/users') ? 'bg-fern text-white font-medium' : 'hover:bg-stone-800 hover:text-white'}`}
         onClick={() => setMobileMenuOpen(false)}
       >
         <Users className="h-4 w-4 mr-3" />
         Utilizatori
       </Link>
       
       <Link 
         to="/admin/orders" 
         className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${isActive('/admin/orders') ? 'bg-fern text-white font-medium' : 'hover:bg-stone-800 hover:text-white'}`}
         onClick={() => setMobileMenuOpen(false)}
       >
         <ShoppingBag className="h-4 w-4 mr-3" />
         Tranzacții
       </Link>

       <Link 
         to="/admin/logs" 
         className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${isActive('/admin/logs') ? 'bg-fern text-white font-medium' : 'hover:bg-stone-800 hover:text-white'}`}
         onClick={() => setMobileMenuOpen(false)}
       >
         <FileText className="h-4 w-4 mr-3" />
         System Logs
       </Link>
    </>
  );
}

function AdminLayoutContent({ children }: { readonly children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
     if (!isLoading) {
         if (!user?.isAdmin) {
             navigate('/');
         }
     }
  }, [user, isLoading, navigate]);

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-stone-50 text-stone-500">Se încarcă...</div>;
  if (!user?.isAdmin) return null; // Wait for redirect

  const isActive = (path: string) => location.pathname.startsWith(path);


  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button type="button" className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" />
          <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-stone-900 text-stone-300 shadow-xl">
             <div className="p-6 border-b border-stone-800 flex justify-between items-center">
                 <Link to="/" className="font-serif text-xl font-bold text-white flex items-center">
                   <span className="text-fern mr-1">❖</span> PD Admin
                 </Link>
                 <button onClick={() => setMobileMenuOpen(false)} className="text-stone-400 hover:text-white">
                    <X className="h-6 w-6" />
                 </button>
             </div>
             
             <div className="p-4 bg-stone-800">
                <p className="text-xs uppercase font-bold text-stone-500 mb-1">Logat ca</p>
                <p className="text-sm font-medium text-white">{user?.name}</p>
             </div>

             <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <Link 
                    to="/" 
                    className="flex items-center px-4 py-2.5 rounded-lg transition-colors text-stone-400 hover:bg-stone-800 hover:text-white mb-4 border-b border-stone-800 pb-4"
                >
                    <Home className="h-4 w-4 mr-3" />
                    Înapoi la Piață
                </Link>
                <NavLinks isActive={isActive} setMobileMenuOpen={setMobileMenuOpen} />
              {(user?.email === "gabrielprocopenco@gmail.com") && (
                 <Link 
                   to="/admin/admins" 
                   className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${isActive('/admin/admins') ? 'bg-fern text-white font-medium' : 'hover:bg-amber-900/40 text-amber-200 hover:text-white'}`}
                   onClick={() => setMobileMenuOpen(false)}
                 >
                   <Shield className="h-4 w-4 mr-3" />
                   Gestionare Admini
                 </Link>
              )}
             </nav>
             
             <div className="p-4 border-t border-stone-800">
                <button onClick={logout} className="flex items-center px-4 py-2.5 w-full text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-lg transition-colors">
                  <LogOut className="h-4 w-4 mr-3" />
                  Deconectare
                </button>
             </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-stone-900 text-stone-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-stone-800">
           <Link to="/" className="font-serif text-xl font-bold text-white flex items-center">
             <span className="text-fern mr-1">❖</span> Piața Online
           </Link>
           <div className="mt-4 px-3 py-2 bg-stone-800 rounded-lg">
              <p className="text-xs uppercase font-bold text-stone-500 mb-1">Admin Mode</p>
              <p className="text-sm font-medium text-white">{user?.name}</p>
           </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
           <Link 
                to="/" 
                className="flex items-center px-4 py-2.5 rounded-lg transition-colors text-stone-400 hover:bg-stone-800 hover:text-white mb-2"
            >
                <Home className="h-4 w-4 mr-3" />
                Înapoi la Piață
            </Link>
           <NavLinks isActive={isActive} setMobileMenuOpen={setMobileMenuOpen} />
           {(user?.email === "gabrielprocopenco@gmail.com") && (
              <Link 
                to="/admin/admins" 
                className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${isActive('/admin/admins') ? 'bg-fern text-white font-medium' : 'hover:bg-amber-900/40 text-amber-200 hover:text-white'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="h-4 w-4 mr-3" />
                Gestionare Admini
              </Link>
           )}
           {/* Add spacer or logic if needed, but NavLinks handles main items */}
        </nav>
        
        <div className="p-4 border-t border-stone-800">
          <button onClick={logout} className="flex items-center px-4 py-2.5 w-full text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-lg transition-colors">
            <LogOut className="h-4 w-4 mr-3" />
            Deconectare
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative w-full">
          <div className="md:hidden bg-stone-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
             <div className="flex items-center">
                 <span className="font-bold text-lg mr-2">Admin Panel</span>
             </div>
             <button onClick={() => setMobileMenuOpen(true)} className="text-stone-300 hover:text-white focus:outline-none">
                 <Menu className="h-6 w-6" />
             </button>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
             {children}
          </div>
      </main>
    </div>
  );
}

export function AdminLayout({ children }: { readonly children: React.ReactNode }) {
  return (
      <AdminLayoutContent>{children}</AdminLayoutContent>
  );
}
