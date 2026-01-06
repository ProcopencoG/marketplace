import React from 'react';

interface RomanianPatternProps {
  readonly className?: string;
}

export function RomanianPattern({ className = "" }: RomanianPatternProps) {
  // Palette: Fern Green (#4a7c59), Terracotta (#b7472a), Black/Dark Grey (#1c1917 for contrast)
  const red = "#b7472a"; 
  const green = "#4a7c59";
  const black = "#292524"; 

  // A much finer, pixel-art style pattern simulating cross-stitch.
  // 1 unit = 2px. Pattern height ~20px for "finuț" look.
  
  return (
    <div className={`w-full overflow-hidden h-6 bg-stone-50 ${className}`} title="Motiv Tradițional">
      <svg
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="crossStitchHora"
            x="0"
            y="0"
            width="32"
            height="24"
            patternUnits="userSpaceOnUse"
          >
             {/* 
                Authentic "Hora" stylized motif (Pixel Art / Cross Stitch) 
                Simulating the reference images with alternating geometric figures.
             */}
             
             {/* --- FIGURE 1 (Woman/Skirt) --- */}
             {/* Head */}
             <rect x="7" y="4" width="2" height="2" fill={black} />
             
             {/* Arms (holding hands) */}
             <rect x="3" y="8" width="10" height="2" fill={red} />
             
             {/* Body/Skirt - Pyramid shape */}
             <rect x="7" y="8" width="2" height="2" fill={red} />
             <rect x="6" y="10" width="4" height="2" fill={red} />
             <rect x="5" y="12" width="6" height="2" fill={red} />
             <rect x="4" y="14" width="8" height="2" fill={red} />

             {/* --- CONNECTOR (Hands) --- */}
             {/* Small X pattern between figures */}
             <path d="M 0 9 h 2 v 2 h -2 z" fill={green} />
             <path d="M 15 9 h 2 v 2 h -2 z" fill={green} />
             <path d="M 31 9 h 2 v 2 h -2 z" fill={green} />


             {/* --- FIGURE 2 (Man/Pants) --- */}
             {/* Head */}
             <rect x="23" y="4" width="2" height="2" fill={black} />

             {/* Arms */}
             <rect x="19" y="8" width="10" height="2" fill={green} />

             {/* Body - Rectangular/Straight */}
             <rect x="23" y="8" width="2" height="4" fill={green} />
             
             {/* Pants/Legs */}
             <rect x="22" y="12" width="4" height="4" fill={green} />
             <rect x="21" y="14" width="2" height="2" fill={green} /> {/* Boots detail */}
             <rect x="25" y="14" width="2" height="2" fill={green} />


             {/* Decorative Top Border (Dots) */}
             <rect x="1" y="1" width="1" height="1" fill={black} opacity="0.5"/>
             <rect x="5" y="1" width="1" height="1" fill={black} opacity="0.5"/>
             <rect x="9" y="1" width="1" height="1" fill={black} opacity="0.5"/>
             <rect x="13" y="1" width="1" height="1" fill={black} opacity="0.5"/>
             <rect x="17" y="1" width="1" height="1" fill={black} opacity="0.5"/>
             <rect x="21" y="1" width="1" height="1" fill={black} opacity="0.5"/>
             <rect x="25" y="1" width="1" height="1" fill={black} opacity="0.5"/>
             <rect x="29" y="1" width="1" height="1" fill={black} opacity="0.5"/>

          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#crossStitchHora)" />
      </svg>
    </div>
  );
}
