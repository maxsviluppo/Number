import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomeView from './HomeView';
import BlogView from './BlogView';
import GameView from './GameView';
import BlogPostDetailView from './BlogPostDetailView';
import { PrivacyView, CookieView, AboutView, ContactView, TermsView } from './LegalViews';
import CookieBanner from './components/CookieBanner';
import BottomNav from './components/BottomNav';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
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


