import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from './constants';

const LegalLayout: React.FC<{ title: string; configKey: keyof typeof APP_CONFIG.seo; children: React.ReactNode }> = ({ title, configKey, children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const seoConfig = APP_CONFIG.seo[configKey];

  useEffect(() => {
    document.body.classList.add('allow-scroll');
    document.documentElement.classList.add('allow-scroll');
    return () => {
      document.body.classList.remove('allow-scroll');
      document.documentElement.classList.remove('allow-scroll');
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-['Inter']">
       <Helmet>
        <title>{seoConfig.title}</title>
        <meta name="description" content={seoConfig.description} />
        <meta name="keywords" content={seoConfig.keywords} />
        <link rel="canonical" href={seoConfig.canonical} />
      </Helmet>

      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-[100] glass-panel border-b border-white/5 py-4 px-6 flex justify-between items-center">

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF8800] rounded-lg flex items-center justify-center font-black text-white italic">N</div>
          <Link to="/site" className="font-['Orbitron'] font-black tracking-tighter text-xl text-[#FF8800]">number</Link>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
          <Link to="/site" className="hover:text-white transition-colors">Home</Link>
          <Link to="/" className="hover:text-white transition-colors">Gioca</Link>
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/contact" className="hidden sm:block bg-[#FF8800] text-black px-6 py-2 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all">
            CONTATTI
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-white hover:text-[#FF8800] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-[72px] bg-black z-[9999] flex flex-col p-8 gap-6 animate-screen-in md:hidden">
            <Link to="/site" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">HOME</Link>
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">GIOCA</Link>
            <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">BLOG</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">ABOUT</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">CONTATTI</Link>
          </div>
        )}
      </nav>

    <main className="pt-40 pb-20 px-6 max-w-4xl mx-auto w-full flex-grow">
      <h1 className="text-4xl md:text-5xl font-black font-['Orbitron'] mb-12 text-[#FF8800] border-b border-white/10 pb-6 uppercase tracking-widest">
        {title}
      </h1>
      <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed text-lg">
        {children}
      </div>
    </main>

    <footer className="py-8 px-6 border-t border-white/5 bg-slate-950 mt-20 text-center">
      <div className="max-w-7xl mx-auto text-slate-600 text-[10px] font-mono">
        © 2026 NUMBERGAME.IT • TUTTI I DIRITTI RISERVATI • GDPR COMPLIANT
      </div>
    </footer>
    </div>
  );
};

export const PrivacyView: React.FC = () => (
  <LegalLayout title="Privacy Policy & GDPR" configKey="privacy">
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
           <Shield className="w-5 h-5 text-[#FF8800]" /> 1. Informativa Generale
        </h2>
        <p>Documento aggiornato al 09 Marzo 2026 in conformità al Regolamento UE 2016/679 (GDPR). Numbergame.it garantisce che il trattamento dei dati personali si svolga nel rispetto dei diritti e delle libertà fondamentali dell'interessato.</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
           <Lock className="w-5 h-5 text-[#FF8800]" /> 2. Titolare del Trattamento
        </h2>
        <p>Il titolare del trattamento è lo staff di Numbergame.it, contattabile per qualsiasi chiarimento relativo alla protezione dei dati all'indirizzo email: <strong>privacy@numbergame.it</strong>.</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
           <Info className="w-5 h-5 text-[#FF8800]" /> 3. Finalità del Trattamento
        </h2>
        <p>I dati vengono raccolti per le seguenti finalità:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Funzionamento del gioco:</strong> Salvataggio dei progressi, livelli e punteggi (dati tecnici e nickname).</li>
          <li><strong>Personalizzazione Pubblicitaria:</strong> Attraverso Google AdSense, mostriamo annunci pertinenti basati sui vostri interessi.</li>
          <li><strong>Analisi Statistica:</strong> Monitoraggio del traffico in forma anonima per migliorare l'esperienza utente.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
           <CheckCircle className="w-5 h-5 text-[#FF8800]" /> 4. Diritti dell'Interessato
        </h2>
        <p>Ai sensi del GDPR, l'utente ha il diritto di:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Accedere ai propri dati e richiederne l'esportazione.</li>
          <li>Richiedere la rettifica o la cancellazione degli stessi ("Diritto all'oblio").</li>
          <li>Revocare il consenso ai cookie in qualsiasi momento tramite il pannello di gestione.</li>
        </ul>
      </section>
    </div>
  </LegalLayout>
);

export const CookieView: React.FC = () => (
  <LegalLayout title="Cookie Policy" configKey="cookies">
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em]">Utilizzo dei Cookie</h2>
        <p>Questo sito utilizza cookie per migliorare l'esperienza e mostrare pubblicità personalizzata tramite Google AdSense.</p>
      </section>

      <section className="bg-slate-900 p-6 rounded-2xl border border-white/5">
        <h3 className="font-bold text-white mb-4 italic">Tipologie di Cookie in uso:</h3>
        <ul className="space-y-4">
          <li className="border-b border-white/5 pb-2">
            <span className="text-[#FF8800] font-black mr-2">TECNICI:</span> Essenziali per il salvataggio dei login e dei livelli raggiunti. Non possono essere disattivati.
          </li>
          <li className="border-b border-white/5 pb-2">
            <span className="text-[#FF8800] font-black mr-2">ANALYTICS:</span> Ci aiutano a capire quanti utenti giocano e quali livelli sono troppo difficili.
          </li>
          <li className="border-b border-white/5 pb-2">
            <span className="text-[#FF8800] font-black mr-2">MARKETING (AdSense):</span> Cookie di terze parti utilizzati da Google per pubblicare annunci pertinenti basati sulle tue visite precedenti.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em]">Gestione del Consenso</h2>
        <p>Puoi modificare le tue preferenze sui cookie in ogni momento pulendo la cache del browser o cliccando sul link "Gestisci Consenso" presente in fondo ad ogni pagina.</p>
      </section>
    </div>
  </LegalLayout>
);

export const AboutView: React.FC = () => (
  <LegalLayout title="Chi Siamo" configKey="about">
    <div className="space-y-8">
      <section>
        <p className="text-white text-xl leading-relaxed font-bold italic">
          "La matematica non è un'opinione, è un'avventura."
        </p>
        <p className="mt-6">
          Numbergame.it nasce dall'idea di trasformare il calcolo mentale in un'esperienza competitiva e visivamente gratificante. Crediamo fermamente che il **Brain Training** debba essere accessibile a tutti, gratuito e divertente.
        </p>
        <p>
          Il nostro team è composto da appassionati di logica e sviluppatori che hanno voluto creare una piattaforma dove la neuroplasticità cerebrale viene stimolata attraverso il gioco diretto.
        </p>
      </section>
    </div>
  </LegalLayout>
);

export const TermsView: React.FC = () => (
  <LegalLayout title="Termini di Contratto" configKey="terms">
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
           <FileText className="w-5 h-5 text-[#FF8800]" /> 1. Oggetto del Servizio
        </h2>
        <p>L'accesso a Numbergame.it è gratuito. Il sito offre giochi logico-matematici e contenuti editoriali volti all'intrattenimento e all'allenamento cognitivo.</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
           <FileText className="w-5 h-5 text-[#FF8800]" /> 2. Proprietà Intellettuale
        </h2>
        <p>Tutti i contenuti (codice, design, testi degli articoli e algoritmi di gioco) sono di proprietà esclusiva di Numbergame.it. È vietata la riproduzione, anche parziale, senza autorizzazione scritta.</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
           <FileText className="w-5 h-5 text-[#FF8800]" /> 3. Limitazioni di Responsabilità
        </h2>
        <p>Il servizio è fornito "visto e piaciuto". Non garantiamo che il gioco sia privo di bug o interruzioni. Non siamo responsabili per l'uso improprio delle informazioni contenute negli articoli del blog.</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
           <FileText className="w-5 h-5 text-[#FF8800]" /> 4. Sospensione Account
        </h2>
        <p>Ci riserviamo il diritto di bannare o limitare l'accesso a utenti che utilizzano software di automazione (bot) per falsare le classifiche mondiali.</p>
      </section>
    </div>
  </LegalLayout>
);

export const ContactView: React.FC = () => (
  <LegalLayout title="Contatti" configKey="contact">
    <div className="space-y-8">
      <section className="bg-slate-900 p-10 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8800]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#FF8800]/10 transition-colors"></div>
        
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-3">
           <Mail className="w-6 h-6 text-[#FF8800]" /> Supporto & Partnership
        </h2>
        
        <div className="space-y-8">
          <div>
            <p className="mb-4 text-slate-400">Hai domande, suggerimenti o segnalazioni? Scrivici direttamente a:</p>
            <a href="mailto:info@numbergame.it" className="text-2xl md:text-3xl font-black font-['Orbitron'] text-[#FF8800] hover:scale-105 transition-transform inline-block break-all border-b-2 border-transparent hover:border-[#FF8800]">
              info@numbergame.it
            </a>
          </div>

          <div className="pt-8 border-t border-white/5">
            <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-sm italic">Sviluppo Software su Misura</h3>
            <p className="text-slate-400 leading-relaxed">
              Oltre a Numbergame.it, il nostro team offre servizi professionali di sviluppo. Siamo pronti a dare vita alla tua idea: 
              <span className="text-white font-semibold"> sviluppiamo videogiochi (2D/3D), applicazioni mobile Android/iOS, gestionali aziendali, </span> 
              piattaforme web avanzate e soluzioni basate su Intelligenza Artificiale.
            </p>
            <p className="mt-4 text-[#FF8800] font-bold">Contattaci per un preventivo personalizzato.</p>
          </div>
        </div>
      </section>
    </div>
  </LegalLayout>
);
