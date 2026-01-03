import { Link } from 'react-router-dom';
import { Eye, User, Store } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Order {
  id: number;
  created_at: string;
  total_cents: number;
  status: string;
  buyerName: string;
  stallName: string;
  total: number;
}

export default function AdminOrdersPage() {
  const fetchOrders = async () => {
      const res = await axios.get('/api/admin/orders');
      return (res.data.orders || []).map((o: any) => ({
             id: o.id,
             created_at: o.createdAt,
             status: o.status,
             buyerName: o.customerName || 'Necunoscut',
             stallName: o.stallName || 'Necunoscut',
             total: o.totalAmount || 0
      }));
  };

  const { data: orders = [], isLoading: loading, isError } = useQuery({
      queryKey: ['admin-orders'],
      queryFn: fetchOrders
  });

  if (isError) {
      toast.error("Nu s-au putut încărca tranzacțiile.");
  }

  if (loading) return <div className="p-8 text-center text-stone-500">Se încarcă tranzacțiile...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-800">Tranzacții</h1>
        <p className="text-stone-500">Vizualizare completă a tuturor comenzilor din platformă.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="min-w-full divide-y divide-stone-100">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Dată</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Vânzător</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Cumpărător</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">#{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                    {new Date(order.created_at).toLocaleDateString('ro-RO')} {new Date(order.created_at).toLocaleTimeString('ro-RO', {hour: '2-digit', minute:'2-digit'})}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                    <span className="flex items-center"><Store className="h-3 w-3 mr-1 text-stone-400" /> {order.stallName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                    <span className="flex items-center"><User className="h-3 w-3 mr-1 text-stone-400" /> {order.buyerName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-stone-900">{(order.total || 0).toFixed(2)} RON</td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase
                      ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'new_order' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                   `}>
                      {order.status}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/admin/orders/${order.id}`} className="inline-flex items-center text-fern hover:text-fern-dark bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 transition-colors">
                    <Eye className="h-4 w-4 mr-2" /> Inspectează
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="p-8 text-center text-stone-500">Nu există tranzacții.</div>}
      </div>
    </div>
  );
}
