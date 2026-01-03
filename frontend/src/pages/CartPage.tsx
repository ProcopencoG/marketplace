import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Trash2, Plus, Minus, ArrowLeft, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function CartPage() {
  const { items, stallId, updateQuantity, removeItem, clearCart, total } = useCart();
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
      onSuccess: async (tokenResponse) => {
          await loginWithGoogle(tokenResponse.access_token);
      },
      onError: error => console.log('Login Failed:', error)
  });
  
  // Stall name isn't currently in CartContext, but we can derive or fetch it. 
  // For now, default to "Tarabă" or maybe we add stall details to CartContext later.
  const stallName = "Tarabă"; 

  const [tempLocation, setTempLocation] = useState(user?.location || '');
  const [isChangingLocation, setIsChangingLocation] = useState(false);

  const CITIES = [
    'Cluj-Napoca', 'București', 'Timișoara', 'Iași', 'Constanța', 
    'Craiova', 'Brașov', 'Galați', 'Oradea', 'Ploiești', 'Sibiu'
  ];

  const handleCheckout = () => {
    if (total < 5) {
      toast.warn("Valoarea minimă a comenzii este 5 RON.");
      return;
    }
    Swal.fire({
       title: 'Plasare Comandă',
       text: "Confirmi plasarea comenzii?",
       icon: 'question',
       showCancelButton: true,
       confirmButtonColor: '#4a7c59',
       cancelButtonColor: '#d33',
       confirmButtonText: 'Da, plasează comanda!',
       cancelButtonText: 'Mai aștept'
    }).then(async (result) => {
       if(result.isConfirmed) {
           try {
             await axios.post('/api/orders', { 
                stallId: stallId,
                items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
                total: total,
                location: tempLocation || user?.location
             });
             await clearCart();
             navigate('/orders');
             toast.success("Comanda a fost plasată cu succes!");
           } catch (error) {
             console.error("Order error", error);
             toast.error("Eroare la plasarea comenzii.");
           }
       }
    });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-serif font-bold text-stone-700 mb-4">Coșul tău este gol</h2>
        <p className="text-stone-500 mb-8">Nu ai adăugat încă produse în coș.</p>
        <Link to="/">
          <Button>Explorează Tarabele</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to={stallId ? `/stalls/${String(stallId)}` : '/'} className="inline-flex items-center text-stone-500 hover:text-fern mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Înapoi la cumpărături
      </Link>
      
      <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50">
          <h1 className="text-2xl font-serif font-bold text-stone-800">Coșul de cumpărături</h1>
          {stallId && (
            <div className="flex items-center mt-2 text-sm text-stone-600">
              Comanzi de la: <Link to={`/stalls/${stallId}`} className="font-bold text-fern hover:underline ml-1">{stallName}</Link>
            </div>
          )}
        </div>
        
        <div className="divide-y divide-stone-100">
          {items.map(({ id, product, quantity }) => (
            <div key={id} className="p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="h-20 w-20 flex-shrink-0 bg-stone-100 rounded-md overflow-hidden">
                {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />}
              </div>
              
              <div className="flex-grow text-center sm:text-left">
                <h3 className="font-bold text-stone-800">{product.name}</h3>
                <p className="text-sm text-stone-500">{product.price.toFixed(2)} RON / {product.unit || 'buc'}</p>
              </div>
              
              <div className="flex items-center bg-stone-100 rounded-lg p-1">
                <button onClick={() => updateQuantity(Number(id), quantity - 1)} className="p-1 hover:bg-white rounded-md transition-colors">
                  <Minus className="h-4 w-4 text-stone-600" />
                </button>
                <span className="w-8 text-center font-medium text-stone-700">{quantity}</span>
                <button onClick={() => updateQuantity(Number(id), quantity + 1)} className="p-1 hover:bg-white rounded-md transition-colors">
                  <Plus className="h-4 w-4 text-stone-600" />
                </button>
              </div>
              
              <div className="font-bold text-lg text-stone-800 w-24 text-right">
                {(product.price * quantity).toFixed(2)} RON
              </div>
              
              <button onClick={() => removeItem(Number(id))} className="text-stone-400 hover:text-red-500 p-2">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-stone-50 border-t border-stone-100">
          <div className="mb-6 p-4 bg-white rounded-lg border border-stone-100">
             <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-stone-600">Adresă de livrare</span>
                {!isChangingLocation && (
                   <button onClick={() => setIsChangingLocation(true)} className="text-xs text-fern hover:underline">Schimbă Locația</button>
                )}
             </div>
             {isChangingLocation ? (
                <div className="flex gap-2">
                   <select 
                      className="flex-grow text-sm border-stone-200 rounded-md p-2"
                      value={tempLocation}
                      onChange={(e) => setTempLocation(e.target.value)}
                   >
                      <option value="">Alege orașul...</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                   <Button size="sm" onClick={() => setIsChangingLocation(false)}>OK</Button>
                </div>
             ) : (
                <div className="flex items-center text-stone-800">
                   <MapPin className="h-4 w-4 mr-2 text-stone-400" />
                   {tempLocation || "Nicio locație setată"}
                </div>
             )}
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-lg text-stone-600">Total</span>
            <div className="text-right">
               <span className="text-3xl font-serif font-bold text-fern">{total.toFixed(2)} RON</span>
               {total < 5 && <p className="text-[10px] text-red-500 mt-1">Minim 5 RON pentru comandă</p>}
            </div>
          </div>
          
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button variant="ghost" className="text-stone-500" onClick={clearCart}>Golește Coșul</Button>
              {user ? (
                <Button size="lg" onClick={handleCheckout} disabled={total < 5} className="w-full sm:w-auto">
                  Finalizează Comanda
                </Button>
              ) : (
                <Button size="lg" className="w-full sm:w-auto" onClick={() => googleLogin()}>
                  Autentifică-te pentru a Comanda
                </Button>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
