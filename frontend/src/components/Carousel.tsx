
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Leaf, Globe, Zap, DollarSign, Play, Pause } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: '/images/demo/carousel_fresh.png',
    title: "Gustul autentic, direct la tine acasă.",
    description: "Cumperi alimente bio, crescute cu grijă de oameni reali din comunitatea ta. Fără procesare industrială, doar prospețime pură.",
    icon: Leaf,
    accent: "bg-fern",
    text_accent: "text-fern",
    tag: "100% Natural"
  },
  {
    id: 2,
    image: '/images/demo/carousel_community.png',
    title: "O comunitate construită pe încredere.",
    description: "Cunoaște-ți fermierii vecini. Nu cumperi de la companii anonime, ci de la oameni care pun suflet în ceea ce cresc.",
    icon: Globe,
    accent: "bg-terracotta",
    text_accent: "text-terracotta",
    tag: "Local & Sigur"
  },
  {
    id: 3,
    image: '/images/demo/carousel_digital.png',
    title: "Tehnologie simplă pentru natură.",
    description: "O platformă modernă și intuitivă care aduce grădina direct pe telefonul tău. Comanzi sau vinzi în câteva click-uri.",
    icon: Zap,
    accent: "bg-marigold",
    text_accent: "text-marigold",
    tag: "Rapid & Ușor"
  },
  {
    id: 4,
    image: '/images/demo/carousel_cash.png',
    title: "0% Comision. Afacerea ta, regulile tale.",
    description: "Suntem singura platformă unde producătorii păstrează tot profitul. Fără taxe ascunse, fără intermediari.",
    icon: DollarSign,
    accent: "bg-stone-500", // Using neutral for cash to let the image distinct
    text_accent: "text-stone-400",
    tag: "Profit Maxim"
  }
];

export function Carousel() {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Helper function to calculate progress bar width (extracted from nested ternary)
  const getProgressWidth = (index: number): string => {
    if (index === current) {
      return `${progress}%`;
    }
    return index < current ? '100%' : '0%';
  };

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % slides.length);
    setProgress(0);
  }, []);

  const prev = () => {
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            next();
            return 0;
          }
          return p + 1; // Smooth increment
        });
      }, 50); // Updates every 50ms, so 100 steps * 50ms = 5000ms total duration
    }
    return () => clearInterval(interval);
  }, [isPlaying, next]);

  return (
    <div 
      className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden bg-black"
      role="region"
      aria-label="Carousel cu imagini promoționale"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      onFocus={() => setIsPlaying(false)}
      onBlur={() => setIsPlaying(true)}
    >
      {/* Background Images with Crossfade */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10"></div>
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover object-center animate-ken-burns transform scale-105" // Subtle zoom
            />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="container mx-auto px-12 relative z-20 h-full flex items-center">
        <div className="max-w-2xl text-white">
            {slides.map((slide, index) => (
                <div 
                  key={slide.id} 
                  className={`select-none transition-all duration-700 absolute top-1/2 -translate-y-1/2 left-4 md:left-8 pr-10 ${index === current ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}
                >
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6 text-white ${slide.accent}`}>
                      <slide.icon className="w-4 h-4" /> {slide.tag}
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                        {slide.title}
                    </h2>
                    
                    <p className="text-lg md:text-xl text-stone-300 mb-10 leading-relaxed max-w-lg">
                        {slide.description}
                    </p>

                    {/* <button 
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 group"
                    >
                        Află mai multe
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button> */}
                </div>
            ))}
        </div>
      </div>

      {/* Controls & Indicators */}
      <div className="absolute bottom-10 left-0 right-0 z-30 container mx-auto px-12">
         <div className="flex items-center justify-between border-t border-white/10 pt-6">
            
            {/* Progress Indicators */}
            <div className="flex gap-4">
                {slides.map((slide, index) => (
                    <button 
                      key={slide.id}
                      onClick={() => { setCurrent(index); setProgress(0); }}
                      className="group flex flex-col gap-2 cursor-pointer w-14 md:w-48 text-left"
                    >
                       <span className={`hidden md:block text-xs font-bold uppercase tracking-wider transition-colors ${index === current ? slide.text_accent : 'text-stone-500 group-hover:text-stone-300'}`}>
                         0{index + 1} - {slide.tag}
                       </span>
                       <div className="h-1 bg-white/10 rounded-full w-full overflow-hidden">
                           <div 
                              className={`h-full transition-all duration-75 rounded-full ${slide.accent}`}
                              style={{ 
                                width: getProgressWidth(index) 
                              }}
                           ></div>
                       </div>
                    </button>
                ))}
            </div>

            {/* Navigation Buttons - Hidden on Mobile */}
            <div className="hidden md:flex gap-2">
                <button onClick={prev} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label={isPlaying ? 'Pauză carousel' : 'Pornește carousel'}
                >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={next} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
         </div>
      </div>
    </div>
  );
}
