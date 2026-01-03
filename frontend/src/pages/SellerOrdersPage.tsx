import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { ClipboardList, MapPin, User, ChevronRight } from 'lucide-react';
import axios from 'axios';

interface SellerOrdersPageProps {
}

import { getStatusColor, getStatusLabel } from '../lib/statusHelpers';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      axios.get('/api/seller/orders')
           .then(res => setOrders(res.data))
           .catch(console.error)
           .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-stone-500">Se încarcă comenzile...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-stone-800">Comenzi Primite</h1>
        <p className="text-stone-600">Gestionează comenzile primite de la clienți.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100 text-xs uppercase font-bold text-stone-500">
                <th className="px-6 py-4">Client / Locație</th>
                <th className="px-6 py-4">Dată</th>
                <th className="px-6 py-4 text-center">Produse</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.length > 0 ? (
                orders.map((order) => {
                  return (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-stone-800 flex items-center">
                          <User className="h-3 w-3 mr-1" /> {order.buyerName}
                        </span>
                        <span className="text-xs text-stone-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" /> {order.location || 'Nespecificată'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {new Date(order.createdAt).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium">
                      {order.itemCount}
                    </td>
                    <td className="px-6 py-4 font-bold text-stone-800">
                      {order.total || order.totalPrice} RON
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link to={`/seller/orders/${order.id}`}>
                         <Button variant="ghost" size="sm" className="text-fern hover:text-fern/80">
                            Detalii <ChevronRight className="h-4 w-4 ml-1" />
                         </Button>
                       </Link>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center">
                       <ClipboardList className="h-12 w-12 text-stone-200 mb-2" />
                       <p>Nu ai primit nicio comandă încă.</p>
                       <p className="text-xs">Asigură-te că ai produse active în taraba ta.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
