import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Copy, Share2, ArrowLeft, Download, Info, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { APP_CONFIG } from './constants';
import { configService } from './services/supabaseClient';

const InviteView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [remoteConfig, setRemoteConfig] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Generiamo un link referral dimostrativo per gli utenti non loggati
  const sampleRefLink = `${window.location.origin}/site?ref=USER_ID`;

  useEffect(() => {
    const loadConfig = async () => {
      const config = await configService.getSystemConfig();
      if (config) {
        setRemoteConfig(config);
      }
      document.title = `Invita un Amico & Ricevi Bonus | ${APP_CONFIG.seo.site.title}`;
    };
    loadConfig();

    document.body.classList.add('allow-scroll');
    document.documentElement.classList.add('allow-scroll');
    return () => {
      document.body.classList.remove('allow-scroll');
      document.documentElement.classList.remove('allow-scroll');
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sampleRefLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    {
      q: "Come funziona il bonus di 60 secondi?",
      a: "Quando un tuo amico si registra a Numbergame utilizzando il tuo link di invito personalizzato (referral link), il nostro sistema associa i vostri profili. Entrambi riceverete un bonus istantaneo di +60 secondi utilizzabile per prolungare la durata dei vostri tentativi nella modalità Time Attack o per sbloccare ricariche speciali nel gioco."
    },
    {
      q: "Dove posso trovare il mio link di invito?",
      a: "Accedi al gioco premendo su 'GIOCA', apri la sezione 'Profilo' in alto a destra e tocca il pulsante 'Invita Amici'. Lì troverai il tuo link referral univoco generato in tempo reale dal nostro database."
    },
    {
      q: "Posso accumulare più bonus di tempo?",
      a: "Sì! Non c'è limite al numero di amici che puoi invitare. Per ogni amico che completa la registrazione ed entra nel gioco, ti verrà accreditato un bonus di 60 secondi addizionale nel tuo inventario dei bonus di gioco."
    },
    {
      q: "Quali sono le piattaforme supportate?",
      a: "Numbergame is accessibile direttamente da browser web su PC e smartphone, ma è ottimizzato anche come app nativa per dispositivi Android (con caricamento rapido e assenza di pubblicità di navigazione). La versione iOS per iPhone è attualmente in fase di sviluppo ed è pianificata per il prossimo rilascio."
    },
    {
      q: "Quali sono le regole per superare i livelli?",
      a: "Nel gioco devi collegare i cristalli numerici adiacenti utilizzando gli operatori aritmetici per raggiungere esattamente il valore target visualizzato in alto. Ogni livello completato aumenta la difficoltà e sblocca nuovi badge."
    }
  ];

  return (
    <div className="min-h-screen bg-[url('/sfondo.png')] bg-cover bg-center bg-no-repeat bg-fixed text-white flex flex-col font-['Inter']">
      
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-[10000] border-b border-white/5 py-4 px-6 flex justify-between items-center bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF8800] rounded-lg flex items-center justify-center font-black text-white italic">N</div>
          <Link to="/site" className="font-['Orbitron'] font-black tracking-tighter text-xl text-[#FF8800]">number</Link>
        </div>
        
        <div className="flex gap-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
          <Link to="/site" className="hover:text-[#FF8800] transition-colors">Home</Link>
          <Link to="/play" className="hover:text-[#FF8800] transition-colors font-black text-white">Gioca</Link>
          <Link to="/blog" className="hover:text-[#FF8800] transition-colors">Blog</Link>
        </div>

        <Link to="/play" className="bg-[#FF8800] text-black px-6 py-2 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all">
          ENTRA
        </Link>
      </nav>

      {/* Main Container */}
      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto w-full">
        
        {/* Back Link */}
        <Link to="/site" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-wider">
          <ArrowLeft size={16} /> Torna alla Home
        </Link>

        {/* Hero Card */}
        <div className="relative overflow-hidden bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-12 backdrop-blur-md">
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF8800]/20 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-[#FF8800]/10 border border-[#FF8800]/25 flex items-center justify-center text-[#FF8800] shrink-0 animate-bounce">
              <Gift size={48} className="md:size-[64px]" />
            </div>
            
            <div className="text-center md:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-[#FF8800]/10 border border-[#FF8800]/20 text-[#FF8800] text-[10px] font-black tracking-widest uppercase mb-3">
                PROGRAMMA REFERRAL LIMITATO
              </span>
              <h1 className="text-3xl md:text-5xl font-black font-['Orbitron'] mb-4 leading-tight">
                Regala <span className="text-[#FF8800]">+60s</span> di Tempo!
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Invita i tuoi amici a giocare. Entrambi riceverete un bonus istantaneo di 60 secondi per dominare le partite a tempo e scalare le vette della classifica globale.
              </p>
            </div>
          </div>

          <div className="h-px bg-white/5 my-8"></div>

          {/* Demonstration copy section */}
          <div className="space-y-4">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
              Esempio di Link di Invito (accedi per generare il tuo):
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs md:text-sm font-mono text-slate-300 select-all truncate flex items-center">
                {sampleRefLink}
              </div>
              <button 
                onClick={handleCopyLink}
                className="bg-white/10 hover:bg-white/15 text-white active:scale-95 px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                {copied ? 'Copiato!' : 'Copia Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Platform Downloads Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Web Version */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Share2 size={24} />
            </div>
            <h3 className="font-bold font-['Orbitron'] mb-2">Versione Web</h3>
            <p className="text-xs text-slate-400 mb-6">Gioca istantaneamente su qualsiasi browser desktop o mobile.</p>
            <Link to="/play" className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all">
              GIOCA SU BROWSER
            </Link>
          </div>

          {/* Android App */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-green-500/20 border border-green-500/30 px-2 py-0.5 rounded text-[8px] font-bold text-green-400 uppercase">
              Consigliato
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-4">
              <Download size={24} />
            </div>
            <h3 className="font-bold font-['Orbitron'] mb-2">App Android</h3>
            <p className="text-xs text-slate-400 mb-6">Nessuna barra degli indirizzi, caricamento istantaneo e performance top.</p>
            <a href="/app-release.apk" download className="mt-auto w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5">
              SCARICA APK <Download size={14} />
            </a>
          </div>

          {/* iOS Coming Soon */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center opacity-70">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Info size={24} />
            </div>
            <h3 className="font-bold font-['Orbitron'] mb-2">Apple iOS</h3>
            <p className="text-xs text-slate-400 mb-6">Attualmente in fase di certificazione su App Store.</p>
            <button disabled className="mt-auto w-full bg-slate-800 text-slate-500 font-bold text-xs py-3 rounded-xl cursor-not-allowed">
              COMING SOON
            </button>
          </div>
        </div>

        {/* Detailed FAQ section (For AdSense Compliance / Quality Content) */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 md:p-8">
          <h2 className="text-2xl font-black font-['Orbitron'] mb-6 flex items-center gap-3">
            <Info className="text-[#FF8800]" /> Informazioni & FAQ
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-semibold text-sm md:text-base hover:text-[#FF8800] transition-colors py-2"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>
                {openFaq === idx && (
                  <p className="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed pl-1">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-slate-950 text-center">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-[#FF8800]/60 mb-6">
          <Link to="/site" className="hover:text-white transition-colors">Home</Link>
          <Link to="/play" className="hover:text-white transition-colors">Gioca</Link>
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Termini</Link>
        </div>
        <p className="text-[10px] text-slate-600 font-medium">© 2026 Numbergame. Tutti i diritti riservati.</p>
      </footer>

    </div>
  );
};

export default InviteView;
