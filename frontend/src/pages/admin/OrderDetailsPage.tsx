import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, User, Store, MessageSquare, ShoppingBag, CreditCard, Calendar, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    image: string | null;
    imageUrl?: string | null;
  };
  quantity: number;
  price_cents: number;
}

interface Message {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

interface OrderDetail {
  id: number;
  created_at: string;
  status: string;
  total_cents: number;
  order_items: OrderItem[];
  messages: Message[];
}

interface OrderData {
    order: OrderDetail;
    buyer: { id: number; name: string; email: string; };
    stall: { id: number; name: string; };
    total: number;
    formattedStatus: string;
}

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/admin/orders/${id}`);
        setData(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Comanda nu a fost găsită.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-stone-500">Se încarcă comanda...</div>;
  if (!data) return <div className="p-8 text-center text-stone-500">Comanda inexistentă.</div>;

  const { order, buyer, stall, total, formattedStatus } = data;

  return (
    <div className="space-y-8">
      <Link to="/admin/orders" className="flex items-center text-stone-500 hover:text-stone-900 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Înapoi la Tranzacții
      </Link>

      <div className="flex justify-between items-start">
         <div>
            <h1 className="text-2xl font-serif font-bold text-stone-800 flex items-center">
               Comanda #{order.id}
               <span className={`ml-4 text-sm px-3 py-1 rounded-full uppercase font-bold tracking-wide
                  ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
               `}>
                  {formattedStatus}
               </span>
            </h1>
            <p className="text-stone-500 text-sm mt-1 flex items-center">
               <Calendar className="h-4 w-4 mr-1" /> Plasată pe {new Date(order.created_at).toLocaleString('ro-RO')}
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Column: Order Items & Info */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Items */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
               <div className="p-6 border-b border-stone-100 font-bold text-stone-700 flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" /> Produse Comandate
               </div>
               <div className="divide-y divide-stone-100">
                  {order.order_items.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                       <div className="flex items-center">
                          {item.product.image ? (
                             <img src={item.product.image} className="h-12 w-12 rounded object-cover border border-stone-200" />
                          ) : (
                             <div className="h-12 w-12 rounded bg-stone-100 flex items-center justify-center text-stone-400 font-bold text-xs">IMG</div>
                          )}
                          <div className="ml-4">
                             <p className="font-medium text-stone-800">{item.product.name}</p>
                             <p className="text-sm text-stone-500">{item.quantity} x {(item.price_cents / 100).toFixed(2)} RON</p>
                          </div>
                       </div>
                       <div className="font-bold text-stone-800">
                          {(item.quantity * item.price_cents / 100).toFixed(2)} RON
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-6 bg-stone-50 flex justify-between items-center border-t border-stone-100">
                  <span className="font-medium text-stone-600">Total Comandă</span>
                  <span className="text-xl font-bold text-stone-900">{(total || 0).toFixed(2)} RON</span>
               </div>
            </div>

            {/* Chat History */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
               <div className="p-6 border-b border-stone-100 font-bold text-stone-700 flex items-center justify-between">
                  <div className="flex items-center">
                     <MessageSquare className="h-5 w-5 mr-2" /> Conversație
                  </div>
                  <span className="text-xs font-normal text-stone-500 bg-red-50 text-red-600 px-2 py-1 rounded">
                     Vizibil doar pentru Admin
                  </span>
               </div>
               <div className="p-6 bg-stone-50 max-h-96 overflow-y-auto space-y-4">
                  {order.messages.length > 0 ? order.messages.map(msg => (
                     <div key={msg.id} className={`flex flex-col ${msg.user.id === buyer.id ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 text-sm 
                           ${msg.user.id === buyer.id ? 'bg-blue-100 text-blue-900 rounded-tr-none' : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'}
                        `}>
                           <p className="font-bold text-xs mb-1 opacity-70">
                              {msg.user.id === buyer.id ? 'Cumpărător' : 'Vânzător'}: {msg.user.name}
                           </p>
                           {msg.content}
                        </div>
                        <span className="text-[10px] text-stone-400 mt-1">
                           {new Date(msg.created_at).toLocaleString('ro-RO')}
                        </span>
                     </div>
                  )) : (
                     <div className="text-center text-stone-400 italic">Nu există mesaje în această conversație.</div>
                  )}
               </div>
            </div>
         </div>

         {/* Right Column: Participants */}
         <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
               <h3 className="font-bold text-stone-400 uppercase text-xs mb-4">Detalii Părți Implicate</h3>
               
               <div className="space-y-6">
                  {/* Buyer */}
                  <div className="flex items-start">
                     <div className="bg-blue-50 p-2 rounded-lg mr-3">
                        <User className="h-5 w-5 text-blue-600" />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-stone-400 uppercase">Cumpărător</p>
                        <p className="font-medium text-stone-900">{buyer.name}</p>
                        <p className="text-sm text-stone-500">{buyer.email}</p>
                        <Link to={`/admin/users/${buyer.id}`} className="text-xs text-fern hover:underline mt-1 block">Vezi Profil</Link>
                     </div>
                  </div>

                  {/* Seller */}
                  <div className="flex items-start pt-6 border-t border-stone-100">
                     <div className="bg-orange-50 p-2 rounded-lg mr-3">
                        <Store className="h-5 w-5 text-orange-600" />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-stone-400 uppercase">Vânzător (Tarabă)</p>
                        <p className="font-medium text-stone-900">{stall.name}</p>
                        <Link to={`/stalls/${stall.id}`} className="text-xs text-fern hover:underline mt-1 block">Vezi Tarabă Publică</Link>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-stone-900 text-stone-300 rounded-xl p-6 text-sm">
               <h4 className="text-white font-bold mb-2 flex items-center">
                  <Eye className="h-4 w-4 mr-2" /> Admin Note
               </h4>
               <p>
                  Ai acces complet la această tranzacție. Poți verifica istoricul de mesaje pentru a modera eventuale dispute.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
