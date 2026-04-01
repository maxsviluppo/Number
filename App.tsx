import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import HomeView from './HomeView';
import BlogView from './BlogView';
import GameView from './GameView';
import BlogPostDetailView from './BlogPostDetailView';
import { PrivacyView, CookieView, AboutView, ContactView, TermsView } from './LegalViews';
import CookieBanner from './components/CookieBanner';
import BottomNav from './components/BottomNav';
import { configService } from './services/supabaseClient';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [remoteConfig, setRemoteConfig] = useState<any>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await configService.getSystemConfig();
        if (config) setRemoteConfig(config);
      } catch (e) {
        console.warn("App: Error loading global config", e);
      }
    };
    loadConfig();
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Helmet>
           {/* Global Google Verification */}
           {remoteConfig?.googleTag && (
             remoteConfig.googleTag.includes('content="') ? (
               <meta name="google-site-verification" content={remoteConfig.googleTag.split('content="')[1].split('"')[0]} />
             ) : (
                <meta name="google-site-verification" content={remoteConfig.googleTag} />
             )
           )}
           
           {/* Global Analytics Snippet */}
           {remoteConfig?.analyticsId && (
             <script async src={`https://www.googletagmanager.com/gtag/js?id=${remoteConfig.analyticsId}`}></script>
           )}
           {remoteConfig?.analyticsId && (
             <script>
               {`
                 window.dataLayer = window.dataLayer || [];
                 function gtag(){dataLayer.push(arguments);}
                 gtag('js', new Date());
                 gtag('config', '${remoteConfig.analyticsId}');
               `}
             </script>
           )}
        </Helmet>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<GameView />} />
          <Route path="/site" element={<HomeView />} />
          <Route path="/play" element={<GameView />} />
          <Route path="/blog" element={<BlogView />} />
          <Route path="/blog/:slug" element={<BlogPostDetailView />} />
          
          <Route path="/about" element={<AboutView />} />
          <Route path="/privacy" element={<PrivacyView />} />
          <Route path="/cookies" element={<CookieView />} />
          <Route path="/terms" element={<TermsView />} />
          <Route path="/contact" element={<ContactView />} />
          
          {/* Fallback */}
          <Route path="*" element={<GameView />} />
        </Routes>
        <CookieBanner />
        <BottomNav />
      </BrowserRouter>
    </HelmetProvider>
  );
};


export default App;


