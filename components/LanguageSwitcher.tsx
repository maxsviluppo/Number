import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/types';

interface LanguageSwitcherProps {
  className?: string;
  dropdownDirection?: 'up' | 'down';
  onToggle?: () => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  dropdownDirection = 'down',
  onToggle,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const dropdownClass =
    dropdownDirection === 'up'
      ? 'absolute right-0 bottom-full mb-2'
      : 'absolute right-0 top-full mt-2';

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onPointerDown={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
          onToggle?.();
        }}
        className="relative w-24 h-24 bg-transparent flex items-center justify-center active:scale-95 transition-all hover:scale-110 group"
        title={t('game.language')}
        aria-label={t('game.language')}
      >
        <img
          src="/ottagonocristallo.png"
          alt="Language"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 transition-all duration-300"
          style={{
            filter: language === 'en' ? 'hue-rotate(190deg) saturate(1.35)' : 'hue-rotate(95deg) saturate(1.2)',
          }}
        />
        <span className="relative z-20 text-3xl drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]" aria-hidden="true">
          {language === 'it' ? '🇮🇹' : '🇬🇧'}
        </span>
      </button>

      {open && (
        <div
          className={`${dropdownClass} z-[4000] min-w-[160px] rounded-2xl border border-white/15 bg-black/85 p-2 shadow-2xl backdrop-blur-xl animate-screen-in`}
        >
          {(['it', 'en'] as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                setLanguage(lang);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left font-orbitron text-xs font-black uppercase tracking-widest transition-all ${
                language === lang ? 'bg-[#FF8800] text-black' : 'text-white hover:bg-white/10'
              }`}
            >
              <span className="text-xl">{lang === 'it' ? '🇮🇹' : '🇬🇧'}</span>
              <span>{lang === 'it' ? t('game.italian') : t('game.english')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
