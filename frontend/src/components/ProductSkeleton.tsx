import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden flex flex-col h-full animate-pulse">
      <div className="w-full h-48 bg-stone-200" />
      <div className="p-4 flex-grow flex flex-col gap-3">
        <div className="h-3 w-16 bg-stone-200 rounded" />
        <div className="h-6 w-3/4 bg-stone-200 rounded" />
        <div className="h-4 w-full bg-stone-100 rounded" />
        <div className="h-4 w-5/6 bg-stone-100 rounded" />
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
          <div className="flex flex-col gap-1">
            <div className="h-5 w-20 bg-stone-200 rounded" />
            <div className="h-3 w-10 bg-stone-100 rounded" />
          </div>
          <div className="h-8 w-20 bg-stone-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
