import { Link } from 'react-router-dom';
import { User, Store, ShoppingBag, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  provider: string;
  location: string;
  avatar_url: string;
  hasStall: boolean;
  ordersCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/admin/users');
        setUsers(res.data.users || []);
      } catch (error) {
        console.error(error);
        toast.error("Eroare la încărcarea utilizatorilor.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = (id: number) => {
    Swal.fire({
        title: 'Ștergere Utilizator',
        text: 'Sigur doriți să ștergeți acest utilizator? Această acțiune este ireversibilă și va șterge toate datele asociate (inclusiv comenzi și tarabe).',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#78716c',
        confirmButtonText: 'Da, șterge!',
        cancelButtonText: 'Anulează'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/admin/users/${id}`);
                setUsers(prev => prev.filter(u => u.id !== id));
                toast.success("Utilizator șters cu succes.");
            } catch (error) {
                console.error(error);
                toast.error("A apărut o eroare la ștergere.");
            }
        }
    });
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Se încarcă utilizatorii...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-800">Utilizatori</h1>
        <p className="text-stone-500">Vizualizează toți utilizatorii înregistrați.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="min-w-full divide-y divide-stone-100">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Utilizator</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Info</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Statistici</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Data Înregistrării</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-stone-900">{user.name}</div>
                      <div className="text-xs text-stone-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col text-xs text-stone-500 space-y-1">
                     <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" /> {user.location || '-'}
                     </span>
                     <span className="capitalize bg-stone-100 px-1.5 py-0.5 rounded w-fit">
                        {user.provider}
                     </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                   <div className="flex gap-4">
                      {user.hasStall && (
                         <div className="flex items-center text-fern font-medium" title="Are Tarabă">
                            <Store className="h-4 w-4 mr-1" /> Vânzător
                         </div>
                      )}
                      <div className="flex items-center text-blue-600" title="Comenzi Plasate">
                         <ShoppingBag className="h-4 w-4 mr-1" /> {user.ordersCount}
                      </div>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                   {new Date(user.created_at).toLocaleDateString('ro-RO')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/admin/users/${user.id}`} className="text-fern hover:text-fern-dark font-medium hover:underline mr-4">
                    Vezi Detalii
                  </Link>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="text-red-500 hover:text-red-700 font-medium hover:underline"
                  >
                    Șterge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
