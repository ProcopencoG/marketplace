import { useState } from 'react';
import { 
  Store, 
  ShoppingCart, 
  MessageCircle, 
  Check, 
  User, 
  Search,
  MapPin,
  Plus,
  Minus,
  CreditCard,
  QrCode
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export function BuyerSimulator() {
  const [activeStep, setActiveStep] = useState(0);
  
  // Simulator State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stallSelected, setStallSelected] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderPickedUp, setOrderPickedUp] = useState(false);
  const [chatMessageSent, setChatMessageSent] = useState(false);
  const [chatInput, setChatInput] = useState("Ajung în 10 minute");
  const [resetKey, setResetKey] = useState(0);

  const steps = [
    { title: "Autentificare", icon: <User className="w-4 h-4" /> },
    { title: "Cumpără", icon: <ShoppingCart className="w-4 h-4" /> },
    { title: "Finalizare", icon: <CreditCard className="w-4 h-4" /> },
    { title: "Preluare", icon: <QrCode className="w-4 h-4" /> },
  ];

  const handleNextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleLogin = () => {
      setIsLoggedIn(true);
      setTimeout(() => {
          handleNextStep();
      }, 1500);
  };

  const resetSimulator = () => {
    setActiveStep(0);
    setIsLoggedIn(false);
    setCartItems(0);
    setOrderPlaced(false);
    setOrderPickedUp(false);
    setChatMessageSent(false);
    setStallSelected(false);
    setChatInput("Ajung în 10 minute");
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="w-full max-w-[320px] mx-0 lg:mx-auto">
       <div className="text-center mb-6">
          <h2 className="text-2xl font-serif font-bold mb-2 text-stone-800">Cumpărător</h2>
          <p className="text-stone-500 text-sm">Cumpără proaspăt, direct de pe mobil.</p>
       </div>

       {/* Stepper (Outside Phone) */}
       <div className="flex items-center justify-center gap-2 mb-8 px-2">
          {steps.map((step, index) => (
             <button 
               key={index}
               onClick={() => setActiveStep(index)}
               className={cn(
                 "flex items-center justify-center rounded-full transition-all duration-300 border-2",
                 activeStep === index 
                   ? "pl-3 pr-4 py-2 bg-stone-800 text-white border-stone-800 shadow-md" 
                   : "w-10 h-10 bg-stone-50 text-stone-400 border-stone-200 hover:border-stone-300"
               )}
               title={step.title}
             >
                <div className={cn("rounded-full flex items-center justify-center", activeStep === index ? "mr-2" : "")}>
                   {step.icon}
                </div>
                
                {/* Only show text for active step */}
                <span className={cn(
                    "font-bold text-xs whitespace-nowrap overflow-hidden transition-[width,opacity] duration-300 ease-in-out",
                    activeStep === index ? "w-auto opacity-100" : "w-0 opacity-0"
                )}>
                    {step.title}
                </span>
             </button>
          ))}
       </div>

       {/* Mobile Frame (iPhone 15/16 Style) */}
       <div className="bg-stone-800 rounded-[3rem] p-2.5 shadow-2xl border-[3px] border-stone-800 relative z-10">
           
           {/* Dynamic Island */}
           <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[85px] h-[24px] bg-black rounded-full z-30 flex items-center justify-center">
               <div className="w-full h-full relative">
                   <div className="absolute top-[6px] right-[10px] w-1.5 h-1.5 rounded-full bg-stone-800/50"></div>
               </div>
           </div>

           {/* Screen */}
           <div className="bg-white rounded-[2.5rem] h-[600px] overflow-hidden relative flex flex-col">
               
               {/* Status Bar */}
               <div className="h-14 w-full flex items-start justify-between px-8 pt-4 text-[12px] font-bold text-black z-20 absolute top-0 left-0 right-0">
                   <span>14:51</span>
               </div>

                {/* Content Area */}
               <div className="flex-grow overflow-y-auto pt-14 pb-20 scrollbar-hide relative bg-stone-50">
                   
                   {/* Step 1: Login */}
                   {activeStep === 0 && (
                       <div className="h-full flex flex-col justify-center items-center text-center animate-in fade-in zoom-in duration-300 px-6">
                            {!isLoggedIn ? (
                                <div className="space-y-8 w-full">
                                    <div className="w-20 h-20 bg-fern rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-fern/20">
                                        <span className="text-white text-3xl">❖</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-serif font-bold mb-2">Piața Online</h3>
                                        <p className="text-stone-500 text-sm">Gustul autentic, acum digital.</p>
                                    </div>
                                    <button 
                                      onClick={handleLogin}
                                      className="bg-white border text-stone-700 px-4 py-2.5 rounded-full text-xs font-bold shadow-md flex items-center justify-center gap-2 w-full hover:bg-stone-50 active:scale-95 transition-all whitespace-nowrap"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Conectează-te cu Google
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                     <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                        <Check className="w-10 h-10 text-green-600" />
                                    </div>
                                    <p className="font-bold text-xl text-stone-800">Bine ai venit!</p>
                                </div>
                            )}
                       </div>
                   )}

                   {/* Step 2: Explore & Add to Cart */}
                   {activeStep === 1 && (
                       <div className="animate-in slide-in-from-right duration-300 h-full flex flex-col p-4">
                           {!stallSelected ? (
                               <>
                                   <div className="relative mb-6">
                                       <Search className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                                       <input type="text" placeholder="Caută produse..." className="w-full bg-white rounded-full py-3 pl-10 pr-4 text-sm shadow-sm border-none ring-1 ring-stone-100" />
                                   </div>
                                   <div className="flex items-center justify-between mb-4">
                                       <h3 className="font-bold text-lg">Tarabe în Apropiere</h3>
                                       <span className="text-fern text-xs font-bold">Vezi tot</span>
                                   </div>
                                   <div onClick={() => setStallSelected(true)} className="bg-white p-4 rounded-2xl shadow-sm mb-4 cursor-pointer hover:bg-stone-50 transition-colors active:scale-95">
                                       <div className="flex gap-4">
                                           <div className="w-14 h-14 bg-stone-200 rounded-xl flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=150&q=80)' }}></div>
                                           <div>
                                               <h4 className="font-bold text-base">Bunătăți de la Bunica</h4>
                                               <div className="flex items-center text-xs text-stone-500 mt-1">
                                                   <MapPin className="w-3 h-3 mr-1" /> Galați, Centru
                                               </div>
                                               <div className="flex items-center gap-2 mt-2">
                                                   <div className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">Deschis</div>
                                                   <span className="text-[10px] text-stone-400">★ 4.9 (120)</span>
                                               </div>
                                           </div>
                                       </div>
                                   </div>
                                   <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 opacity-50">
                                       <div className="flex gap-4">
                                           <div className="w-14 h-14 bg-stone-200 rounded-xl flex-shrink-0"></div>
                                           <div>
                                               <h4 className="font-bold text-base">Legume Proaspete</h4>
                                               <div className="flex items-center text-xs text-stone-500 mt-1">
                                                   <MapPin className="w-3 h-3 mr-1" /> Galați, Micro 19
                                               </div>
                                           </div>
                                       </div>
                                   </div>
                               </>
                           ) : (
                               <>
                                   <div className="flex items-center mb-6">
                                       <button onClick={() => setStallSelected(false)} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mr-3 hover:bg-stone-50">←</button>
                                       <h3 className="font-bold text-base">Bunătăți de la Bunica</h3>
                                   </div>
                                   
                                   <div className="flex-grow space-y-4">
                                       {/* Product 1: Tomatoes (Same Image as Seller) */}
                                       <div className="bg-white p-3 rounded-2xl shadow-sm flex gap-4">
                                            <div className="w-20 h-20 bg-stone-200 rounded-xl flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80)' }}></div>
                                            <div className="flex-grow flex flex-col justify-center">
                                                <h4 className="font-bold text-sm">Roșii de Grădină</h4>
                                                <p className="text-fern text-xs font-bold mb-3">5.00 RON / kg</p>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => setCartItems(prev => prev + 1)} className="px-4 py-1.5 bg-fern text-white text-xs font-bold rounded-full hover:bg-green-700 active:scale-95 transition-transform">Adaugă în Coș</button>
                                                </div>
                                            </div>
                                       </div>

                                       {/* Product 2: Parsley (New Image) */}
                                       <div className="bg-white p-3 rounded-2xl shadow-sm flex gap-4">
                                            <div className="w-20 h-20 bg-stone-100 rounded-xl flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: 'url(/parsley.png)' }}></div>
                                            <div className="flex-grow flex flex-col justify-center">
                                                <h4 className="font-bold text-sm">Pătrunjel</h4>
                                                <p className="text-fern text-xs font-bold mb-3">5.00 RON / leg</p>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => setCartItems(prev => prev + 1)} className="px-4 py-1.5 bg-fern text-white text-xs font-bold rounded-full hover:bg-green-700 active:scale-95 transition-transform">Adaugă în Coș</button>
                                                </div>
                                            </div>
                                       </div>
                                   </div>

                                   {cartItems > 0 && (
                                       <div className="absolute bottom-20 left-4 right-4 animate-in slide-in-from-bottom duration-300 z-30">
                                           <Button onClick={handleNextStep} className="w-full bg-stone-900 text-white shadow-xl rounded-2xl flex justify-between items-center py-6 hover:bg-black transition-colors">
                                               <div className="flex items-center">
                                                   <div className="bg-stone-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold text-xs">{cartItems}</div>
                                                   <span className="font-bold">Vezi Coșul</span>
                                               </div>
                                               <span className="font-bold">{(cartItems * 5 + 5).toFixed(2)} RON</span>
                                           </Button>
                                       </div>
                                   )}
                               </>
                           )}
                       </div>
                   )}

                   {/* Step 3: Checkout & Order */}
                   {activeStep === 2 && (
                       <div className="animate-in slide-in-from-right duration-300 h-full flex flex-col p-4">
                           {!orderPlaced ? (
                               <div className="flex flex-col h-full">
                                    <h3 className="font-bold text-lg mb-6">Sumar Comandă</h3>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm mb-6 flex-grow">
                                        <div className="flex justify-between py-3 border-b border-stone-100 text-sm">
                                            <span>Roșii x 2kg</span>
                                            <span className="font-medium">10.00 RON</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b border-stone-100 text-sm">
                                            <span>Pătrunjel x 1</span>
                                            <span className="font-medium">5.00 RON</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-4 mt-auto">
                                            <span>Total</span>
                                            <span>15.00 RON</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <h4 className="font-bold text-sm mb-3 text-stone-500 uppercase">Metodă de Plată</h4>
                                        <div className="flex gap-3">
                                            <button className="flex-1 border-2 border-fern bg-green-50 py-3 rounded-xl text-xs font-bold text-fern flex items-center justify-center gap-2">
                                                <span>💵</span> Ramburs
                                            </button>
                                        </div>
                                    </div>

                                    <Button onClick={() => setOrderPlaced(true)} className="w-full mt-auto bg-fern shadow-lg rounded-xl py-6 text-base hover:bg-green-700 mb-3">Trimite Comanda</Button>
                                    
                               </div>
                           ) : (
                               <div className="h-full flex flex-col justify-center items-center text-center px-6">
                                   <div className="w-24 h-24 bg-fern rounded-full flex items-center justify-center mb-6 shadow-2xl animate-bounce">
                                       <Check className="w-12 h-12 text-white" />
                                   </div>
                                   <h3 className="text-2xl font-bold mb-3">Comandă Trimisă!</h3>
                                   <p className="text-stone-500 text-sm mb-8">Vânzătorul a primit comanda ta.<br/>Vei fi notificat când este gata.</p>
                                   <Button onClick={handleNextStep} variant="outline" className="rounded-full px-8 border-2">Urmărește Comanda</Button>
                               </div>
                           )}
                       </div>
                   )}

                   {/* Step 4: Pickup & Chat */}
                   {activeStep === 3 && (
                       <div className="animate-in slide-in-from-right duration-300 h-full flex flex-col p-4">
                            {!orderPickedUp ? (
                                <div className="h-full flex flex-col">
                                    {/* Compact Header */}
                                    <div className="bg-white p-3 rounded-2xl shadow-sm mb-3 flex items-center justify-between border-l-4 border-fern">
                                        <div className="text-lg font-bold text-stone-800">Comanda #9</div>
                                        <div className="pdf-badge inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold whitespace-nowrap">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            Gata de ridicare
                                        </div>
                                    </div>

                                    {/* Chat Area - Maximized */}
                                    <div className="bg-white rounded-2xl shadow-sm flex-grow overflow-hidden flex flex-col mb-3 border border-stone-100">
                                        <div className="p-3 bg-stone-50 border-b border-stone-100 flex items-center gap-3">
                                           <div className="w-8 h-8 bg-stone-200 rounded-full bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=150&q=80)' }}></div>
                                           <div>
                                               <div className="text-xs font-bold">Bunătăți de la Bunica</div>
                                               <div className="text-[10px] text-green-600 font-bold">• Online</div>
                                           </div>
                                        </div>
                                        <div className="flex-grow p-3 space-y-3 overflow-y-auto text-xs bg-white">
                                            <div className="text-center text-[10px] text-stone-300 my-1">Astăzi, 14:30</div>
                                            <div className="bg-stone-100 p-2.5 rounded-2xl rounded-tl-none self-start max-w-[85%] text-stone-700 shadow-sm">
                                                Salut! Comanda ta e gata. Te aștept în locația stabilită la ora 15:00. 🍅
                                            </div>
                                            {chatMessageSent && (
                                                <div className="bg-fern text-white p-2.5 rounded-2xl rounded-tr-none self-end max-w-[85%] animate-in slide-in-from-bottom-2 shadow-sm break-words">
                                                    {chatInput}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Input Area */}
                                        <div className="p-2 border-t border-stone-100 flex gap-2 bg-stone-50">
                                            <input 
                                                type="text" 
                                                value={chatMessageSent ? "" : chatInput}
                                                onChange={(e) => !chatMessageSent && setChatInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !chatMessageSent && chatInput.trim()) {
                                                        setChatMessageSent(true);
                                                    }
                                                }}
                                                placeholder="Scrie un mesaj..." 
                                                className="flex-grow bg-white rounded-full px-4 py-2 text-xs outline-none border border-stone-200 focus:border-fern focus:ring-1 focus:ring-fern disabled:opacity-50 disabled:bg-stone-100"
                                                disabled={chatMessageSent} 
                                            />
                                            <button 
                                                onClick={() => {
                                                    if (!chatMessageSent && chatInput.trim()) {
                                                        setChatMessageSent(true);
                                                    }
                                                }}
                                                className={cn(
                                                    "w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors",
                                                    chatMessageSent || !chatInput.trim() 
                                                        ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                                                        : "bg-fern text-white hover:bg-green-700"
                                                )}
                                                disabled={chatMessageSent || !chatInput.trim()}
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <Button onClick={() => setOrderPickedUp(true)} className="w-full bg-stone-900 py-4 rounded-xl hover:bg-black transition-colors text-sm">Confirmă Ridicarea</Button>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col justify-center items-center text-center px-6">
                                   <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                                       <Store className="w-10 h-10 text-blue-600" />
                                   </div>
                                   <h3 className="text-xl font-bold mb-2">Mulțumim!</h3>
                                   <p className="text-stone-500 text-sm mb-8">Te așteptăm din nou la Piața Online.</p>
                                   <Button onClick={resetSimulator} variant="outline" className="rounded-full px-8 border-2">O nouă simulare</Button>
                                </div>
                            )}
                       </div>
                   )}
               </div>

               {/* Bottom Safari Bar */}
                <div className="absolute bottom-6 left-4 right-4 h-12 bg-white/90 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-200/50 flex items-center justify-between px-4 z-40">
                   <div className="text-[10px] text-stone-400">AA</div>
                   <div className="flex items-center gap-1 text-[11px] font-medium text-black">
                       <span className="w-2.5 h-3 rounded-[1px] border border-black flex items-center justify-center overflow-hidden"><span className="w-full h-[1px] bg-black -rotate-45"></span></span>
                       piata-online.ro
                   </div>
                   <div className="w-4 h-4 rounded-full border border-stone-400"></div>
               </div>

               {/* Home Indicator */}
               <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black rounded-full z-50"></div>

           </div>
       </div>
    </div>
  );
}
