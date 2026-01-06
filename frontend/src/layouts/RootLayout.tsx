import { Navbar } from '../components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InstallPrompt } from '../components/InstallPrompt';

import { Footer } from '../components/Footer';

export function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-cream text-stone-800">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <ToastContainer position="bottom-right" theme="colored" />
      <InstallPrompt />
    </div>
  );
}
