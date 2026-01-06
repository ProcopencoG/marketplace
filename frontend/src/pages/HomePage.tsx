import { Link, useSearchParams } from 'react-router-dom';
import { Star, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Carousel } from '../components/Carousel';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Stall } from '../types';

const CITIES = [
  'Cluj-Napoca', 'București', 'Timișoara', 'Iași', 'Constanța', 
  'Craiova', 'Brașov', 'Galați', 'Oradea', 'Ploiești', 'Sibiu'
];

export default function HomePage() {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  useEffect(() => {
    const fetchStalls = async () => {
      try {
        let url = '/api/stalls';
        if (searchTerm) {
             url = `/api/stalls/search?query=${encodeURIComponent(searchTerm)}`;
        } else if (location) {
             url = `/api/stalls/location/${encodeURIComponent(location)}`;
        }
        
        const res = await axios.get(url);
        let data = res.data;

        // Client-side filtering intersection if needed (API limitation workaround)
        if (searchTerm && location) {
             data = data.filter((s: Stall) => s.location === location);
        }

        setStalls(data);
      } catch (error) {
        console.error("Failed to fetch stalls:", error);
      }
    };

    const timer = setTimeout(fetchStalls, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, location]);

  const handleSearch = () => {
    setSearchParams(prev => {
        const n = new URLSearchParams(prev);
        if (searchTerm) n.set('search', searchTerm); else n.delete('search');
        if (location) n.set('location', location); else n.delete('location');
        return n;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
        <Carousel />
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-12 bg-white p-6 rounded-xl shadow-sm border border-stone-100">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Caută tarabe..." 
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-fern bg-stone-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <select 
          className="md:w-64 px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-fern bg-stone-50"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">Toată țara</option>
          {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
        </select>
        <Button onClick={handleSearch} size="lg" className="px-8">Caută</Button>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif font-bold text-stone-800">Tarabe</h2>
        <span className="text-stone-500 text-sm">{stalls.length} tarabe găsite</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stalls.map(stall => (
          <Link key={stall.id} to={`/stalls/${stall.id}`} className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-stone-100">
            <div className="aspect-w-16 aspect-h-9 h-48 bg-stone-200 relative overflow-hidden">
               <img src={stall.coverUrl || 'https://placehold.co/600x400?text=Cover'} alt={stall.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute top-4 left-4">
                 <img src={stall.logoUrl || 'https://placehold.co/100x100?text=Logo'} alt={stall.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
               </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-serif font-bold text-stone-900 group-hover:text-fern transition-colors">
                    {stall.name}
                  </h3>
                  {stall.rating > 0 && (
                     <div className="flex items-center bg-stone-100 px-2 py-1 rounded">
                       <Star className="h-3 w-3 text-fern fill-current" />
                       <span className="ml-1 text-xs font-medium text-stone-600">{stall.rating}</span>
                     </div>
                  )}
                </div>
                
                <p className="mt-2 text-sm text-stone-500 line-clamp-2 min-h-[40px]">
                  {stall.description}
                </p>

                <div className="mt-4 flex items-center text-stone-400 text-sm">
                 <span className="mr-2">📍</span> {stall.location}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
