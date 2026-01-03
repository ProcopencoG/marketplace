import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import Swal from 'sweetalert2';
import { Check, X, Trash2, Store, MapPin, Calendar, ExternalLink, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Stall {
  id: number;
  name: string;
  ownerName: string;
  ownerEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  location: string;
}

export default function AdminStallsPage() {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusFilter = searchParams.get('status');

  const fetchStalls = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/stalls', {
          params: { status: statusFilter }
      });
      setStalls(res.data.stalls || []);
    } catch (error) {
      console.error(error);
      toast.error("Eroare la încărcarea tarabelor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStalls();
  }, [statusFilter]);

  const handleApprove = (id: number) => {
    Swal.fire({
        title: 'Aprobare Tarabă',
        text: 'Aprobați această tarabă? va deveni vizibilă public.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4a7c59',
        cancelButtonColor: '#78716c',
        confirmButtonText: 'Da, aprobă!',
        cancelButtonText: 'Anulează'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.patch(`/api/admin/stalls/${id}/approve`);
                toast.success("Tarabă aprobată!");
                fetchStalls();
            } catch (error) {
                console.error(error);
                toast.error("Eroare la aprobare.");
            }
        }
    });
  };

  const handleReject = (id: number) => {
    Swal.fire({
        title: 'Respingere Tarabă',
        text: 'Respingeți această tarabă?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#78716c',
        confirmButtonText: 'Da, respinge!',
        cancelButtonText: 'Anulează'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.patch(`/api/admin/stalls/${id}/reject`);
                toast.success("Tarabă respinsă!");
                fetchStalls();
            } catch (error) {
                console.error(error);
                toast.error("Eroare la respingere.");
            }
        }
    });
  };
  
  const handleDelete = (id: number) => {
      Swal.fire({
        title: 'Ștergere Tarabă',
        text: 'Sigur doriți să ștergeți această tarabă? Această acțiune este ireversibilă.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#78716c',
        confirmButtonText: 'Da, șterge!',
        cancelButtonText: 'Anulează'
      }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/admin/stalls/${id}`);
                setStalls(prev => prev.filter(s => s.id !== id));
                toast.success("Tarabă ștearsă!");
            } catch (error) {
                console.error(error);
                toast.error("Eroare la ștergere.");
            }
        }
      });
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Se încarcă tarabele...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-serif font-bold text-stone-800">Administrare Tarabe</h1>
           <p className="text-stone-500">Aprobare și gestionare comercianți.</p>
        </div>
        <div className="space-x-2">
            <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} onClick={() => setSearchParams({ status: 'pending' })}>De Aprobat</Button>
            <Button variant={!statusFilter ? 'default' : 'outline'} onClick={() => setSearchParams({})}>Toate</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="min-w-full divide-y divide-stone-100">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Tarabă</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Proprietar</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Data Înscrierii</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-100">
            {stalls.map((stall) => (
              <tr key={stall.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400">
                      <Store className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-stone-900">{stall.name}</div>
                      <div className="text-xs text-stone-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" /> {stall.location}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-stone-900">{stall.ownerName}</div>
                  <div className="text-xs text-stone-500">{stall.ownerEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                    ${stall.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      stall.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}
                  `}>
                    {stall.status === 'approved' ? 'Aprobat' : stall.status === 'pending' ? 'În Așteptare' : 'Respins'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                   {new Date(stall.created_at).toLocaleDateString('ro-RO')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {stall.status === 'pending' && (
                        <>
                            <button onClick={() => handleApprove(stall.id)} className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-md" title="Aprobă">
                                <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleReject(stall.id)} className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md" title="Respinge">
                                <X className="h-4 w-4" />
                            </button>
                        </>
                    )}
                    <Link to={`/admin/stalls/${stall.id}`} className="text-stone-400 hover:text-fern p-1.5" title="Vezi Detalii Admin">
                        <Eye className="h-4 w-4" />
                    </Link>
                    <Link to={`/stalls/${stall.id}`} className="text-stone-400 hover:text-fern p-1.5" title="Vezi Public">
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(stall.id)} className="text-stone-400 hover:text-red-600 p-1.5" title="Șterge">
                        <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stalls.length === 0 && (
            <div className="p-12 text-center text-stone-500">Nu au fost găsite tarabe.</div>
        )}
      </div>
    </div>
  );
}
