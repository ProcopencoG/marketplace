import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

const images = [
  {
    url: '/market_hero_1.png',
    title: 'Gustul autentic, direct de la sursă',
    description: 'Piața Online aduce producătorii locali mai aproape de tine. Descoperă tarabele digitale și comandă produse proaspete.'
  },
  {
    url: '/market_hero_2.png',
    title: 'Tradiție în fiecare felie',
    description: 'Descoperă brânzeturi și produse lactate preparate după rețete străvechi, fără aditivi sau conservanți.'
  },
  {
    url: '/market_hero_3.png',
    title: 'Bunătățile cămării românești',
    description: 'De la miere aurie la pâine caldă, găsește tot ce ai nevoie pentru o masă sănătoasă și gustoasă.'
  }
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % images.length);
  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-2xl mb-12 shadow-xl border-4 border-white">
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/70 via-stone-900/40 to-transparent flex items-center p-8 md:p-20">
            <div className="max-w-xl text-white select-none">
              <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight drop-shadow-md">
                {img.title}
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90 drop-shadow-sm font-sans">
                {img.description}
              </p>
              <Button size="lg" className="bg-marigold hover:bg-marigold/90 text-stone-900 font-bold px-8 shadow-lg border-none">
                Explorează Tarabele
              </Button>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full text-white transition-all ring-1 ring-white/30"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full text-white transition-all ring-1 ring-white/30"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition-all border border-white/50 ${
              idx === current ? 'bg-marigold w-8' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
