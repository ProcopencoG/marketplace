import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Package, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

import { getStatusColor, getStatusLabel } from '../lib/statusHelpers';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
        axios.get(`/api/orders/user/${user.id}`)
             .then(res => setOrders(res.data))
             .catch(console.error)
             .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [user]);

  if (!user) {
    return <div className="p-12 text-center text-stone-500">Trebuie să te autentifici pentru a vedea comenzile.</div>;
  }
  
  if (loading) {
      return <div className="p-12 text-center text-stone-500">Se încarcă comenzile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold text-stone-800 mb-8">Comenzile Mele</h1>
      
      {orders.length === 0 ? (
         <div className="bg-white rounded-lg p-12 text-center border border-stone-100 shadow-sm">
             <Package className="h-12 w-12 mx-auto text-stone-300 mb-4" />
             <h3 className="text-lg font-medium text-stone-700">Nu ai plasat nicio comandă.</h3>
             <Link to="/" className="mt-4 inline-block">
                <Button>Începe Cumpărăturile</Button>
             </Link>
         </div>
      ) : (
         <div className="space-y-4">
            {orders.map(order => (
               <Link key={order.id} to={`/orders/${order.id}`} className="block bg-white rounded-lg border border-stone-100 shadow-sm hover:shadow-md transition-shadow p-6 group">
                   <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <span className="font-bold text-lg text-fern">#{order.id}</span>
                             <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusColor(order.status))}>
                                {getStatusLabel(order.status)}
                             </span>
                          </div>
                          <div className="flex items-center text-sm text-stone-500">
                             <Calendar className="h-4 w-4 mr-1" />
                             {new Date(order.createdAt).toLocaleDateString('ro-RO')}
                             <span className="mx-2">•</span>
                             {order.stallName || order.stall?.name || 'Tarabă'}
                          </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-6 flex-grow">
                          <div className="font-bold text-xl text-stone-800">
                             {order.totalPrice.toFixed(2)} RON
                          </div>
                          <ChevronRight className="h-5 w-5 text-stone-300 group-hover:text-fern transition-colors" />
                      </div>
                   </div>
               </Link>
            ))}
         </div>
      )}
    </div>
  );
}
