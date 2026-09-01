import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Copy, Share2, ArrowLeft, Download, Info, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { APP_CONFIG } from './constants';
import { configService, supabase } from './services/supabaseClient';
import androidStoreIcon from './public/icona-android-store.png';
import { useLanguage } from './i18n/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';

const InviteView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [remoteConfig, setRemoteConfig] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [userCode, setUserCode] = useState<string | null>(null);
  const { t, translations } = useLanguage();

  const inviteLink = userCode
    ? `https://www.numbergame.it/invite?ref=${userCode}`
    : `https://www.numbergame.it/invite`;

  useEffect(() => {
    const loadConfig = async () => {
      const config = await configService.getSystemConfig();
      if (config) {
        setRemoteConfig(config);
      }
      document.title = `${t('invite.pageTitle')} | ${APP_CONFIG.seo.site.title}`;
    };
    loadConfig();

    const fetchUserCode = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('referral_code')
            .eq('id', user.id)
            .single();
          if (data && data.referral_code) {
            setUserCode(data.referral_code);
          }
        }
      } catch (err) {
        console.warn("Error fetching user referral code in InviteView:", err);
      }
    };
    fetchUserCode();

    document.body.classList.add('allow-scroll');
    document.documentElement.classList.add('allow-scroll');
    return () => {
      document.body.classList.remove('allow-scroll');
      document.documentElement.classList.remove('allow-scroll');
    };
  }, [t]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Gioca a NumberGame!',
      text: 'Ricevi +60s EXTRA! Usa il mio link per ricevere subito 60 secondi di bonus extra nella tua prima partita!',
      url: inviteLink,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const faqs = translations.invite.faqs;

  return (
    <div className="min-h-screen bg-[url('/sfondo.png')] bg-cover bg-center bg-no-repeat bg-fixed text-white flex flex-col font-['Inter']">
      <nav className="fixed top-0 w-full z-[10000] border-b border-white/5 py-4 px-6 flex justify-between items-center bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF8800] rounded-lg flex items-center justify-center font-black text-white italic">N</div>
          <Link to="/site" className="font-['Orbitron'] font-black tracking-tighter text-xl text-[#FF8800]">number</Link>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
          <Link to="/site" className="hover:text-[#FF8800] transition-colors">{t('nav.home')}</Link>
          <Link to="/play" className="hover:text-white transition-colors font-black text-white">{t('nav.play')}</Link>
          <Link to="/blog" className="hover:text-[#FF8800] transition-colors">{t('nav.blog')}</Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher className="scale-[0.45] sm:scale-50 origin-right -mr-8 sm:-mr-6" />
          <Link to="/play" className="bg-[#FF8800] text-black px-6 py-2 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all">
            {t('nav.enter')}
          </Link>
        </div>
      </nav>

      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto w-full">
        <Link to="/site" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-wider">
          <ArrowLeft size={16} /> {t('invite.backHome')}
        </Link>

        <div className="relative overflow-hidden bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-12 backdrop-blur-md">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF8800]/20 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-[#FF8800]/10 border border-[#FF8800]/25 flex items-center justify-center text-[#FF8800] shrink-0 animate-bounce">
              <Gift size={48} className="md:size-[64px]" />
            </div>

            <div className="text-center md:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-[#FF8800]/10 border border-[#FF8800]/20 text-[#FF8800] text-[10px] font-black tracking-widest uppercase mb-3">
                {t('invite.badge')}
              </span>
              <h1 className="text-3xl md:text-5xl font-black font-['Orbitron'] mb-4 leading-tight">
                {t('invite.heroTitle')} <span className="text-[#FF8800]">{t('invite.heroTitleHighlight')}</span> {t('invite.heroTitleSuffix')}
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                {t('invite.heroDesc')}
              </p>
            </div>
          </div>

          <div className="h-px bg-white/5 my-8"></div>

          <div className="space-y-4">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
              {userCode ? t('invite.linkLabel') : t('invite.linkLabelGuest')}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs md:text-sm font-mono text-slate-300 select-all truncate flex items-center">
                {inviteLink}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleShare}
                  className="bg-gradient-to-r from-[#FF8800] to-amber-500 hover:brightness-110 active:scale-95 text-black px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,136,0,0.3)]"
                >
                  <Share2 size={16} /> Condividi
                </button>
                <button
                  onClick={handleCopyLink}
                  className="bg-white/10 hover:bg-white/15 text-white active:scale-95 px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/10"
                >
                  {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                  {copied ? t('invite.copied') : t('invite.copyLink')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Share2 size={24} />
            </div>
            <h3 className="font-bold font-['Orbitron'] mb-2">{t('invite.webVersion')}</h3>
            <p className="text-xs text-slate-400 mb-6">{t('invite.webDesc')}</p>
            <Link to="/play" className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all">
              {t('invite.playBrowser')}
            </Link>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-green-500/20 border border-green-500/30 px-2 py-0.5 rounded text-[8px] font-bold text-green-400 uppercase">
              {t('invite.recommended')}
            </div>
            <div className="w-full flex items-center justify-center mb-4">
              <img
                src={androidStoreIcon}
                alt="Google Play Store"
                className="h-12 w-auto object-contain pointer-events-none select-none"
              />
            </div>
            <h3 className="font-bold font-['Orbitron'] mb-2">{t('invite.androidApp')}</h3>
            <p className="text-xs text-slate-400 mb-6">{t('invite.androidDesc')}</p>
            <a href="https://play.google.com/store/apps/details?id=com.max.numbergame.app&pcampaignid=web_share" target="_blank" rel="noopener noreferrer" className="mt-auto w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5">
              {t('invite.downloadPlayStore')} <Download size={14} />
            </a>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center opacity-70">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Info size={24} />
            </div>
            <h3 className="font-bold font-['Orbitron'] mb-2">{t('invite.iosApp')}</h3>
            <p className="text-xs text-slate-400 mb-6">{t('invite.iosDesc')}</p>
            <button disabled className="mt-auto w-full bg-slate-800 text-slate-500 font-bold text-xs py-3 rounded-xl cursor-not-allowed">
              {t('invite.comingSoon')}
            </button>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 md:p-8">
          <h2 className="text-2xl font-black font-['Orbitron'] mb-6 flex items-center gap-3">
            <Info className="text-[#FF8800]" /> {t('invite.faqTitle')}
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

      <footer className="py-12 px-6 border-t border-white/5 bg-slate-950 text-center">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-[#FF8800]/60 mb-6">
          <Link to="/site" className="hover:text-white transition-colors">{t('nav.home')}</Link>
          <Link to="/play" className="hover:text-white transition-colors">{t('nav.play')}</Link>
          <Link to="/blog" className="hover:text-white transition-colors">{t('nav.blog')}</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">{t('common.privacy')}</Link>
          <Link to="/cookies" className="hover:text-white transition-colors">{t('common.cookies')}</Link>
          <Link to="/terms" className="hover:text-white transition-colors">{t('common.terms')}</Link>
        </div>
        <p className="text-[10px] text-slate-600 font-medium">{t('invite.copyright')}</p>
      </footer>
    </div>
  );
};

export default InviteView;
