import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/ProductCard';
import { MapPin, Star } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { cn } from '../lib/utils';
import { ProductSkeleton } from '../components/ProductSkeleton';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StallPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchTerm = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  
  // Fetcher function
  const fetchStallData = async () => {
       const res = await axios.get(`/api/stalls/${id}`, {
           params: {
               search: searchTerm,
               category: selectedCategory
           }
       });
       return res.data; // Expected { stall, products }
  };

  const { data, isLoading: loading, isError } = useQuery({
      queryKey: ['stall', id, searchTerm, selectedCategory],
      queryFn: fetchStallData,
      enabled: !!id
  });

  const stall = data?.stall || null;
  const products = data?.products || [];

  if (isError) {
      console.error("Failed to load stall");
  }

  const handleSearch = (term: string, category: string) => {
      setSearchParams(prev => {
          if(term) prev.set('search', term);
          else prev.delete('search');
          
          if(category && category !== 'All') prev.set('category', category);
          else prev.delete('category');
          
          return prev;
      });
  };
  
  // Handlers
  const onSearchChange = (e: any) => {
      const term = e.target.value;
      // For immediate typing effect we might need local state, but for now 
      // let's just use local state for input and update params on Enter or Blur or Debounce?
      // Since the original code had 'handleSearch' on change (commented out debounce),
      // let's stick to updating a local state and pushing to URL on enter/button.
  };
  
  // Actually, to make the input controlled, we need local state that syncs with URL
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
      setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const onLocalSearchChange = (e: any) => setLocalSearchTerm(e.target.value);
  
  const onCategoryChange = (e: any) => {
      const cat = e.target.value;
      handleSearch(localSearchTerm, cat);
  };
  
  const onSearchSubmit = (e: any) => {
      if(e.key === 'Enter') handleSearch(localSearchTerm, selectedCategory);
  }

  // Categories list
  const categories: string[] = ['Ouă', 'Lactate', 'Carne', 'Legume', 'Fructe', 'Conserve', 'Afumături', 'Meșteșuguri', 'Altele'];

  if (loading && !stall) {
      return <div className="p-8 text-center">Se încarcă taraba...</div>;
  }

  if (!stall) {
    return <div className="p-8 text-center">Tarabă inexistentă</div>;
  }



   return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Modal 
        isOpen={isRatingModalOpen} 
        onClose={() => setIsRatingModalOpen(false)} 
        title={`Recenzii ${stall.name}`}
      >
        <div className="space-y-6">
          {stall.reviews && stall.reviews.length > 0 ? (
            stall.reviews.map((r: any) => (
              <div key={r.id} className="border-b border-stone-100 pb-6 mb-6 last:border-0 last:mb-0 last:pb-0 relative">
                
                {/* Top Right: Stars */}
                <div className="absolute top-0 right-0 flex items-center text-marigold gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("h-4 w-4 fill-current", i >= r.rating && "opacity-20")} />
                    ))}
                </div>

                {/* Left: Content */}
                <div className="pr-24 pt-1">
                    {r.comment ? (
                        <div className="text-lg text-stone-700">
                             <span className="font-serif italic">"{r.comment}"</span>
                             {r.productName && (
                                <span className="text-sm font-bold text-stone-400 ml-2 uppercase tracking-wide">
                                    - {r.productName}
                                </span>
                             )}
                        </div>
                    ) : (
                        r.productName && (
                            <div className="text-sm font-bold text-stone-400 uppercase tracking-wide mt-1">
                                {r.productName}
                            </div>
                        )
                    )}
                </div>

                {/* Bottom Right: Name & Date */}
                <div className="flex justify-end mt-3">
                  <div className="text-xs text-stone-400 flex items-center bg-stone-50 px-2 py-1 rounded-full">
                    <span className="font-bold text-stone-600">
                        {(() => {
                            const parts = r.buyerName.split(' ');
                            return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : r.buyerName;
                        })()}
                    </span>
                    <span className="mx-1.5">•</span>
                    <span>{new Date(r.date).toLocaleDateString('ro-RO')}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-stone-500 py-8">Nicio recenzie încă.</p>
          )}
        </div>
      </Modal>

      {/* Hero Section */}
      <div className="h-64 md:h-80 bg-stone-300 relative">
         <img src={stall.coverUrl} alt={stall.name} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent"></div>
         
         <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
            <div className="max-w-7xl mx-auto flex items-end">
               <img src={stall.logoUrl} alt={stall.name} className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 border-white shadow-lg bg-white object-cover -mb-12 mr-6" />
               <div className="mb-2 text-white">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{stall.name}</h1>
                  <div className="flex items-center space-x-4 text-sm md:text-base">
                      <div className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-marigold" /> {stall.location}</div>
                      <button 
                        onClick={() => setIsRatingModalOpen(true)}
                        className="flex items-center hover:bg-white/20 px-2 py-1 rounded transition-colors"
                      >
                        <Star className="h-4 w-4 mr-1 text-marigold fill-current" /> {stall.rating} ({stall.reviewsCount})
                      </button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-stone-100">
              <h2 className="text-xl font-bold font-serif mb-2 text-stone-800">Despre noi</h2>
              <p className="text-stone-600 leading-relaxed">{stall.description}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-16 bg-stone-50/95 backdrop-blur py-4 z-10 border-b border-stone-200">
             <input 
               type="text" 
               placeholder="Caută produse..." 
               className="flex-grow px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-fern"
               value={localSearchTerm}
               onChange={onLocalSearchChange}
               onKeyDown={onSearchSubmit}
             />
             <select 
               className="px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-fern"
               value={selectedCategory}
               onChange={onCategoryChange}
             >
                <option value="All">Toate Categoriile</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             <Button onClick={() => handleSearch(localSearchTerm, selectedCategory)}>Caută</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                  [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
              ) : (
                <>
                  {products.map(product => (
                      <ProductCard key={product.id} product={product} />
                  ))}
                  
                  {products.length === 0 && (
                      <div className="col-span-full text-center py-12 text-stone-500">
                          Nu am găsit produse care să corespundă criteriilor.
                      </div>
                  )}
                </>
              )}
          </div>
      </div>
    </div>
  );
}
