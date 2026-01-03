import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';
import { Button } from './ui/button';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Check if dismissed recently (e.g., in last 24 hours)
    const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (lastDismissed && Date.now() - parseInt(lastDismissed) < 86400000) return;

    // Detect OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    if (isIosDevice) {
       // Show immediately for iOS
       setShowPrompt(true);
    } else if (isAndroidDevice) {
        // For Android/Chrome, catch the event
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-bottom animate-slide-up">
      <div className="max-w-md mx-auto relative">
         <button onClick={handleDismiss} className="absolute -top-2 -right-2 p-2 text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
         </button>

         <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-fern rounded-xl flex items-center justify-center text-white flex-shrink-0">
               <span className="text-2xl font-serif font-bold">❖</span>
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-stone-800 text-base">Instalează Aplicația</h3>
                <p className="text-sm text-stone-600 mt-1 mb-3 leading-tight">
                    Adaugă Piața Online pe ecranul principal pentru o experiență mai rapidă și mai simplă.
                </p>

                {isIOS && (
                    <div className="bg-stone-50 rounded-lg p-3 text-sm text-stone-700 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                             1. Apasă butonul <Share className="w-4 h-4 text-blue-500" /> <strong>Share</strong> de jos.
                        </div>
                        <div className="flex items-center gap-2">
                             2. Selectează <PlusSquare className="w-4 h-4 text-stone-600" /> <strong>Add to Home Screen</strong>.
                        </div>
                    </div>
                )}
                
                {isAndroid && (
                    <Button onClick={handleInstallClick} className="w-full bg-fern text-white hover:bg-fern/90">
                        Instalează Acum
                    </Button>
                )}
            </div>
         </div>
      </div>
    </div>
  );
}
