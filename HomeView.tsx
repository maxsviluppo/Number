import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Zap, Trophy, Play, Info, Shield, MessageSquare, ChevronRight, Menu, X } from 'lucide-react';

import { APP_CONFIG } from './constants';
import { configService } from './services/supabaseClient';

const HomeView: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [remoteConfig, setRemoteConfig] = useState<any>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await configService.getSystemConfig();
      if (config) {
        setRemoteConfig(config);
        if (config?.seo?.site?.title) {
          document.title = config.seo.site.title;
        }
      } else {
        document.title = APP_CONFIG.seo.site.title;
      }
    };
    loadConfig();
    
    document.body.classList.add('allow-scroll');
    document.documentElement.classList.add('allow-scroll');
    return () => {
      document.body.classList.remove('allow-scroll');
      document.documentElement.classList.remove('allow-scroll');
    };
  }, []);

  return (
    <div className="min-h-screen bg-[url('/sfondo.png')] bg-cover bg-center bg-no-repeat bg-fixed text-white flex flex-col font-['Inter']">


      {/* Navigation Header */}
      {/* Navigation Header */}
      <nav className={`fixed top-0 w-full z-[10000] border-b border-white/5 py-4 px-6 flex justify-between items-center transition-colors duration-300 ${isMenuOpen ? 'bg-black' : 'glass-panel'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF8800] rounded-lg flex items-center justify-center font-black text-white italic">N</div>
          <Link to="/site" className="font-['Orbitron'] font-black tracking-tighter text-xl text-[#FF8800]">number</Link>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
          <Link to="/site" className="hover:text-[#FF8800] transition-colors">Home</Link>
          <Link to="/play" className="hover:text-[#FF8800] transition-colors font-black text-white">Gioca</Link>
          <Link to="/invite" className="hover:text-[#FF8800] transition-colors text-[#FF8800]">Invita</Link>
          <Link to="/blog" className="hover:text-[#FF8800] transition-colors">Blog</Link>
          <Link to="/about" className="hover:text-[#FF8800] transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/play" className="hidden sm:block bg-[#FF8800] text-black px-6 py-2 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all">
            ENTRA ORA
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
          <div className="fixed inset-0 top-[72px] bg-black z-[9999] flex flex-col p-8 gap-6 animate-screen-in md:hidden h-[calc(100vh-72px)] overflow-y-auto">
            <Link to="/site" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800] border-b border-white/5 pb-4">HOME</Link>
            <Link to="/play" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800] border-b border-white/5 pb-4">GIOCA</Link>
            <Link to="/invite" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800] border-b border-white/5 pb-4 text-[#FF8800]">INVITA</Link>
            <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800] border-b border-white/5 pb-4">BLOG</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800] border-b border-white/5 pb-4">ABOUT</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800] border-b border-white/5 pb-4">CONTATTI</Link>
            
            <Link to="/play" onClick={() => setIsMenuOpen(false)} className="mt-4 bg-[#FF8800] text-black w-full py-4 rounded-2xl font-black text-center text-xl shadow-[0_0_30px_rgba(255,136,0,0.3)]">
              SFIDA ORA
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#FF8800]/10 border border-[#FF8800]/20 text-[#FF8800] text-xs font-black tracking-[0.2em] mb-6">
            NEURAL MATH GAMING • V2.0
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-['Orbitron'] mb-8 leading-[0.9]">
            Sfida la tua <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8800] to-[#FFBB00]">Mente.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
            Il gioco di logica matematica più avanzato. Allena il tuo QI, sfida amici in Neural Duel e scala le classifiche mondiali. 
            Pronto a superare i tuoi limiti?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/play" className="group relative bg-[#FF8800] text-black px-10 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,136,0,0.3)]">
              <Play className="fill-current w-6 h-6" />
              INIZIA L'AVVENTURA
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </Link>
            <Link to="/blog" className="bg-slate-800/50 hover:bg-slate-800 transition-colors border border-white/5 px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-2">
              Scopri i benefici
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <div className="flex-1 relative">
           <div className="relative z-10 w-full max-w-[500px] aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl animate-float">
             <img src="/Einstein_Welcome.png" alt="Welcome Character" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
           </div>
           {/* Decorative elements */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FF8800]/20 blur-[80px] rounded-full"></div>
           <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-500/10 blur-[100px] rounded-full"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center group">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20 group-hover:scale-110 transition-transform">
              <Brain className="w-8 h-8 text-[#FF8800]" />
            </div>
            <h3 className="text-xl font-bold mb-4 font-['Orbitron']">Allena la Logica</h3>
            <p className="text-slate-400">Risolvi enigmi matematici sempre più complessi per stimolare la neuroplasticità cerebrale.</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-4 font-['Orbitron']">Neural Duel 1vs1</h3>
            <p className="text-slate-400">Sfida altri giocatori online in tempo reale nelle modalità Standard o Blitz ad alta velocità.</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Trophy className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-4 font-['Orbitron']">Scala i Ranking</h3>
            <p className="text-slate-400">Accumula punti, sblocca Badge unici e dimostra di essere il più intelligente della community.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-[#FF8800] rounded flex items-center justify-center font-black text-black italic text-xs">N</div>
                <span className="font-['Orbitron'] font-black tracking-tighter text-lg text-white">numbergame.it</span>
             </div>
             <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
               La piattaforma definitiva per gli amanti dei numeri. Allenamento cognitivo, competizione e divertimento in un'unica interfaccia futuristica.
             </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-[#FF8800]">Link Utili</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="/play" className="hover:text-white transition-colors">Gioca Ora</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog & News</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Chi Siamo</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contatti</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-[#FF8800]">Legale</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Termini d'uso</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-slate-600 text-[10px] font-mono">
           © 2026 GIULINCY SRL • ALL RIGHTS RESERVED • MATH IS POWER
        </div>
      </footer>
    </div>
  );
};

export default HomeView;
