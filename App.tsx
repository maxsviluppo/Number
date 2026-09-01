import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import HomeView from './HomeView';
import BlogView from './BlogView';
import GameView from './GameView';
import InviteView from './InviteView';
import BlogPostDetailView from './BlogPostDetailView';
import AdminView from './AdminView';
import { PrivacyView, CookieView, AboutView, ContactView, TermsView } from './LegalViews';
import CookieBanner from './components/CookieBanner';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './i18n/LanguageContext';
import { configService } from './services/supabaseClient';

const isNativeApp = Capacitor.isNativePlatform();

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// CATCH REFERRAL LINK BEFORE REACT ROUTER INITIALIZES (Anti-redirect safeguard)
try {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref') || params.get('code');
  if (ref) {
    localStorage.setItem('pending_referral', ref);
    window.history.replaceState({}, document.title, window.location.pathname);
  }
} catch (e) {
  console.warn("Could not parse referral before init", e);
}

const App: React.FC = () => {
  const [remoteConfig, setRemoteConfig] = useState<any>(null);

  useEffect(() => {
    if (isNativeApp) {
      CapApp.addListener('appUrlOpen', (event: any) => {
        try {
          const parsedUrl = new URL(event.url);
          const joinId = parsedUrl.searchParams.get('joinMatch');
          if (joinId) {
            console.log("🔗 Deep Link match invite caught:", joinId);
            localStorage.setItem('pending_match_invite', joinId);
            window.dispatchEvent(new CustomEvent('deep-link-invite', { detail: joinId }));
          }
          const referralId = parsedUrl.searchParams.get('ref') || parsedUrl.searchParams.get('code');
          if (referralId) {
            console.log("🔗 Deep Link referral caught:", referralId);
            localStorage.setItem('pending_referral', referralId);
          }
        } catch (err) {
          console.warn("Failed to parse appUrlOpen url", err);
        }
      });
    }
  }, []);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await configService.getSystemConfig();
        if (config) {
          setRemoteConfig(config);
          if (config.googleTag) {
            let tagValue = config.googleTag;
            if (tagValue.includes('content="')) {
              tagValue = tagValue.split('content="')[1].split('"')[0];
            }
            let meta = document.querySelector('meta[name="google-site-verification"]');
            if (!meta) {
              meta = document.createElement('meta');
              meta.setAttribute('name', 'google-site-verification');
              document.head.appendChild(meta);
            }
            meta.setAttribute('content', tagValue);
          }
        }
      } catch (e) {
        console.warn("App: Error loading global config", e);
      }
    };
    loadConfig();
  }, []);

  // Android/iOS: solo il gioco a schermo intero — niente sito, menu web o cookie banner
  if (isNativeApp) {
    return (
      <LanguageProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <GameView />
          </ErrorBoundary>
        </BrowserRouter>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ErrorBoundary>
          <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/site" element={<HomeView />} />
          <Route path="/play" element={<GameView />} />
          <Route path="/blog" element={<BlogView />} />
          <Route path="/blog/:slug" element={<BlogPostDetailView />} />
          <Route path="/invite" element={<InviteView />} />
          
          <Route path="/about" element={<AboutView />} />
          <Route path="/privacy" element={<PrivacyView />} />
          <Route path="/cookies" element={<CookieView />} />
          <Route path="/terms" element={<TermsView />} />
          <Route path="/contact" element={<ContactView />} />
          
          <Route path="/amministrazione" element={<AdminView />} />
          <Route path="/admin" element={<AdminView />} />
          
          {/* Fallback */}
          <Route path="*" element={<HomeView />} />
        </Routes>
      </ErrorBoundary>
        <CookieBanner />
        <BottomNav />
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
