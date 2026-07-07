import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Menu, Shield, Lock, Info, CheckCircle, FileText, Mail } from 'lucide-react';
import { APP_CONFIG } from './constants';
import { useLanguage } from './i18n/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';

const LegalLayout: React.FC<{ title: string; configKey: keyof typeof APP_CONFIG.seo; children: React.ReactNode }> = ({ title, configKey, children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const seoConfig = APP_CONFIG.seo[configKey] || {
    title: 'Number Game',
    description: 'Sfida Matematica & Brain Training',
    keywords: 'math, game, brain training',
    canonical: 'https://numbergame.it/'
  };

  useEffect(() => {
    try {
      if (seoConfig?.title) {
        document.title = seoConfig.title;
      }
      document.body.classList.add('allow-scroll');
      document.documentElement.classList.add('allow-scroll');
    } catch (e) {
      console.warn("DOM manipulation error", e);
    }
    return () => {
      try {
        document.body.classList.remove('allow-scroll');
        document.documentElement.classList.remove('allow-scroll');
      } catch (e) {
        console.warn("DOM cleanup error", e);
      }
    };
  }, [seoConfig]);

  return (
    <div className="min-h-screen bg-[url('/sfondo.png')] bg-cover bg-center bg-no-repeat bg-fixed text-white flex flex-col font-['Inter']">
      <nav className="fixed top-0 w-full z-[100] glass-panel border-b border-white/5 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF8800] rounded-lg flex items-center justify-center font-black text-white italic">N</div>
          <Link to="/site" className="font-['Orbitron'] font-black tracking-tighter text-xl text-[#FF8800]">number</Link>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
          <Link to="/site" className="hover:text-white transition-colors">{t('nav.home')}</Link>
          <Link to="/play" className="hover:text-white transition-colors">{t('nav.play')}</Link>
          <Link to="/blog" className="hover:text-white transition-colors">{t('nav.blog')}</Link>
          <Link to="/about" className="hover:text-white transition-colors">{t('nav.about')}</Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher className="scale-[0.45] sm:scale-50 origin-right -mr-8 sm:-mr-6" />
          <Link to="/contact" className="hidden sm:block bg-[#FF8800] text-black px-6 py-2 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all">
            {t('nav.contacts')}
          </Link>
          <button
            className="md:hidden p-2 text-white hover:text-[#FF8800] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="fixed inset-0 top-[72px] bg-black z-[9999] flex flex-col p-8 gap-6 animate-screen-in md:hidden">
            <Link to="/site" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">HOME</Link>
            <Link to="/play" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">{t('nav.play').toUpperCase()}</Link>
            <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">BLOG</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">ABOUT</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">{t('nav.contacts')}</Link>
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
          {t('legal.footer')}
        </div>
      </footer>
    </div>
  );
};

export const PrivacyView: React.FC = () => {
  const { t } = useLanguage();
  return (
    <LegalLayout title={t('legal.privacy.title')} configKey="privacy">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#FF8800]" /> {t('legal.privacy.s1Title')}
          </h2>
          <p>{t('legal.privacy.s1Body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#FF8800]" /> {t('legal.privacy.s2Title')}
          </h2>
          <p>{t('legal.privacy.s2Body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <Info className="w-5 h-5 text-[#FF8800]" /> {t('legal.privacy.s3Title')}
          </h2>
          <p>{t('legal.privacy.s3Intro')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>{t('legal.privacy.s3Li1')}</strong></li>
            <li><strong>{t('legal.privacy.s3Li2')}</strong></li>
          </ul>
          <p className="mt-4">{t('legal.privacy.s3Outro')}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#FF8800]" /> {t('legal.privacy.s4Title')}
          </h2>
          <p>{t('legal.privacy.s4Intro')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('legal.privacy.s4Li1')}</li>
            <li>{t('legal.privacy.s4Li2')}</li>
            <li>{t('legal.privacy.s4Li3')}</li>
          </ul>
        </section>
      </div>
    </LegalLayout>
  );
};

export const CookieView: React.FC = () => {
  const { t } = useLanguage();
  return (
    <LegalLayout title={t('legal.cookies.title')} configKey="cookies">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em]">{t('legal.cookies.s1Title')}</h2>
          <p>{t('legal.cookies.s1Body')}</p>
        </section>
        <section className="bg-slate-900 p-6 rounded-2xl border border-white/5">
          <h3 className="font-bold text-white mb-4 italic">{t('legal.cookies.s2Title')}</h3>
          <ul className="space-y-4">
            <li className="border-b border-white/5 pb-2">
              <span className="text-[#FF8800] font-black mr-2">{t('legal.cookies.technical').split(':')[0]}:</span>
              {t('legal.cookies.technical').split(':').slice(1).join(':')}
            </li>
            <li className="border-b border-white/5 pb-2">
              <span className="text-[#FF8800] font-black mr-2">{t('legal.cookies.analytics').split(':')[0]}:</span>
              {t('legal.cookies.analytics').split(':').slice(1).join(':')}
            </li>
            <li className="border-b border-white/5 pb-2">
              <span className="text-[#FF8800] font-black mr-2">{t('legal.cookies.marketing').split(':')[0]}:</span>
              {t('legal.cookies.marketing').split(':').slice(1).join(':')}
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em]">{t('legal.cookies.s3Title')}</h2>
          <p>{t('legal.cookies.s3Body')}</p>
        </section>
      </div>
    </LegalLayout>
  );
};

export const AboutView: React.FC = () => {
  const { t } = useLanguage();
  return (
    <LegalLayout title={t('legal.about.title')} configKey="about">
      <div className="space-y-8">
        <section>
          <p className="text-white text-xl leading-relaxed font-bold italic">{t('legal.about.quote')}</p>
          <p className="mt-6">{t('legal.about.intro')}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em]">{t('legal.about.offersTitle')}</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>{t('legal.about.offer1')}</strong></li>
            <li><strong>{t('legal.about.offer2')}</strong></li>
            <li><strong>{t('legal.about.offer3')}</strong></li>
            <li><strong>{t('legal.about.offer4')}</strong></li>
            <li><strong>{t('legal.about.offer5')}</strong></li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em]">{t('legal.about.brainTitle')}</h2>
          <p>{t('legal.about.brainBody')}</p>
          <p className="mt-4 text-slate-400">
            <Link to="/blog" className="text-[#FF8800] font-bold hover:underline">{t('nav.blog')}</Link>
            {' · '}
            <Link to="/play" className="text-[#FF8800] font-bold hover:underline">{t('nav.play')}</Link>
          </p>
        </section>
        <section>
          <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
              <h3 className="text-[#FF8800] font-black uppercase text-sm tracking-widest mb-2">{t('legal.about.pmLabel')}</h3>
              <p className="text-white text-lg font-bold">{t('legal.about.pmName')}</p>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
              <h3 className="text-[#FF8800] font-black uppercase text-sm tracking-widest mb-2">{t('legal.about.devLabel')}</h3>
              <p className="text-white text-lg font-bold">{t('legal.about.devName')}</p>
            </div>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
};

export const TermsView: React.FC = () => {
  const { t } = useLanguage();
  return (
    <LegalLayout title={t('legal.terms.title')} configKey="terms">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF8800]" /> {t('legal.terms.s1Title')}
          </h2>
          <p>{t('legal.terms.s1Body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF8800]" /> {t('legal.terms.s2Title')}
          </h2>
          <p>{t('legal.terms.s2Body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF8800]" /> {t('legal.terms.s3Title')}
          </h2>
          <p>{t('legal.terms.s3Body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF8800]" /> {t('legal.terms.s4Title')}
          </h2>
          <p>{t('legal.terms.s4Body')}</p>
        </section>
      </div>
    </LegalLayout>
  );
};

export const ContactView: React.FC = () => {
  const { t } = useLanguage();
  return (
    <LegalLayout title={t('legal.contact.title')} configKey="contact">
      <div className="space-y-8">
        <section className="bg-slate-900 p-10 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8800]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#FF8800]/10 transition-colors"></div>

          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-3">
            <Mail className="w-6 h-6 text-[#FF8800]" /> {t('legal.contact.supportTitle')}
          </h2>

          <div className="space-y-8">
            <div>
              <p className="mb-4 text-slate-400">{t('legal.contact.intro')}</p>
              <a href="mailto:info@numbergame.it" className="text-2xl md:text-3xl font-black font-['Orbitron'] text-[#FF8800] hover:scale-105 transition-transform inline-block break-all border-b-2 border-transparent hover:border-[#FF8800]">
                info@numbergame.it
              </a>
            </div>

            <div className="pt-8 border-t border-white/5">
              <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-sm italic">{t('legal.contact.customDevTitle')}</h3>
              <p className="text-slate-400 leading-relaxed">{t('legal.contact.customDevBody')}</p>
              <p className="mt-4 text-[#FF8800] font-bold">{t('legal.contact.customDevCta')}</p>
            </div>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
};
