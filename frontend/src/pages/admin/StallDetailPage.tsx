import { Link, useNavigate, useParams } from 'react-router-dom';
import { Store, User, MapPin, Calendar, DollarSign, ShoppingBag, Package, ArrowLeft, Trash2, Check, X, ExternalLink, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Product {
  id: number;
  name: string;
  price_cents: number;
  image_url: string | null;
  imageUrl?: string | null;
}

interface StallDetail {
    id: number;
    name: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    location: string;
    cover_url: string | null;
    logo_url: string | null;
    coverUrl?: string | null;
    logoUrl?: string | null;
    rating: number;
    reviews_count: number;
}

interface OwnerDetail {
    id: number;
    name: string;
    email: string;
    phone?: string;
}

interface StallStats {
    totalSales: number;
    ordersCount: number;
    productsCount: number;
}

export default function StallDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stall, setStall] = useState<StallDetail | null>(null);
  const [owner, setOwner] = useState<OwnerDetail | null>(null);
  const [stats, setStats] = useState<StallStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStallDetails = async () => {
    try {
        const res = await axios.get(`/api/admin/stalls/${id}`);
        setStall(res.data.stall);
        setOwner(res.data.owner);
        setStats(res.data.stats);
        setProducts(res.data.products);
    } catch (error) {
        console.error(error);
        toast.error("Nu s-au putut încărca detaliile tarabei.");
        navigate('/admin/stalls');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchStallDetails();
  }, [id]);
  
  const handleApprove = () => {
    if (!stall) return;
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
                await axios.patch(`/api/admin/stalls/${stall.id}/approve`);
                toast.success("Tarabă aprobată!");
                fetchStallDetails();
            } catch (error) { console.error(error); toast.error("Eroare la aprobare."); }
        }
    });
  };
    
  const handleReject = () => {
    if (!stall) return;
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
                await axios.patch(`/api/admin/stalls/${stall.id}/reject`);
                toast.success("Tarabă respinsă.");
                fetchStallDetails();
            } catch (error) { console.error(error); toast.error("Eroare la respingere."); }
        }
    });
  };
  
  const handleDelete = () => {
      if (!stall) return;
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
                await axios.delete(`/api/admin/stalls/${stall.id}`);
                toast.success("Tarabă ștearsă.");
                navigate('/admin/stalls');
            } catch (error) { console.error(error); toast.error("Eroare la ștergere."); }
        }
      });
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Se încarcă detaliile...</div>;
  if (!stall || !owner || !stats) return <div className="p-8 text-center text-stone-500">Taraba nu a fost găsită.</div>;

  return (
    <div className="space-y-8">
      <Link to="/admin/stalls" className="flex items-center text-stone-500 hover:text-stone-900 transition-colors">
         <ArrowLeft className="h-4 w-4 mr-2" /> Înapoi la Tarabe
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
         <div className="h-48 bg-stone-200 relative">
            {stall.coverUrl || stall.cover_url ? <img src={stall.coverUrl || stall.cover_url || ''} className="w-full h-full object-cover" /> : null}
            <div className="absolute -bottom-16 left-8">
               {stall.logoUrl || stall.logo_url ? (
                  <img src={stall.logoUrl || stall.logo_url || ''} className="w-32 h-32 rounded-xl border-4 border-white shadow-md object-cover" />
               ) : (
                  <div className="w-32 h-32 rounded-xl border-4 border-white shadow-md bg-stone-100 flex items-center justify-center">
                     <Store className="h-12 w-12 text-stone-300" />
                  </div>
               )}
            </div>
         </div>
         <div className="pt-20 px-8 pb-8">
            <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-3xl font-serif font-bold text-stone-800 flex items-center gap-3">
                     {stall.name}
                     <span className={`text-sm px-3 py-1 rounded-full uppercase font-bold tracking-wide
                        ${stall.status === 'approved' ? 'bg-green-100 text-green-700' : 
                          stall.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                     `}>
                        {stall.status === 'approved' ? 'Aprobat' : stall.status === 'pending' ? 'În Așteptare' : 'Respins'}
                     </span>
                  </h1>
                  <p className="text-stone-500 mt-2 max-w-2xl">{stall.description}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-stone-500">
                     <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {stall.location}</span>
                     <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> Creat pe {new Date(stall.created_at).toLocaleDateString('ro-RO')}</span>
                     {stall.rating > 0 && (
                        <span className="flex items-center text-fern font-bold"><Star className="h-4 w-4 mr-1 fill-current" /> {stall.rating} ({stall.reviews_count} recenzii)</span>
                     )}
                  </div>
               </div>
               
               <div className="flex flex-col gap-2">
                  {stall.status === 'pending' && (
                     <div className="flex gap-2">
                        <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white"><Check className="h-4 w-4 mr-2" /> Aprobă</Button>
                        <Button onClick={handleReject} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"><X className="h-4 w-4 mr-2" /> Respinge</Button>
                     </div>
                  )}
                  <div className="flex gap-2">
                     <Link to={`/stalls/${stall.id}`}>
                        <Button variant="outline"><ExternalLink className="h-4 w-4 mr-2" /> Vezi Public</Button>
                     </Link>
                     <Button onClick={handleDelete} variant="destructive"><Trash2 className="h-4 w-4 mr-2" /> Șterge Taraba</Button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Stats */}
         <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
               <h3 className="font-bold text-stone-800 mb-4">Statistici</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-stone-500 flex items-center"><DollarSign className="h-4 w-4 mr-2" /> Vânzări Totale</span>
                     <span className="font-bold text-stone-900">{stats.totalSales.toFixed(2)} RON</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-stone-500 flex items-center"><ShoppingBag className="h-4 w-4 mr-2" /> Comenzi</span>
                     <span className="font-bold text-stone-900">{stats.ordersCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-stone-500 flex items-center"><Package className="h-4 w-4 mr-2" /> Produse</span>
                     <span className="font-bold text-stone-900">{stats.productsCount}</span>
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
               <h3 className="font-bold text-stone-800 mb-4">Proprietar</h3>
               <div className="flex items-center mb-4">
                  <div className="bg-stone-100 p-3 rounded-full mr-3">
                     <User className="h-6 w-6 text-stone-400" />
                  </div>
                  <div>
                     <p className="font-bold text-stone-900">{owner.name}</p>
                     <Link to={`/admin/users/${owner.id}`} className="text-xs text-fern hover:underline">Vezi Profil</Link>
                  </div>
               </div>
               <div className="space-y-2 text-sm text-stone-500">
                  <p>Email: <span className="text-stone-800">{owner.email}</span></p>
                  {owner.phone && <p>Telefon: <span className="text-stone-800">{owner.phone}</span></p>}
               </div>
            </div>
         </div>

         {/* Products Preview */}
         <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
               <h3 className="font-bold text-stone-800 mb-4">Toate Produsele ({products.length})</h3>
               {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {products.map(product => (
                        <div key={product.id} className="flex items-center p-3 border border-stone-100 rounded-lg hover:bg-stone-50 transition-colors">
                           {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="h-12 w-12 rounded object-cover flex-shrink-0 bg-stone-100" />
                           ) : (
                              <div className="h-12 w-12 bg-stone-200 rounded flex-shrink-0 flex items-center justify-center text-stone-400 font-bold text-xs">IMG</div>
                           )}
                           <div className="ml-3 overflow-hidden">
                              <p className="font-medium text-stone-900 truncate" title={product.name}>{product.name}</p>
                              <p className="text-sm text-stone-500">{(product.price_cents / 100).toFixed(2)} RON</p>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <p className="text-stone-500 italic">Această tarabă nu are produse încă.</p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
