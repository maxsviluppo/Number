import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Zap, Trophy, Play, Info, Shield, MessageSquare, ChevronRight, Clock, User, ArrowRight, Menu, X } from 'lucide-react';

import { BLOG_POSTS } from './constants/blog_posts';

import { APP_CONFIG } from './constants';

const BlogView: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.title = APP_CONFIG.seo.blog.title;
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
          <Link to="/site" className="hover:text-white transition-colors">Home</Link>
          <Link to="/play" className="hover:text-[#FF8800] transition-colors">Gioca</Link>
          <Link to="/blog" className="text-white border-b border-white transition-colors">Blog</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/play" className="hidden sm:block bg-[#FF8800] text-black px-6 py-2 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all">
            GIOCA ORA
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
            <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800] border-b border-white/5 pb-4 text-white">BLOG</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800] border-b border-white/5 pb-4">ABOUT</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800] border-b border-white/5 pb-4">CONTATTI</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black font-['Orbitron'] mb-6">
            Approfondimenti <span className="text-[#FF8800]">Neurali</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Esplora il mondo della logica, della matematica e del potenziamento cognitivo attraverso i nostri articoli curati da esperti.
          </p>
      </section>

      {/* Blog Grid */}
      <section className="py-12 px-6 max-w-6xl mx-auto w-full flex-grow">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           {BLOG_POSTS.map(post => (
             <article key={post.id} className="group flex flex-col bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden hover:border-[#FF8800]/50 transition-all shadow-xl hover:-translate-y-2">
                <div className="relative aspect-[4/3] overflow-hidden">
                   <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest">
                      Neurologia
                   </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                   <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.date}</span>
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {post.author}</span>
                   </div>
                   <h3 className="text-xl font-bold mb-4 font-['Orbitron'] leading-tight group-hover:text-[#FF8800] transition-colors">
                      {post.title}
                   </h3>
                   <p className="text-slate-400 text-sm mb-6 line-clamp-3">
                      {post.excerpt}
                   </p>
                   <Link to={`/blog/${post.slug}`} className="mt-auto flex items-center gap-2 text-[#FF8800] font-black text-xs uppercase tracking-widest group/link">
                      Leggi Articolo <ArrowRight className="w-4 h-4 translate-x-0 group-hover/link:translate-x-2 transition-transform" />
                   </Link>
                </div>
             </article>
           ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-slate-950 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#FF8800] rounded flex items-center justify-center font-black text-black italic text-xs">N</div>
              <span className="font-['Orbitron'] font-black tracking-tighter text-lg text-white">numbergame.it</span>
           </div>
           <div className="flex gap-8 text-slate-500 text-sm">
             <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
             <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
             <Link to="/terms" className="hover:text-white transition-colors">Termini</Link>
             <Link to="/about" className="hover:text-white transition-colors">Chi Siamo</Link>
             <Link to="/contact" className="hover:text-white transition-colors">Contatti</Link>
           </div>
            <div className="text-slate-600 text-[10px] font-mono">
               © 2026 GIULINCY SRL
            </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogView;
