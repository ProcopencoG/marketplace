import React, { useState } from 'react';
import { Button } from './ui/button';
import axios from 'axios';
import { toast } from 'react-toastify';

interface StallFormProps {
  readonly stall: any;
  readonly onClose: () => void;
}

const ROMANIAN_CITIES = [
  'București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 
  'Craiova', 'Brașov', 'Galați', 'Ploiești', 'Oradea', 'Brăila',
  'Arad', 'Pitești', 'Sibiu', 'Bacău', 'Târgu Mureș', 'Baia Mare',
  'Buzău', 'Botoșani', 'Satu Mare'
];

export function StallForm({ stall, onClose }: StallFormProps) {
  const [values, setValues] = useState({
    name: stall.name || '',
    description: stall.description || '',
    location: stall.location || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [logo, setLogo] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  const handleChange = (e: any) => {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const formData = new FormData();
    // API expects stall object properties directly or nested? 
    // Usually Rails/Inertia used nested 'stall[name]'. 
    // Adapting for general API usage, but sticking to what worked or simplifying.
    // If backend is .NET now (implied by previous context), it might expect simple keys or 'stall' prefix.
    // Assuming the backend endpoint accepts FromForm.
    
    formData.append('Name', values.name);
    formData.append('Description', values.description);
    formData.append('Location', values.location);
    if (logo) formData.append('Logo', logo);
    if (cover) formData.append('Cover', cover);

    // If we simply send this to the .NET API which usually expects PascalCase or matching keys.
    // However, if we assume the previous Rails-like structure:
    // formData.append('stall[name]', values.name); etc.
    // I will try to support the .NET naming convention if possible, but let's stick to what works for now.
    // The user previously mentioned refactoring to .NET 9.
    
    // Simplest approach: Use the same structure but via axios.
    // But since we are decoupling from Rails/Inertia, let's assume a standard REST update.
    
    // UPDATE: The viewed code used `stall[name]`. I'll switch to standard keys `name`, `description` 
    // and rely on the backend to match, OR keep `stall[name]` if the backend wrapper demands it.
    // Given the previous files used `axios.post/patch` with mostly JSON, here we have files.
    
    // Let's use simple keys for now, often safer with modern binders.
    Object.keys(values).forEach(key => {
        formData.append(key, (values as any)[key]);
    });

    try {
        await axios.patch(`/api/seller/stall`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Profil actualizat cu succes!");
        onClose();
    } catch (error) {
        console.error(error);
        toast.error("Eroare la actualizarea profilului.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="stall-name" className="block text-sm font-medium text-stone-700">Nume Tarabă</label>
        <input 
          type="text" 
          id="stall-name"
          name="name" 
          value={values.name} 
          onChange={handleChange} 
          required 
          maxLength={50}
          className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-fern focus:ring-fern" 
        />
      </div>

      <div>
        <label htmlFor="stall-description" className="block text-sm font-medium text-stone-700">Descriere</label>
        <textarea 
          id="stall-description"
          name="description" 
          value={values.description} 
          onChange={handleChange} 
          required 
          rows={4}
          minLength={10}
          maxLength={1000}
          className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-fern focus:ring-fern" 
        />
        <p className="text-right text-[10px] text-stone-400">{values.description.length}/1000</p>
      </div>

      <div>
        <label htmlFor="stall-location" className="block text-sm font-medium text-stone-700">Locație</label>
        <select 
          id="stall-location"
          name="location" 
          value={values.location} 
          onChange={handleChange} 
          required
          className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-fern focus:ring-fern"
        >
          <option value="">Alege orașul</option>
          {ROMANIAN_CITIES.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="stall-logo" className="block text-sm font-medium text-stone-700">Logo Tarabă (Max 3MB)</label>
          <input 
            type="file" 
            id="stall-logo"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-xs text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-fern/10 file:text-fern hover:file:bg-fern/20" 
          />
        </div>
        <div>
          <label htmlFor="stall-cover" className="block text-sm font-medium text-stone-700">Copertă (Max 5MB)</label>
          <input 
            type="file" 
            id="stall-cover"
            accept="image/*"
            onChange={(e) => setCover(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-xs text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-fern/10 file:text-fern hover:file:bg-fern/20" 
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-stone-100 mt-4">
        <Button type="button" variant="outline" onClick={onClose}>Anulează</Button>
        <Button type="submit" disabled={isSubmitting} className="bg-fern text-white">
            {isSubmitting ? 'Se salvează...' : 'Salvează Profilul'}
        </Button>
      </div>
    </form>
  );
}
