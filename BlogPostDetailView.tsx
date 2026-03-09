import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BLOG_POSTS } from './constants/blog_posts';
import { Clock, User, ChevronLeft, Calendar, Tag, Menu, X } from 'lucide-react';

const BlogPostDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find(p => p.slug === slug);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-black font-['Orbitron'] mb-4 text-[#FF8800]">404</h1>
        <p className="text-slate-400 mb-8">Articolo non trovato.</p>
        <Link to="/blog" className="bg-[#FF8800] text-black px-6 py-2 rounded-full font-black text-sm">
          Torna al Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-['Inter']">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-[100] glass-panel border-b border-white/5 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF8800] rounded-lg flex items-center justify-center font-black text-white italic">N</div>
          <Link to="/" className="font-['Orbitron'] font-black tracking-tighter text-xl text-[#FF8800]">number</Link>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/play" className="hover:text-[#FF8800] transition-colors">Gioca</Link>
          <Link to="/blog" className="text-white transition-colors">Blog</Link>
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
          <div className="fixed inset-0 top-[72px] bg-black z-[9999] flex flex-col p-8 gap-6 animate-screen-in md:hidden">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">HOME</Link>
            <Link to="/play" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">GIOCA</Link>
            <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">BLOG</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">ABOUT</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black font-['Orbitron'] hover:text-[#FF8800]">CONTATTI</Link>
          </div>
        )}
      </nav>

      {/* Hero Header */}
      <header className="pt-32 pb-16 px-6 relative">
         <div className="max-w-4xl mx-auto relative z-10">
            <Link to="/blog" className="inline-flex items-center gap-2 text-[#FF8800] font-bold text-sm mb-8 hover:-translate-x-2 transition-transform">
               <ChevronLeft className="w-4 h-4" /> Torna al Blog
            </Link>
            <div className="flex items-center gap-4 text-xs font-black tracking-widest text-[#FF8800] mb-6 uppercase">
               <span className="px-3 py-1 rounded-full bg-[#FF8800]/10 border border-[#FF8800]/20">{post.category}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-['Orbitron'] leading-[1.1] mb-8">
               {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8 text-slate-400 text-sm">
               <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 text-[#FF8800]">
                     <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-bold">{post.author}</div>
                    <div className="text-[10px] uppercase tracking-tighter">Content Creator</div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
               </div>
               <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>10 min lettura</span>
               </div>
            </div>
         </div>
         {/* Background Decor */}
         <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#FF8800]/5 to-transparent"></div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-20">
         <div className="max-w-4xl mx-auto">
            <div className="rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl mb-12 aspect-video">
               <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>

            <article 
               className="prose prose-invert prose-orange max-w-none text-slate-300 text-lg leading-relaxed 
               prose-headings:font-['Orbitron'] prose-headings:font-black prose-headings:text-white prose-headings:border-l-4 prose-headings:border-[#FF8800] prose-headings:pl-6
               prose-strong:text-white prose-strong:font-black
               prose-a:text-[#FF8800] prose-li:marker:text-[#FF8800]"
               dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <div className="mt-16 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
               <div>
                  <h4 className="font-['Orbitron'] font-bold text-white mb-2">Ti è piaciuto l'articolo?</h4>
                  <p className="text-slate-500 text-sm">Condividi la tua passione per i numeri con i tuoi amici.</p>
               </div>
               <div className="flex gap-4">
                  <button className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition-colors">
                     <Tag className="w-5 h-5 text-[#FF8800]" />
                  </button>
                  <Link to="/play" className="bg-[#FF8800] text-black px-8 py-4 rounded-2xl font-black text-sm shadow-[0_0_20px_rgba(255,136,0,0.2)] hover:scale-105 transition-transform">
                     GIOCA ORA
                  </Link>
               </div>
            </div>
         </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-slate-950">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#FF8800] rounded flex items-center justify-center font-black text-black italic text-xs">N</div>
              <span className="font-['Orbitron'] font-black tracking-tighter text-lg text-white">numbergame.it</span>
           </div>
           <div className="flex gap-8 text-slate-500 text-sm font-mono">
              © 2026 NUMBERGAME.IT
           </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPostDetailView;
