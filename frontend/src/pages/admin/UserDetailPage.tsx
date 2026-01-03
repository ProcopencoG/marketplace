import { Link, useParams, useNavigate } from 'react-router-dom';
import { User, Store, ShoppingBag, MapPin, Mail, Calendar, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface OrderSummary {
  id: number;
  created_at: string;
  total_cents: number;
  status: string;
  stallName: string;
  total: number;
}

interface UserDetail {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  location: string;
  created_at: string;
}

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/admin/users/${id}`);
        setUser(res.data.user);
        setOrders(res.data.orders);
      } catch (error) {
        console.error(error);
        toast.error("Nu s-a putut încărca utilizatorul.");
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  const handleDelete = () => {
    if (!user) return;
    Swal.fire({
        title: 'Ștergere Utilizator',
        text: 'Sigur doriți să ștergeți acest utilizator? Această acțiune este ireversibilă.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#78716c',
        confirmButtonText: 'Da, șterge!',
        cancelButtonText: 'Anulează'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/admin/users/${user.id}`);
                toast.success("Utilizator șters.");
                navigate('/admin/users');
            } catch (error) {
                console.error(error);
                toast.error("Eroare la ștergere.");
            }
        }
    });
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Se încarcă detaliile...</div>;
  if (!user) return <div className="p-8 text-center text-stone-500">Utilizator inexistent.</div>;

  return (
    <div className="space-y-8">
      <Link to="/admin/users" className="flex items-center text-stone-500 hover:text-stone-900 transition-colors mb-4">
         <ArrowLeft className="h-4 w-4 mr-2" /> Înapoi la Utilizatori
      </Link>

      {/* User Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
         <img src={user.avatar_url} alt={user.name} className="w-32 h-32 rounded-full border-4 border-stone-50" />
         <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">{user.name}</h1>
            <div className="flex flex-col md:flex-row gap-4 text-stone-500 items-center md:items-start">
               <span className="flex items-center"><Mail className="h-4 w-4 mr-2" /> {user.email}</span>
               <span className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> {user.location || 'Fără locație'}</span>
               <span className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> Înregistrat pe {new Date(user.created_at).toLocaleDateString('ro-RO')}</span>
            </div>
         </div>
         <button 
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-100"
         >
            <User className="h-4 w-4 mr-2" /> Șterge Utilizator
         </button>
      </div>

      {/* Orders History */}
      <div>
         <h2 className="text-xl font-bold font-serif text-stone-800 mb-4 flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2 text-fern" /> Istoric Comenzi ({orders.length})
         </h2>
         <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
            <table className="min-w-full divide-y divide-stone-100">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Dată</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Tarabă</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                   <tr key={order.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4 text-sm font-medium text-stone-900">#{order.id}</td>
                      <td className="px-6 py-4 text-sm text-stone-500">{new Date(order.created_at).toLocaleDateString('ro-RO')}</td>
                      <td className="px-6 py-4 text-sm text-stone-900 font-medium">{order.stallName}</td>
                      <td className="px-6 py-4 text-sm font-bold text-stone-900">{order.total} RON</td>
                      <td className="px-6 py-4">
                         <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase
                            ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                              order.status === 'new_order' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                         `}>
                            {order.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <Link to={`/admin/orders/${order.id}`} className="text-fern hover:underline text-sm font-medium">
                            Vezi Tranzacția
                         </Link>
                      </td>
                   </tr>
                ))}
                {orders.length === 0 && (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-stone-500">Nu există comenzi.</td>
                    </tr>
                )}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
