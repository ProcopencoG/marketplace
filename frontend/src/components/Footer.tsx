import { RomanianPattern } from './RomanianPattern';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 mt-auto flex flex-col">
      {/* Traditional Motif Border */}
      <RomanianPattern className="w-full" />

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Logo & Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
             <div className="flex items-center select-none mb-2">
                <span className="text-fern mr-2 text-2xl">❖</span>
                <span className="font-serif text-xl font-bold text-stone-200 tracking-tight">Piața Online</span>
             </div>
             <p className="text-stone-400 text-sm max-w-xs">
               Produse proaspete, direct de la producători locali. 
               Păstrăm tradiția și gustul autentic românesc.
             </p>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm font-medium text-stone-400">
             <Link to="/cum-functioneaza" className="hover:text-stone-200 transition-colors">Cum Funcționează</Link>
             <Link to="/termeni" className="hover:text-stone-200 transition-colors">Termeni și Condiții</Link>
             <Link to="/contact" className="hover:text-stone-200 transition-colors">Contact</Link>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-stone-800 my-8 w-full max-w-2xl mx-auto md:max-w-full"></div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-stone-500 gap-4">
           <p>© {currentYear} Piața Online. Toate drepturile rezervate.</p>
           <p className="flex items-center gap-1">
             
           </p>
        </div>
      </div>
    </footer>
  );
}
