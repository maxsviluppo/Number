import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Play, BookOpen, Info, Mail, LayoutDashboard } from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/' },
    { icon: <Play size={20} />, label: 'Gioca', path: '/play' },
    { icon: <BookOpen size={20} />, label: 'Blog', path: '/blog' },
    { icon: <Info size={20} />, label: 'About', path: '/about' },
    { icon: <Mail size={20} />, label: 'Contatti', path: '/contact' },
    { icon: <LayoutDashboard size={20} />, label: 'Admin', path: '/admin' },
  ];

  const allowedPaths = ['/', '/site', '/blog', '/about', '/contact', '/terms', '/privacy', '/cookies'];
  const isAllowed = allowedPaths.some(p => path.startsWith(p));

  if (!isAllowed) return null;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[1000] bg-black/80 backdrop-blur-xl border-t border-white/10 safe-area-bottom md:hidden overflow-hidden h-[72px] transition-transform duration-300 ease-in-out"
      style={{ transform: isVisible ? 'translateY(0)' : 'translateY(100%)' }}
    >
      <div className="flex items-center gap-1 px-4 overflow-x-auto no-scrollbar h-full touch-pan-x">
        {navItems.map((item) => {
          const isActive = path === item.path || (item.path === '/' && path === '/play');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center min-w-[72px] h-full transition-all duration-300 relative group ${
                isActive ? 'text-[#FF8800]' : 'text-slate-400'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-[#FF8800]/10 scale-110' : 'group-active:scale-95'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter transition-all duration-300 ${
                isActive ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-0.5'
              }`}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#FF8800] rounded-b-full shadow-[0_0_15px_#FF8800]"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
