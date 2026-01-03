import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Store, MapPin, AlignLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/useAuthStore';

export default function CreateStallPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [data, setData] = useState({
    name: '',
    description: '',
    location: '',
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleChange = (key: string, value: string) => {
      setData(prev => ({ ...prev, [key]: value }));
      if (errors[key]) {
          setErrors((prev: any) => ({ ...prev, [key]: null }));
      }
  };

  React.useEffect(() => {
    const checkExistingStall = async () => {
      if (isAuthenticated) {
        try {
          // If this succeeds, they already have a stall
          await axios.get('/api/seller/dashboard');
          navigate('/seller/dashboard');
        } catch (err: any) {
          // If 404, it means they don't have a stall yet, which is fine
          if (err.response?.status !== 404) {
            console.error("Error checking stall status:", err);
          }
        }
      }
    };
    checkExistingStall();
  }, [isAuthenticated, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return;
    
    if (!isAuthenticated || !user) {
        toast.error("Trebuie să fii autentificat pentru a crea o tarabă.");
        return;
    }

    setProcessing(true);
    setErrors({});

    console.log("Current Auth State:", { user, isAuthenticated });
    console.log("User properties:", user ? Object.keys(user) : 'no user');
    if (user) {
        console.log("user.id value:", (user as any).id, "type:", typeof (user as any).id);
        console.log("user.Id value:", (user as any).Id, "type:", typeof (user as any).Id);
    }

    // backend might return 'id' or 'Id' if policy isn't perfectly applied
    const rawId = (user as any)?.id ?? (user as any)?.Id;
    const userId = typeof rawId === 'string' ? parseInt(rawId) : rawId;

    const payload = {
        ...data,
        userId: userId || 0
    };

    console.log("Sending Create Stall Payload (Final):", payload);

    try {
        await axios.post('/api/stalls', payload);
        toast.success("Taraba a fost creată cu succes!");
        
        // Update user state locally to reflect they now have a stall
        if (user) {
            useAuthStore.getState().updateUser({ ...user, hasStall: true });
        }
        
        navigate('/seller/dashboard');
    } catch (error: any) {
        console.error("Create Stall Error:", error);
        if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
            // Optionally log descriptive validation errors
            Object.entries(error.response.data.errors).forEach(([field, msgs]: any) => {
                console.error(`Validation error on ${field}:`, msgs.join(', '));
            });
        } else if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error("A apărut o eroare la crearea tarabei.");
        }
    } finally {
        setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Crează Tarabă - Piața Online</title>
      </Helmet>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="bg-fern/10 p-8 border-b border-stone-100">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-fern/20 mx-auto mb-4">
              <Store className="h-8 w-8 text-fern" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-center text-stone-900">
              Crează Propria Ta Tarabă
            </h2>
            <p className="mt-2 text-center text-stone-600">
              Alătură-te comunității noastre de producători locali și începe să vinzi produsele tale proaspete.
            </p>
          </div>

          <form onSubmit={submit} className="p-8 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
                Numele Tarabei
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Store className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-stone-300 focus:ring-fern focus:border-fern'} rounded-md text-sm shadow-sm transition-colors`}
                  placeholder="Ex: Legume Proaspete de la Buni"
                  required
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> {errors.name}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-stone-700 mb-1">
                Locația (Oraș/Sat)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  id="location"
                  value={data.location}
                  onChange={e => handleChange('location', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.location ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-stone-300 focus:ring-fern focus:border-fern'} rounded-md text-sm shadow-sm transition-colors`}
                  placeholder="Ex: Iași, Comuna Miroslava"
                  required
                />
              </div>
              {errors.location && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> {errors.location}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-1">
                Descriere
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <AlignLeft className="h-5 w-5 text-stone-400" />
                </div>
                <textarea
                  id="description"
                  rows={4}
                  value={data.description}
                  onChange={e => handleChange('description', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-stone-300 focus:ring-fern focus:border-fern'} rounded-md text-sm shadow-sm transition-colors`}
                  placeholder="Spune-ne povestea ta și ce produse vinzi..."
                  required
                />
              </div>
              {errors.description && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> {errors.description}</p>}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Link to="/" className="text-sm font-medium text-stone-600 hover:text-stone-900">
                Renunță
              </Link>
              <Button type="submit" disabled={processing} className="bg-fern hover:bg-fern/90 text-white min-w-[200px]">
                {processing ? 'Se creează...' : 'Crează Taraba'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
