import { Helmet } from 'react-helmet-async';

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Termeni și Condiții - Piata Online</title>
      </Helmet>
      
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-serif font-bold text-stone-800 mb-2">Termeni și Condiții</h1>
        <p className="text-stone-500 mb-8">Ultima actualizare: 28 decembrie 2025</p>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100 prose prose-stone max-w-none">
          
          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-fern mb-4">1. Despre Platformă</h2>
            <p>
              <strong>Piața Digitală</strong> este o platformă online care facilitează conexiunea dintre producătorii locali ("Vânzători") și consumatori ("Cumpărători").
              Rolul nostru este strict informativ și de intermediere tehnică. Noi nu suntem parte contractuală în tranzacțiile dintre utilizatori și nu deținem produsele listate pe site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-fern mb-4">2. Responsabilitatea Vânzătorilor</h2>
            <p>
              Vânzătorii sunt deplin responsabili pentru:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Calitatea, siguranța și conformitatea produselor alimentare vândute.</li>
              <li>Acuratețea informațiilor din descrierile produselor și fotografiile acestora.</li>
              <li>Respectarea legislației în vigoare privind producția și comercializarea produselor agricole și alimentare.</li>
              <li>Obținerea tuturor autorizațiilor necesare (ex: DSVSA) pentru activitatea desfășurată, dacă este cazul.</li>
            </ul>
            <p className="mt-2">
              Platforma nu verifică fizic produsele și nu garantează pentru calitatea acestora. Orice reclamație legată de produse se rezolvă direct între Cumpărător și Vânzător.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-fern mb-4">3. Comenzi și Plăți</h2>
            <p>
              <strong>Fără Plăți Online Intermediare:</strong> Platforma nu procesează plăți. Toate tranzacțiile financiare se desfășoară exclusiv între Cumpărător și Vânzător (de regulă, plata numerar la livrare/ridicare).
            </p>
            <p className="mt-2">
              Comenzile plasate pe site constituie o rezervare a produselor. Contractul de vânzare-cumpărare se consideră încheiat în momentul predării fizice a bunurilor.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-fern mb-4">4. Conduita Utilizatorilor</h2>
            <p>Este interzisă:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Publicarea de produse ilegale, furate sau interzise de lege.</li>
              <li>Folosirea unui limbaj injurios, discriminatoriu sau hărțuitor în mesageria privată sau recenzii.</li>
              <li>Crearea de conturi false sau multiple pentru manipularea rating-urilor.</li>
            </ul>
            <p className="mt-2">
              Ne rezervăm dreptul de a suspenda sau șterge conturile care încalcă aceste reguli, fără preaviz.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-fern mb-4">5. Date cu Caracter Personal</h2>
            <p>
              Colectăm date minime necesare funcționării (nume, email, poză profil - prin Google OAuth).
              Datele sunt folosite exclusiv pentru a permite funcționarea platformei (plasarea comenzilor, contactarea vânzătorilor).
              Nu vindem datele tale către terți. Pentru ștergerea contului și a datelor asociate, te rugăm să ne contactezi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-fern mb-4">6. Contact</h2>
            <p>
              Pentru orice întrebări, sesizări sau probleme tehnice, ne poți contacta la adresa de email: <a href="mailto:gabrielprocopenco@gmail.com" className="text-terracotta hover:underline">gabrielprocopenco@gmail.com</a>.
            </p>
          </section>

        </div>
      </div>
    </>
  );
}
