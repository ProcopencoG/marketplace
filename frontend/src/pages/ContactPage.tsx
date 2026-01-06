import { Github, Linkedin, Mail, Code2 } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream">
      
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-fern/10 rounded-full mb-6">
            <Code2 className="w-8 h-8 text-fern" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-stone-800 mb-4">Contact & Open Source</h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Acest proiect este open source și disponibil pe GitHub. 
            Contribuțiile și sugestiile sunt binevenite!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* GitHub */}
          <a 
            href="https://github.com/ProcopencoG" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-white p-8 rounded-xl shadow-sm border border-stone-100 hover:shadow-lg hover:border-fern/30 transition-all text-center"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 bg-stone-900 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Github className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">GitHub</h3>
            <p className="text-stone-500 text-sm mb-3">Codul sursă al proiectului</p>
            <span className="text-fern font-medium text-sm">@ProcopencoG →</span>
          </a>

          {/* LinkedIn */}
          <a 
            href="https://www.linkedin.com/in/gabrielprocopenco/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-white p-8 rounded-xl shadow-sm border border-stone-100 hover:shadow-lg hover:border-fern/30 transition-all text-center"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0A66C2] rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Linkedin className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">LinkedIn</h3>
            <p className="text-stone-500 text-sm mb-3">Profil profesional</p>
            <span className="text-fern font-medium text-sm">Gabriel Procopenco →</span>
          </a>

          {/* Email */}
          <a 
            href="mailto:gabrielprocopenco@gmail.com"
            className="group bg-white p-8 rounded-xl shadow-sm border border-stone-100 hover:shadow-lg hover:border-fern/30 transition-all text-center"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 bg-marigold rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">Email</h3>
            <p className="text-stone-500 text-sm mb-3">Contactează-mă direct</p>
            <span className="text-fern font-medium text-sm break-all">gabrielprocopenco@gmail.com</span>
          </a>
        </div>

        {/* Project Info */}
        <div className="bg-gradient-to-br from-fern to-fern/80 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">Despre Proiect</h2>
          <p className="text-green-100 mb-6 max-w-xl mx-auto">
            Piata Online este o platformă care conectează producătorii locali cu consumatorii. 
            Proiectul este dezvoltat cu React, TypeScript și .NET 9.
          </p>
          <a 
            href="https://github.com/ProcopencoG" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-fern px-6 py-3 rounded-full font-bold hover:bg-stone-100 transition-colors"
          >
            <Github className="w-5 h-5" />
            Vezi pe GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
