import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/Modal';
import { ProductForm } from '../components/ProductForm';
import { StallForm } from '../components/StallForm';
import { Plus, Edit, Trash2, Package, Eye, Settings, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../stores/useAuthStore';

interface DashboardData {
  stall: any;
  products: any[];
  metrics: {
    totalSales: number;
    ordersCount: number;
    avgOrderValue: number;
  };
  chartData: any[];
  recentOrders: any[];
}

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'settings'>('overview');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStallModalOpen, setIsStallModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const fetchDashboard = async () => {
      try {
          const res = await axios.get('/api/seller/dashboard');
          setData(res.data);
      } catch (error) {
          console.error("Error fetching dashboard", error);
          // If 401/403 maybe redirect?
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    if (!isAuthenticated) {
        navigate('/');
        return;
    }
    fetchDashboard();
  }, [isAuthenticated, navigate]);

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
    Swal.fire({
      title: 'Ești sigur?',
      text: "Nu vei putea recupera acest produs odată șters!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b7472a', // Terracotta
      cancelButtonColor: '#78716c', // Stone-500
      confirmButtonText: 'Da, șterge-l!',
      cancelButtonText: 'Anulează'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            await axios.delete(`/api/seller/products/${productId}`);
            Swal.fire('Șters!', 'Produsul a fost șters cu succes.', 'success');
            fetchDashboard(); // Refresh data
        } catch (error) {
            console.error(error);
            toast.error("Eroare la ștergerea produsului.");
        }
      }
    })
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Se încarcă panoul de control...</div>;
  if (!data) return <div className="p-8 text-center text-stone-500">Nu s-au putut încărca datele.</div>;

  const { stall, products, metrics, chartData, recentOrders } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-800">{stall.name}</h1>
          <p className="text-stone-500">Panou de Control</p>
        </div>
        <div className="flex gap-2">
            <button
               className="inline-flex items-center px-4 py-2 border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none"
               onClick={() => navigate(`/stalls/${stall.id}`)}
            >
               <Eye className="h-4 w-4 mr-2" /> Vezi Taraba
            </button>
            <Button className="bg-fern text-white" onClick={openAddModal}>
               <Plus className="h-4 w-4 mr-2" /> Adaugă Produs
            </Button>
        </div>
      </div>

      {/* Status Banner */}
      {stall.status === 'pending' && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-amber-800">
            <div className="bg-amber-100 p-1.5 rounded-full flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                <h3 className="font-bold text-sm mb-1">Taraba este în așteptare</h3>
                <p className="text-sm text-amber-700/80 leading-relaxed">
                    Contul tău urmează să fie verificat de un administrator. Între timp poți configura magazinul și adăuga produse, dar acesta nu va fi vizibil public până la aprobare.
                </p>
            </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-stone-100 p-1 rounded-lg w-fit">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white shadow text-fern' : 'text-stone-600 hover:text-stone-900'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-white shadow text-fern' : 'text-stone-600 hover:text-stone-900'}`}
          >
            Produse ({products.length})
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-white shadow text-fern' : 'text-stone-600 hover:text-stone-900'}`}
          >
            Setări Tarabă
          </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12% vs luna trecută</span>
                    </div>
                    <p className="text-stone-500 text-sm">Vânzări Totale</p>
                    <h3 className="text-2xl font-bold text-stone-800">{metrics.totalSales} RON</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <ShoppingBag className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-stone-500 text-sm">Comenzi Totale</p>
                    <h3 className="text-2xl font-bold text-stone-800">{metrics.ordersCount}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-stone-500 text-sm">Valoare Medie Comandă</p>
                    <h3 className="text-2xl font-bold text-stone-800">{metrics.avgOrderValue} RON</h3>
                </div>
            </div>

            {/* Charts & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                    <h3 className="text-lg font-bold text-stone-800 mb-6">Evoluție Venituri (30 zile)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f772d" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#4f772d" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    itemStyle={{color: '#4f772d', fontWeight: 'bold'}}
                                />
                                <Area type="monotone" dataKey="sales" name="Total Venit" stroke="#4f772d" fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-stone-800">Comenzi Recente</h3>
                        <Link to="/seller/orders" className="text-sm text-fern hover:underline">Vezi tot</Link>
                    </div>
                    <div className="space-y-4">
                        {recentOrders.length > 0 ? recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors">
                                <div>
                                    <p className="font-medium text-stone-800">{order.buyerName}</p>
                                    <p className="text-xs text-stone-500">{order.date} • #{order.id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-stone-800">{order.total} RON</p>
                                    <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold block mb-1
                                        ${order.status === 'new_order' ? 'bg-blue-100 text-blue-700' : 
                                          order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700' :
                                          order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                    `}>
                                        {order.status === 'new_order' ? 'Nouă' : order.status}
                                    </span>
                                    <Link to={`/seller/orders/${order.id}`} className="text-xs text-fern hover:underline font-medium">
                                      Vezi Detalii
                                    </Link>
                                </div>
                            </div>
                        )) : (
                            <p className="text-stone-500 text-center py-4">Nu ai comenzi recente.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'products' && (
         <div className="grid grid-cols-1 gap-6">
             <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                   <h2 className="text-xl font-bold font-serif flex items-center">
                     <Package className="h-5 w-5 mr-2 text-fern" /> Produsele Tale
                   </h2>
                   <span className="text-sm text-stone-500">{products.length} produse</span>
                </div>
                
                <div className="divide-y divide-stone-100">
                   {products.length > 0 ? (
                     products.map(product => (
                       <div key={product.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                         <div className="flex items-center gap-4">
                            {product.imageUrl ? (
                               <img src={product.imageUrl} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
                            ) : (
                               <div className="h-16 w-16 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                                  <Package className="h-8 w-8" />
                               </div>
                            )}
                            <div>
                               <h3 className="font-bold text-stone-800">{product.name}</h3>
                               <p className="text-sm text-stone-500">{product.price} RON / {product.unit}</p>
                               <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                 product.stockType === 'in_stock' ? 'bg-green-100 text-green-700' :
                                 product.stockType === 'limited' ? 'bg-orange-100 text-orange-700' :
                                 'bg-blue-100 text-blue-700'
                               }`}>
                                 {product.stockType.replace('_', ' ')}
                               </span>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button
                               className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors"
                               onClick={() => handleEditProduct(product)}
                            >
                               <Edit className="h-4 w-4" />
                            </button>
                            <button
                               className="p-2 hover:bg-stone-100 rounded-lg text-red-500 transition-colors"
                               onClick={() => handleDeleteProduct(product.id)}
                            >
                               <Trash2 className="h-4 w-4" />
                            </button>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="p-12 text-center text-stone-500">
                        Nu ai încă produse adăugate.
                     </div>
                   )}
                </div>
             </div>
         </div>
      )}

      {activeTab === 'settings' && (
         <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8">
               <div className="text-center mb-6">
                 {stall.logoUrl && <img src={stall.logoUrl} alt="Logo" className="w-32 h-32 rounded-xl mx-auto mb-4 border border-stone-100 object-cover" />}
                 <h2 className="text-2xl font-bold font-serif">{stall.name}</h2>
                 <p className="text-stone-500">{stall.location}</p>
               </div>
               
               <div className="space-y-6">
                  <div>
                     <label className="text-xs uppercase font-bold text-stone-400 block mb-2">Descriere</label>
                     <p className="p-4 bg-stone-50 rounded-lg text-stone-700">{stall.description}</p>
                  </div>
                  
                  <Button className="w-full" onClick={() => setIsStallModalOpen(true)}>
                      <Settings className="h-4 w-4 mr-2" /> Editează Profilul Tarabei
                  </Button>
               </div>
            </div>
         </div>
      )}

      {/* Modals */}
      <Modal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        title={editingProduct ? 'Editează Produs' : 'Adaugă Produs Nou'}
      >
        <ProductForm 
          product={editingProduct} 
          stallId={stall.id} 
          onClose={() => {
              setIsProductModalOpen(false);
              fetchDashboard(); // Refresh after edit/add
          }} 
        />
      </Modal>

      <Modal 
        isOpen={isStallModalOpen} 
        onClose={() => setIsStallModalOpen(false)} 
        title="Editează Profil Tarabă"
      >
        <StallForm 
          stall={stall} 
          onClose={() => {
              setIsStallModalOpen(false);
              fetchDashboard(); // Refresh
          }} 
        />
      </Modal>
    </div>
  );
}
