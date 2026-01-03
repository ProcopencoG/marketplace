import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { Trash2, Shield, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  isOwner: boolean;
  createdAt: string;
}

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
        const res = await axios.get('/api/admin/admins');
        setAdmins(res.data.admins || []);
    } catch (error) {
        console.error(error);
        toast.error("Eroare la încărcarea administratorilor.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;

    try {
        await axios.post('/api/admin/admins', { email: newAdminEmail });
        setNewAdminEmail('');
        toast.success("Admin adăugat cu succes!");
        fetchAdmins();
    } catch (error) {
        console.error(error);
        toast.error("Nu s-a putut adăuga adminul. Verifică email-ul.");
    }
  };

  const handleRemoveAdmin = async (id: number) => {
    if (confirm('Ești sigur că vrei să revoci drepturile de admin pentru acest utilizator?')) {
      try {
          await axios.delete(`/api/admin/admins/${id}`);
          toast.success("Drepturi revocate.");
          setAdmins(prev => prev.filter(a => a.id !== id));
      } catch (error) {
          console.error(error);
          toast.error("Eroare la revocarare.");
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Se încarcă administratorii...</div>;

  return (
    <>
      <Helmet>
        <title>Gestionare Admini</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-stone-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-fern" /> Gestionare Administratori
          </h1>
          <p className="text-stone-600 mt-1">
            Adaugă sau elimină accesul de administrator. Doar tu (Owner) poți vedea această pagină.
          </p>
        </div>

        {/* Add Admin Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 mb-8">
            <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Adaugă Admin Nou
            </h2>
            <form onSubmit={handleAddAdmin} className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email Utilizator</label>
                    <input 
                        type="email" 
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="ex: utilizator@gmail.com"
                        className="w-full rounded-md border-stone-300 shadow-sm focus:border-fern focus:ring-fern"
                        required
                    />
                    <p className="text-xs text-stone-500 mt-1">Utilizatorul trebuie să fie deja înregistrat în platformă.</p>
                </div>
                <Button type="submit" className="bg-fern hover:bg-fern/90 text-white mb-[2px]">
                    Ofere Acces Admin
                </Button>
            </form>
        </div>

        {/* Admins List */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
                <h3 className="font-bold text-stone-800">Administratori Activi ({admins.length})</h3>
            </div>
            
            <div className="divide-y divide-stone-100">
                {admins.map((admin) => (
                    <div key={admin.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <img 
                                src={admin.avatar || `https://ui-avatars.com/api/?name=${admin.name}&background=random`} 
                                alt={admin.name}
                                className="w-10 h-10 rounded-full object-cover border border-stone-200" 
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-stone-800">{admin.name}</span>
                                    {admin.isOwner && (
                                        <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Owner</span>
                                    )}
                                    {currentUser && admin.id === currentUser.id && (
                                        <span className="bg-stone-100 text-stone-600 text-[10px] px-2 py-0.5 rounded-full">Tu</span>
                                    )}
                                </div>
                                <div className="text-sm text-stone-500">{admin.email}</div>
                            </div>
                        </div>

                        {!admin.isOwner && (
                            <button 
                                onClick={() => handleRemoveAdmin(admin.id)}
                                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                title="Revocă acces admin"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </>
  );
}
