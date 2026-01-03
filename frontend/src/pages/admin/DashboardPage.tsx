import { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Users, Store } from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalStalls: 0,
    pendingStalls: 0,
  });
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/admin/dashboard');
        setMetrics(res.data.metrics);
        setRevenueChartData(res.data.revenueChartData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-stone-500">Se încarcă datele...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-800">Panou de Control</h1>
        <p className="text-stone-500">Privire de ansamblu asupra platformei.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
             <div className="flex items-center justify-between mb-4">
                 <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <DollarSign className="h-6 w-6" />
                 </div>
             </div>
             <p className="text-stone-500 text-sm">Venituri Totale</p>
             <h3 className="text-2xl font-bold text-stone-800">{metrics.totalRevenue.toFixed(2)} RON</h3>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
             <div className="flex items-center justify-between mb-4">
                 <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <ShoppingBag className="h-6 w-6" />
                 </div>
             </div>
             <p className="text-stone-500 text-sm">Comenzi Totale</p>
             <h3 className="text-2xl font-bold text-stone-800">{metrics.totalOrders}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
             <div className="flex items-center justify-between mb-4">
                 <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <Users className="h-6 w-6" />
                 </div>
             </div>
             <p className="text-stone-500 text-sm">Utilizatori Înregistrați</p>
             <h3 className="text-2xl font-bold text-stone-800">{metrics.totalUsers}</h3>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
             <div className="flex items-center justify-between mb-4">
                 <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Store className="h-6 w-6" />
                 </div>
                 {metrics.pendingStalls > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                       {metrics.pendingStalls} de aprobat
                    </span>
                 )}
             </div>
             <p className="text-stone-500 text-sm">Tarabe Totale</p>
             <h3 className="text-2xl font-bold text-stone-800">{metrics.totalStalls}</h3>
          </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
         <h3 className="text-lg font-bold text-stone-800 mb-6">Evoluție Venituri Platformă (30 zile)</h3>
         <div className="h-96 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="revenue" name="Total Venit" stroke="#4f772d" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
}
