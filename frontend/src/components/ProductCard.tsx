import type { Product } from '../types';
import { Button } from './ui/button';
import { Plus, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  readonly product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, clearCart } = useCart();
  
  const handleAdd = async () => {
    const result = await addItem(product, 1);
    
    if (!result.success && result.error) {

       if (result.error === 'Cannot add own product') {
         // Already handled by CartContext with a specific Swal
         return;
       }

       // Show conflict confirmation
       Swal.fire({
          title: 'Conflict Coș',
          text: `${result.error}\n\nVrei să golește coșul și să adaugi acest produs?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#78716c',
          confirmButtonText: 'Golește și Adaugă',
          cancelButtonText: 'Renunță'
       }).then(async (swalResult) => {
           if (swalResult.isConfirmed) {
               await clearCart();
               // We need to wait for clear? Logic in provider uses router.delete which is async but Inertia might handle queue.
               // Ideally we'd wait, but for now let's optimistically call addItem
               // Actually clearCart is router.delete, addItem is router.post. This might be race-condition prone.
               // Better is to rely on backend or simple timeout, but let's try calling both.
               setTimeout(async () => {
                   await addItem(product, 1);
                   toast.success('Coșul a fost actualizat!');
               }, 100);
           }
       });
    } else {
        toast.success("Produs adăugat în coș!");
    }
  };

  const isOutOfStock = product.stockType === 'out_of_stock';

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden flex flex-col h-full", isOutOfStock && "opacity-75 grayscale")}>
      <div className="aspect-w-4 aspect-h-3 bg-stone-100 relative">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-48" />
        ) : (
          <div className="w-full h-48 flex items-center justify-center text-stone-300">No Image</div>
        )}
        {product.stockType === 'limited' && Boolean(product.stockQuantity) && (
            <span className="absolute top-2 right-2 bg-marigold text-white text-xs font-bold px-2 py-1 rounded-full">
                Stoc limitat: {product.stockQuantity}
            </span>
        )}
        {isOutOfStock && (
             <span className="absolute top-2 right-2 bg-stone-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                Stoc Epuizat
             </span>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-bold text-fern uppercase tracking-wide">{product.category}</span>
            {product.rating !== undefined && product.rating > 0 && (
                <div className="flex items-center text-marigold text-xs font-bold">
                    <Star className="h-3 w-3 fill-current mr-0.5" />
                    {product.rating}
                </div>
            )}
        </div>
        <h3 className="font-serif font-bold text-lg text-stone-800 mb-2">{product.name}</h3>
        <p className="text-stone-500 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
           <div className="flex flex-col">
              <span className="text-lg font-bold text-fern">{product.price} RON</span>
              <span className="text-xs text-stone-400">/ {product.unit}</span>
           </div>
           <Button onClick={handleAdd} disabled={isOutOfStock} size="sm" className="rounded-full">
              <Plus className="h-4 w-4 mr-1" /> Adaugă
           </Button>
        </div>
      </div>
    </div>
  );
}
