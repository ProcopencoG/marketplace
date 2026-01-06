import React, { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'react-toastify';
import axios from 'axios';

interface ProductFormProps {
  readonly product?: any;
  readonly onClose: () => void;
  readonly stallId: number | string;
}

export function ProductForm({ product, onClose, stallId }: ProductFormProps) {
  const [values, setValues] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    unit: product?.unit || 'kg',
    category: product?.category || 'Legume',
    stockType: product?.stockType || 'in_stock',
    stockQuantity: product?.stockQuantity || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (e: any) => {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Use FormData for image upload
    const formData = new FormData();
    Object.keys(values).forEach(key => {
      formData.append(key, (values as any)[key]);
    });
    if (image) formData.append('image', image);
    formData.append('stallId', String(stallId));

    try {
        if (product) {
           await axios.put(`/api/seller/products/${product.id}`, formData, {
               headers: { 'Content-Type': 'multipart/form-data' }
           });
           toast.success("Produs actualizat cu succes!");
        } else {
           await axios.post('/api/seller/products', formData, {
               headers: { 'Content-Type': 'multipart/form-data' }
           });
           toast.success("Produs adăugat cu succes!");
        }
        onClose();
    } catch (error) {
        console.error(error);
        toast.error("Eroare la salvarea produsului.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const categories = ['Ouă', 'Lactate', 'Carne', 'Legume', 'Fructe', 'Conserve', 'Afumături', 'Meșteșuguri', 'Altele'];
  const units = ['kg', 'bucată', '100g', 'borcan', 'litru'];
  const stockTypes = [
    { value: 'in_stock', label: 'În stoc disponibil' },
    { value: 'limited', label: 'Stoc limitat' },
    { value: 'one_piece', label: 'O bucată' },
    { value: 'out_of_stock', label: 'Stoc epuizat' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="product-name" className="block text-sm font-medium text-stone-700">Nume Produs</label>
          <input type="text" id="product-name" name="name" value={values.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-fern focus:ring-fern" />
        </div>
        <div>
          <label htmlFor="product-category" className="block text-sm font-medium text-stone-700">Categorie</label>
          <select id="product-category" name="category" value={values.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-fern focus:ring-fern">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="product-description" className="block text-sm font-medium text-stone-700">Descriere</label>
        <textarea id="product-description" name="description" value={values.description} onChange={handleChange} required rows={3} className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-fern focus:ring-fern" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="product-price" className="block text-sm font-medium text-stone-700">Preț (RON)</label>
          <input type="number" step="0.01" id="product-price" name="price" value={values.price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-fern focus:ring-fern" />
        </div>
        <div>
          <label htmlFor="product-unit" className="block text-sm font-medium text-stone-700">Unitate</label>
          <select id="product-unit" name="unit" value={values.unit} onChange={handleChange} className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-fern focus:ring-fern">
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
           <label htmlFor="product-stockType" className="block text-sm font-medium text-stone-700">Stoc</label>
           <select id="product-stockType" name="stockType" value={values.stockType} onChange={handleChange} className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-fern focus:ring-fern">
             {stockTypes.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
           </select>
        </div>
      </div>

      {values.stockType === 'limited' && (
        <div>
           <label htmlFor="product-stockQuantity" className="block text-sm font-medium text-stone-700">Cantitate în Stoc</label>
           <input type="number" id="product-stockQuantity" name="stockQuantity" value={values.stockQuantity} onChange={handleChange} required className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-fern focus:ring-fern" />
        </div>
      )}

      <div>
        <label htmlFor="product-image" className="block text-sm font-medium text-stone-700">Imagine Produs</label>
        <input type="file" id="product-image" onChange={(e) => setImage(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fern/10 file:text-fern hover:file:bg-fern/20" />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Anulează</Button>
        <Button type="submit" disabled={isSubmitting} className="bg-fern text-white">{product ? 'Salvează Modificările' : 'Adaugă Produs'}</Button>
      </div>
    </form>
  );
}
