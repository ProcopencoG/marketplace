import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Store, 
  ShoppingBag, 
  Truck, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  Leaf,
  Star,
  Wallet,
  TrendingDown,
  Globe,
  Settings
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SellerSimulator } from '../components/demo/SellerSimulator';
import { BuyerSimulator } from '../components/demo/BuyerSimulator';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

export default function DemoPage() {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Google login for CTA
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await loginWithGoogle(tokenResponse.access_token);
      navigate('/seller/stall/new');
    },
    onError: error => console.log('Login Failed:', error)
  });

  // Smart CTA handler
  const handleCtaClick = () => {
    if (user) {
      if (user.hasStall) {
        navigate('/seller/dashboard');
      } else {
        navigate('/seller/stall/new');
      }
    } else {
      googleLogin();
    }
  };

  const faqs = [
    {
      id: 'faq-cost',
      question: "Cât costă să îmi deschid o tarabă?",
      answer: "Absolut nimic! Platforma este complet gratuită pentru vânzători. Nu percepem comisioane din vânzări și nu există taxe de abonament. Scopul nostru este să susținem producătorii locali."
    },
    {
      id: 'faq-sustain',
      question: "Cum se susține platforma dacă totul este gratuit?",
      answer: "Toate funcționalitățile actuale sunt de bază și vor rămâne permanent gratuite. Pe viitor, vor apărea funcționalități premium opționale (contra cost) pentru cei care își vor dori instrumente avansate."
    },
    {
      id: 'faq-payment',
      question: "Cum primesc banii pe comenzi?",
      answer: "Plata se face momentan exclusiv 'Ramburs' (cash la livrare/ridicare). Tu, ca vânzător, încasezi banii direct de la client atunci când îi predai produsele. Simplu și direct."
    },
    {
      id: 'faq-company',
      question: "Trebuie să am firmă (SRL/PFA)?",
      answer: "Nu este obligatoriu din partea platformei, dar ești responsabil să respecți legislația în vigoare privind comerțul cu produse alimentare. Platforma conectează direct producătorii cu consumatorii."
    },
    {
      id: 'faq-location',
      question: "Pot vinde oriunde în țară?",
      answer: "Sistemul este gândit momentan pentru comunități locale. Setezi orașul în care activezi, iar clienții te vor găsi dacă filtrează după acel oraș. Recomandăm livrarea personală sau ridicarea din locație."
    },
    {
      id: 'faq-cancel',
      question: "Ce se întâmplă dacă nu pot onora o comandă?",
      answer: "Poți anula comanda din panoul de administrare, specificând un motiv. Clientul va fi notificat automat. Este important să menții o comunicare bună pentru a avea recenzii pozitive."
    },
     {
      id: 'faq-dual',
      question: "Pot avea și cont de cumpărător?",
      answer: "Da! Același cont poate fi folosit atât pentru a vinde produse (prin Taraba ta), cât și pentru a cumpăra bunătăți de la alți producători locali."
    }
  ];

  return (
    <div className="min-h-screen bg-cream text-stone-800 font-sans overflow-x-hidden">

      {/* Hero Section */}
      <section className="bg-black text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {/* Deep Space Base - Warmer undertone */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900 via-black to-black opacity-90"></div>

             {/* Botanical Nebulas - Theme Colors */}
             <div className="absolute -top-[10%] left-[10%] w-[40vw] h-[40vw] bg-fern/30 rounded-full blur-[100px] mix-blend-screen animate-float-1"></div>

             <div className="absolute top-[20%] -left-[10%] w-[35rem] h-[35rem] bg-terracotta/30 rounded-full blur-[90px] mix-blend-screen animate-float-2"></div>
             <div className="absolute top-[10%] right-[10%] w-[30rem] h-[30rem] bg-marigold/20 rounded-full blur-[80px] mix-blend-screen animate-float-3"></div>
             <div className="absolute -bottom-[20%] left-[30%] w-[40rem] h-[40rem] bg-fern/20 rounded-full blur-[110px] mix-blend-screen animate-float-1" style={{ animationDelay: '-13s' }}></div>

             {/* Roaming "Searchlight" - Cream/Warm */}
             <div className="absolute top-1/2 left-1/2 w-[25rem] h-[25rem] bg-cream/10 rounded-full blur-[60px] mix-blend-overlay animate-float-2" style={{ animationDelay: '-19s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Deschide-ți Taraba Digitală în 3 Minute
          </h1>
          <p className="text-lg md:text-xl text-stone-300 mb-8 max-w-2xl mx-auto">
            Vinde produse locale, de casă, direct către vecinii tăi. Fără comisioane, fără bătăi de cap.
            Simplu, ca la piață.
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' })} className="bg-fern hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg flex items-center">
               <Play className="w-5 h-5 mr-2 fill-current" /> Încearcă Simulatorul
            </button>
            <Link to="/" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-3 rounded-full font-bold transition-colors">
               Explorează Piața
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Simulator */}
      <section id="simulator" className="py-20 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold mb-4 text-stone-800">Test Drive: Cum Funcționează?</h2>
              <p className="text-stone-500">Încearcă interfața noastră interactivă. Nu ai nevoie de cont real!</p>
           </div>

           <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
               {/* Buyer Side (Mobile) */}
               <div className="flex lg:block transform scale-90 sm:scale-100 origin-top-left lg:origin-top p-10">
                   <BuyerSimulator />
               </div>

               {/* Seller Side (Desktop) */}
               <div className="hidden lg:block relative top-0 lg:top-10">
                   <SellerSimulator />
               </div>

               {/* Mobile fallback for seller view - Scaled down to fit */}
               <div className="lg:hidden transform scale-[0.65] origin-top-left -mt-10 mb-[-40%]">
                   <SellerSimulator />
               </div>
           </div>

        </div>
      </section>

      {/* Why Us - Split Section */}
      <section className="py-24 bg-stone-50">
          <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center mb-16">
                  <h2 className="text-4xl font-serif font-bold text-stone-800 mb-4">De ce Piața Online?</h2>
                  <p className="text-stone-500 max-w-2xl mx-auto">O comunitate construită pe încredere, transparență și pasiune pentru gustul autentic.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-0 overflow-hidden rounded-3xl shadow-xl border border-stone-200">
                  
                  {/* Buyer Side - Left */}
                  <div className="bg-white p-10 md:p-14 flex flex-col justify-center relative overflow-hidden group">
                          
                          <div className="inline-flex w-fit items-center gap-2 bg-fern/10 text-fern border border-fern/20 px-3 py-1 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
                              <ShoppingBag className="w-3 h-3" /> Pentru Cumpărători
                          </div>

                          <h3 className="text-3xl font-serif font-bold mb-8 text-stone-800">
                              Gustul autentic,<br/>direct la tine acasă.
                          </h3>

                          <ul className="space-y-6">
                              <li className="flex items-start gap-4">
                                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                                      <Leaf className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-stone-800 mb-1">Produse Locale & Naturale</h4>
                                      <p className="text-sm text-stone-600 leading-relaxed">Cumperi alimente bio, crescute cu grijă de oameni reali din comunitatea ta. Fără procesare industrială.</p>
                                  </div>
                              </li>

                              <li className="flex items-start gap-4">
                                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                                      <Star className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-stone-800 mb-1">Recenzii 100% Reale</h4>
                                      <p className="text-sm text-stone-600 leading-relaxed">Sistem de recenzii verificabile și autentice. Vezi experiențele reale ale altor persoane înainte să cumperi.</p>
                                  </div>
                              </li>

                              <li className="flex items-start gap-4">
                                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                                      <Wallet className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-stone-800 mb-1">Plată Sigură la Livrare</h4>
                                      <p className="text-sm text-stone-600 leading-relaxed">Achitarea se face cash. Verifici calitatea produselor în momentul preluării - zero riscuri.</p>
                                  </div>
                              </li>

                              <li className="flex items-start gap-4">
                                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                                      <TrendingDown className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-stone-800 mb-1">Prețuri de Producător</h4>
                                      <p className="text-sm text-stone-600 leading-relaxed">Eliminăm intermediarii. Tu plătești mai puțin, iar producătorul câștigă prețul corect.</p>
                                  </div>
                              </li>
                          </ul>
                  </div>

                  {/* Seller Side - Right */}
                  <div className="bg-stone-900 p-10 md:p-14 flex flex-col justify-center relative overflow-hidden group text-white">
                       <div className="absolute bottom-0 left-0 w-64 h-64 bg-fern/20 rounded-full blur-3xl -ml-32 -mb-32 transition-transform duration-700 group-hover:scale-110"></div>
                       
                       <div className="relative z-10">
                          <div className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
                              <Store className="w-3 h-3" /> Pentru Vânzători
                          </div>

                          <h3 className="text-3xl font-serif font-bold mb-8">
                              Afacerea ta digitală,<br/>fără costuri ascunse.
                          </h3>

                          <ul className="space-y-6">
                              <li className="flex items-start gap-4">
                                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-fern">
                                      <DollarSign className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold mb-1">0% Comision</h4>
                                      <p className="text-sm text-stone-300 leading-relaxed">Tot ce câștigi este al tău. Nu oprim niciun procent din munca ta. Platforma este gratuită.</p>
                                  </div>
                              </li>

                              <li className="flex items-start gap-4">
                                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-fern">
                                      <Globe className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold mb-1">Prezență Online Instantă</h4>
                                      <p className="text-sm text-stone-300 leading-relaxed">Îți oferim expunere online, magazin propriu și link personalizat imediat ce te înscrii.</p>
                                  </div>
                              </li>

                              <li className="flex items-start gap-4">
                                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-fern">
                                      <Settings className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold mb-1">Control Total & Gratuit</h4>
                                      <p className="text-sm text-stone-300 leading-relaxed">Tarabă customizabilă, panou de control și instrumente profesionale incluse. Tu decizi totul.</p>
                                  </div>
                              </li>

                              <li className="flex items-start gap-4">
                                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-fern">
                                      <Truck className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold mb-1">Livrare Flexibilă</h4>
                                      <p className="text-sm text-stone-300 leading-relaxed">Tu stabilești regulile: predare personală, curier sau punct de întâlnire. Fără impuneri.</p>
                                  </div>
                              </li>
                          </ul>
                       </div>
                  </div>

              </div>
          </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="text-3xl font-serif font-bold text-center mb-12 text-stone-800">Întrebări Frecvente</h2>
              
              <div className="space-y-4">
                  {faqs.map((faq, index) => (
                      <div key={faq.id} className="border border-stone-200 rounded-xl overflow-hidden">
                          <button 
                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            className="w-full text-left p-4 md:p-6 flex justify-between items-center bg-stone-50 hover:bg-stone-100 transition-colors"
                          >
                              <span className="font-bold text-stone-800">{faq.question}</span>
                              {openFaq === index ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
                          </button>
                          
                          <div 
                            className={cn(
                                "transition-all duration-300 ease-in-out overflow-hidden bg-white",
                                openFaq === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                            )}
                          >
                              <div className="p-4 md:p-6 text-stone-600 leading-relaxed border-t border-stone-100">
                                  {faq.answer}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-fern text-white py-16 text-center">
          <div className="container mx-auto px-4">
              <h2 className="text-3xl font-serif font-bold mb-6">Gata să începi?</h2>
              <p className="text-green-100 mb-8 max-w-xl mx-auto">Nu te costă nimic să încerci. Alătură-te comunității de producători locali astăzi.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={handleCtaClick}
                    className="bg-white text-fern hover:bg-stone-100 px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
                  >
                      {user?.hasStall ? 'Mergi la Taraba Ta' : 'Deschide o Tarabă Acum'}
                  </button>
              </div>
          </div>
      </section>
    </div>
  );
}
