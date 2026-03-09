import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X, CheckSquare, Settings } from 'lucide-react';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('number_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('number_cookie_consent', 'all');
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('number_cookie_consent', 'necessary');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-[9999] animate-screen-in">
      <div className="glass-panel border border-white/10 rounded-[2rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Background Blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF8800]/10 blur-3xl rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#FF8800]/20 rounded-xl border border-[#FF8800]/30 shadow-[0_0_15px_rgba(255,136,0,0.2)]">
              <ShieldCheck className="w-6 h-6 text-[#FF8800]" />
            </div>
            <h2 className="font-['Orbitron'] font-black text-white text-lg tracking-wider">GDPR CONSENT</h2>
          </div>

          {!showSettings ? (
            <>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Utilizziamo cookie per personalizzare la tua esperienza di gioco e mostrare annunci tramite <strong>Google AdSense</strong>. 
                Rispettiamo la tua privacy secondo il GDPR.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleAcceptAll}
                  className="bg-[#FF8800] text-black py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  ACCETTA TUTTO
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Settings className="w-3 h-3" /> SETTINGS
                  </button>
                  <button 
                    onClick={handleAcceptNecessary}
                    className="bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    SOLO NECESSARI
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
               <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-xs font-bold text-white tracking-widest uppercase">Necessari</span>
                     <CheckSquare className="w-5 h-5 text-[#FF8800]" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 opacity-60">
                     <span className="text-xs font-bold text-white tracking-widest uppercase">Marketing / Ads</span>
                     <div className="w-10 h-5 bg-[#FF8800] rounded-full relative">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                     </div>
                  </div>
               </div>
               <button 
                  onClick={handleAcceptAll}
                  className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors"
               >
                  SALVA PREFERENZE
               </button>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-white/5 flex justify-center gap-4 text-[10px] uppercase font-black tracking-widest text-[#FF8800]/60">
            <Link to="/privacy" className="hover:text-[#FF8800]">Privacy Policy</Link>
            <Link to="/cookies" className="hover:text-[#FF8800]">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
