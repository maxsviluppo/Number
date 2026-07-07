import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Language } from './types';
import { it } from './it';
import { en } from './en';

const STORAGE_KEY = 'number_game_language';

const getInitialLanguage = (): Language => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'it' || saved === 'en') return saved;
    return navigator.language?.toLowerCase().startsWith('it') ? 'it' : 'en';
  } catch {
    return 'en';
  }
};

type TranslationTree = typeof it;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: TranslationTree;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const dictionaries: Record<Language, TranslationTree> = { it, en };

function resolveKey(tree: TranslationTree, key: string): string {
  const value = key.split('.').reduce<unknown>((obj, part) => {
    if (obj && typeof obj === 'object' && part in (obj as object)) {
      return (obj as Record<string, unknown>)[part];
    }
    return undefined;
  }, tree);
  return typeof value === 'string' ? value : key;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => getInitialLanguage());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {}
    document.documentElement.lang = language;
  }, [language]);

  const translations = dictionaries[language];

  const t = useCallback(
    (key: string) => resolveKey(translations, key),
    [translations]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, translations }),
    [language, setLanguage, t, translations]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function useOptionalLanguage() {
  return useContext(LanguageContext);
}
