import { useState } from 'react';
import { 
  Store, 
  ShoppingBag, 
  Truck, 
  Check, 
  User, 
  Plus, 
  Image as ImageIcon,
  DollarSign
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export function SellerSimulator() {
  const [activeStep, setActiveStep] = useState(0);
  
  // Simulator State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stallCreated, setStallCreated] = useState(false);
  const [stallLocation, setStallLocation] = useState("Galați");
  const [productAdded, setProductAdded] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productName, setProductName] = useState("Roșii din Grădină");
  const [productPrice, setProductPrice] = useState("5");
  const [orderApproved, setOrderApproved] = useState(false);
  const [orderRejected, setOrderRejected] = useState(false);

  const steps = [
    { title: "1. Autentificare", icon: <User className="w-5 h-5" /> },
    { title: "2. Deschide Taraba", icon: <Store className="w-5 h-5" /> },
    { title: "3. Adaugă Produse", icon: <Plus className="w-5 h-5" /> },
    { title: "4. Gestionează Comenzi", icon: <ShoppingBag className="w-5 h-5" /> },
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
    setIsLoggedIn(false);
    setStallCreated(false);
    setStallLocation("Galați");
    setProductAdded(false);
    setProductImage(null);
    setProductName("Roșii din Grădină");
    setProductPrice("5");
    setOrderApproved(false);
    setOrderRejected(false);
    setActiveStep(0);
  };

  return (
    <div className="w-full">
       <div className="text-center mb-8">
          <h2 className="text-2xl font-serif font-bold mb-2 text-stone-800">Vânzător</h2>
          <p className="text-stone-500 text-sm">Administrează magazinul tău online.</p>
       </div>

       {/* Stepper */}
       <div className="flex items-center justify-center gap-2 mb-8 px-2">
          {steps.map((step, index) => (
             <button 
               key={index}
               onClick={() => setActiveStep(index)}
               className={cn(
                 "flex items-center justify-center rounded-full transition-all duration-300 border-2",
                 activeStep === index 
                   ? "pl-3 pr-4 py-2 bg-fern text-white border-fern shadow-md" 
                   : "w-10 h-10 bg-stone-50 text-stone-400 border-stone-200 hover:border-stone-300"
               )}
               title={step.title}
             >
                <div className={cn("rounded-full flex items-center justify-center", activeStep === index ? "mr-2" : "")}>
                    {activeStep > index ? <Check className="w-4 h-4" /> : step.icon}
                </div>
                
                {/* Only show text for active step */}
                <span className={cn(
                    "font-bold text-xs whitespace-nowrap overflow-hidden transition-[width,opacity] duration-300 ease-in-out",
                    activeStep === index ? "w-auto opacity-100" : "w-0 opacity-0"
                )}>
                    {step.title.split('. ')[1]}
                </span>
             </button>
          ))}
       </div>

       {/* Simulation Screen */}
       <div className="bg-stone-100 p-2 md:p-6 rounded-3xl shadow-xl border-4 border-stone-200 aspect-[16/11] min-h-[400px] relative overflow-hidden">
           
           {/* Mock Browser Header */}
           <div className="absolute top-0 left-0 right-0 h-8 bg-stone-200 flex items-center px-4 gap-2 z-10 rounded-t-2xl">
               <div className="w-3 h-3 rounded-full bg-red-400"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
               <div className="w-3 h-3 rounded-full bg-green-400"></div>
               <div className="ml-4 bg-white h-5 rounded-full flex-grow mx-4 opacity-50"></div>
           </div>

           <div className="mt-8 bg-white h-full w-full rounded-xl overflow-y-auto relative flex flex-col items-center justify-center p-6 transition-all duration-500">
               

               {/* Step 1: Login */}
               {activeStep === 0 && (
                  <div className="h-full flex flex-col justify-center items-center text-center animate-in fade-in zoom-in duration-300 px-6">
                      {!isLoggedIn ? (
                          <div className="space-y-8 w-full max-w-sm">
                              <div className="w-20 h-20 bg-fern rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-fern/20">
                                  <span className="text-white text-3xl">❖</span>
                              </div>
                              <div>
                                  <h3 className="text-2xl font-serif font-bold mb-2">Piața Online</h3>
                                  <p className="text-stone-500 text-sm">Gustul autentic, acum digital.</p>
                              </div>
                              <button 
                                onClick={handleLogin}
                                className="bg-white border text-stone-700 px-4 py-3 rounded-full text-sm font-bold shadow-md flex items-center justify-center gap-2 w-full hover:bg-stone-50 active:scale-95 transition-all whitespace-nowrap"
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
                         <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-green-700 mb-2">Autentificare Reușită!</h3>
                            <p className="text-stone-500 mb-4 text-sm">Te redirecționăm...</p>
                         </div>
                      )}
                  </div>
               )}

               {/* Step 2: Create Stall */}
               {activeStep === 1 && (

                  <div className="w-full max-w-sm animate-in fade-in slide-in-from-right duration-500 px-2">
                      {!stallCreated ? (
                          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm text-left">
                              <h3 className="text-base font-bold mb-3 flex items-center"><Store className="w-4 h-4 mr-2" /> Creează Taraba Ta</h3>
                              <div className="space-y-2">
                                  <div>
                                      <label className="text-[10px] font-bold text-stone-500 uppercase">Nume Tarabă</label>
                                      <input type="text" defaultValue="Bunătăți de la Bunica" className="w-full border-b border-stone-200 py-1 focus:border-fern outline-none font-serif text-sm font-bold bg-transparent" />
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold text-stone-500 uppercase">Descriere</label>
                                      <textarea defaultValue="Produse naturale, crescute cu grijă." className="w-full border border-stone-200 p-2 rounded text-stone-600 h-10 text-[13px] resize-none focus:border-fern outline-none bg-stone-50"></textarea>
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold text-stone-500 uppercase">Locație</label>
                                      <input 
                                        type="text" 
                                        value={stallLocation}
                                        onChange={(e) => setStallLocation(e.target.value)}
                                        className="w-full border-b border-stone-200 py-1 focus:border-fern outline-none text-xs bg-transparent" 
                                      />
                                  </div>
                                  <Button onClick={() => setStallCreated(true)} className="w-full mt-2 h-8 text-xs">Salvează și Deschide</Button>
                              </div>
                          </div>
                      ) : (
                          <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Store className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-green-700 mb-1">Tarabă Deschisă!</h3>
                            <p className="text-stone-500 mb-3 text-xs">Acum hai să adăugăm primul produs.</p>
                            <Button onClick={handleNextStep} className="h-8 text-xs">Pasul Următor &rarr;</Button>
                          </div>
                      )}
                  </div>
               )}

               {/* Step 3: Add Product */}
               {activeStep === 2 && (
                   <div className="w-full max-w-sm animate-in fade-in slide-in-from-right duration-500">
                       {!productAdded ? (
                           <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm text-left">
                               <h3 className="text-lg font-bold mb-4 flex items-center"><Plus className="w-5 h-5 mr-2" /> Adaugă Produs</h3>
                               <div className="flex gap-4">
                                   <div 
                                     onClick={() => setProductImage("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80")}
                                     className={cn(
                                        "w-20 h-20 rounded-lg flex items-center justify-center border-2 border-dashed cursor-pointer transition-all overflow-hidden relative",
                                        productImage ? "border-fern bg-white" : "border-stone-300 bg-stone-100 hover:bg-stone-200"
                                     )}
                                   >
                                       {productImage ? (
                                           <img src={productImage} alt="Product Preview" className="w-full h-full object-cover animate-in fade-in duration-300" />
                                       ) : (
                                           <div className="text-center">
                                               <ImageIcon className="w-5 h-5 text-stone-400 mx-auto mb-1" />
                                               <span className="text-[10px] text-stone-500 font-bold uppercase">Foto</span>
                                           </div>
                                       )}
                                   </div>
                                   <div className="flex-grow space-y-2">
                                        <input 
                                            type="text" 
                                            value={productName}
                                            onChange={(e) => setProductName(e.target.value)}
                                            placeholder="Nume" 
                                            className="w-full border rounded px-3 py-1.5 text-sm" 
                                        />
                                        <div className="flex gap-2">
                                            <div className="relative flex-grow">
                                                <DollarSign className="w-3 h-3 absolute left-2 top-2.5 text-stone-400" />
                                                <input 
                                                    type="text" 
                                                    value={productPrice}
                                                    onChange={(e) => setProductPrice(e.target.value)}
                                                    placeholder="Preț" 
                                                    className="w-full border rounded pl-6 pr-2 py-1.5 text-sm" 
                                                />
                                            </div>
                                            <select className="border rounded px-2 py-1.5 text-xs bg-white">
                                                <option>kg</option>
                                                <option>buc</option>
                                            </select>
                                        </div>
                                   </div>
                               </div>
                               <Button onClick={() => setProductAdded(true)} className="w-full mt-4 bg-fern hover:bg-green-700">Publică Produsul</Button>
                           </div>
                       ) : (
                           <div className="text-center">
                               <div className="bg-white p-3 rounded-xl shadow-lg border border-stone-100 inline-block mb-4 transform rotate-3">
                                    <div className="h-28 w-40 bg-stone-200 rounded-lg mb-2 flex items-center justify-center text-stone-400 font-bold overflow-hidden">
                                        {productImage ? (
                                            <img src={productImage} alt="Product" className="w-full h-full object-cover" />
                                        ) : (
                                            "FOTO"
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-stone-800 text-sm">{productName}</div>
                                        <div className="text-fern font-bold text-sm">{productPrice} RON / kg</div>
                                    </div>
                               </div>
                               <h3 className="text-lg font-bold text-stone-800 mb-1">Produsul e Live!</h3>
                               <p className="text-stone-500 mb-4 text-xs">Clienții îl pot vedea și comanda.</p>
                               <Button onClick={handleNextStep}>Pasul Următor &rarr;</Button>
                           </div>
                       )}
                   </div>
               )}

               {/* Step 4: Manage Order */}
               {activeStep === 3 && (
                   <div className="w-full max-w-sm animate-in fade-in slide-in-from-right duration-500">
                       {!orderApproved && !orderRejected ? (
                           <div className="bg-white p-0 rounded-xl border border-stone-200 shadow-lg text-left overflow-hidden">
                               <div className="bg-red-50 p-2 border-b border-red-100 flex items-center justify-between">
                                   <span className="text-red-600 font-bold text-xs flex items-center"><ShoppingBag className="w-3 h-3 mr-1" /> Comandă Nouă!</span>
                                   <span className="text-[10px] text-red-400">Acum 2 minute</span>
                               </div>
                               <div className="p-4">
                                   <div className="flex justify-between items-start mb-3">
                                       <div>
                                           <div className="font-bold text-stone-800 text-sm">Maria Popescu</div>
                                           <div className="text-[10px] text-stone-500">{stallLocation}, Centru</div>
                                       </div>
                                       <div className="font-bold text-lg">{(parseFloat(productPrice || "0") * 2 + 5).toFixed(2)} RON</div>
                                   </div>
                                   <div className="bg-stone-50 p-2 rounded-lg text-xs mb-3">
                                       <div className="flex justify-between mb-1">
                                           <span>2kg x {productName}</span>
                                           <span>{(parseFloat(productPrice || "0") * 2).toFixed(2)} RON</span>
                                       </div>
                                       <div className="flex justify-between text-stone-500">
                                           <span>1 x Legătură Pătrunjel</span>
                                           <span>5.00 RON</span>
                                       </div>
                                   </div>
                                   <div className="flex gap-2">
                                       <Button onClick={() => setOrderApproved(true)} className="flex-grow bg-green-600 hover:bg-green-700 h-8 text-xs">Confirmă</Button>
                                       <Button onClick={() => setOrderRejected(true)} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 h-8 text-xs">Refuză</Button>
                                   </div>
                               </div>
                           </div>
                       ) : orderRejected ? (
                           <div className="text-center">
                               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                   <div className="w-8 h-8 text-red-600 font-bold text-2xl leading-none flex items-center justify-center">×</div>
                               </div>
                               <h3 className="text-lg font-bold text-red-700 mb-2">Comandă Refuzată</h3>
                               <p className="text-stone-500 mb-4 text-xs">Clientul a fost notificat.</p>
                               <Button onClick={resetSimulator} variant="outline" size="sm">O nouă simulare</Button>
                           </div>
                       ) : (
                           <div className="text-center">
                               <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                   <Truck className="w-8 h-8 text-blue-600" />
                               </div>
                               <h3 className="text-lg font-bold text-blue-700 mb-2">Comandă Confirmată!</h3>
                               <p className="text-stone-500 mb-4 text-xs">Urmează să pregătești pachetul.</p>
                               <Button onClick={resetSimulator} variant="outline" size="sm">O nouă simulare</Button>
                           </div>
                       )}
                   </div>
               )}

           </div>
           
           
       </div>
    </div>
  );
}
