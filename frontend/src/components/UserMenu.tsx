import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User as UserIcon, Store, Package, ShoppingBag, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    // Silent check to sync stall status if user is logged in
    const syncStallStatus = async () => {
      if (user && !user.hasStall) {
        try {
          // If this succeeds, it means they HAVE a stall but the local state says NO
          const res = await axios.get('/api/seller/dashboard');
          if (res.data && res.data.stall) {
            useAuthStore.getState().updateUser({ ...user, hasStall: true });
          }
        } catch (err: any) {
          // 404 is expected if they truly don't have a stall
        }
      }
    };
    syncStallStatus();

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 focus:outline-none hover:bg-stone-100 p-1.5 rounded-full transition-all duration-200 border border-transparent hover:border-stone-200 ${isOpen ? 'bg-white border-stone-200 shadow-sm ring-1 ring-stone-950/5' : ''}`}
      >
        <img src={user.avatarUrl || 'https://ui-avatars.com/api/?name=' + user.name} alt={user.name} className="h-8 w-8 rounded-full border border-stone-300" />
        <span className="text-sm font-medium text-stone-700 hidden lg:block">{user.name}</span>
        <ChevronDown className={`h-4 w-4 text-stone-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          
          {user.isAdmin && (
            <div className="py-1">
              <Link 
                to="/admin/dashboard" 
                className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="mr-3 p-1.5 bg-stone-50 rounded-lg text-stone-500 group-hover:bg-stone-100 transition-colors">
                    <LayoutDashboard className="h-4 w-4" />
                </div>
                <span className="font-medium">Admin Panel</span>
              </Link>
            </div>
          )}

          <div className="py-1">
            <Link 
              to="/orders" 
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="mr-3 p-1.5 bg-stone-50 rounded-lg text-stone-500 group-hover:bg-stone-100 transition-colors">
                  <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="font-medium">Comenzile Mele</span>
            </Link>
          </div>

          <div className="py-1">
            {user.hasStall ? (
              <Link 
                to="/seller/dashboard" 
                className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="mr-3 p-1.5 bg-stone-50 rounded-lg text-stone-500 group-hover:bg-stone-100 transition-colors">
                    <Store className="h-4 w-4" />
                </div>
                <span className="font-medium">Taraba Mea</span>
              </Link>
            ) : (
              <Link 
                to="/seller/stall/new" 
                className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="mr-3 p-1.5 bg-stone-50 rounded-lg text-stone-500 group-hover:bg-stone-100 transition-colors">
                    <Store className="h-4 w-4" />
                </div>
                <span className="font-medium">Crează tarabă</span>
              </Link>
            )}
          </div>

          <div className="border-t border-gray-100 py-1">
            <button 
              onClick={logout}
              className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <div className="mr-3 p-1.5 bg-stone-50 rounded-lg text-red-600 group-hover:bg-stone-100 transition-colors">
                  <LogOut className="h-4 w-4" />
              </div>
              <span className="font-medium">Deconectare</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
