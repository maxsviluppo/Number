import React, { useState } from 'react';
import { User, Trophy, Award, Lock, X, Star, Zap, Brain, Target, Shield, Sparkles, BookOpen, Crown, Gem, Infinity, Layers, Swords, Camera, Trash2, Home } from 'lucide-react';
import { UserProfile, profileService } from '../services/supabaseClient';
import { BADGES } from '../constants/badges';
import { BOSS_LEVELS } from '../constants/boss_levels';
import { processAvatarImage } from '../utils/imageUtils';
import { Link } from 'react-router-dom';

interface UserProfileModalProps {
    currentUser: any;
    userProfile: UserProfile | null;
    onClose: () => void;
    onUpdate?: (newProfile: UserProfile) => void;
}

// Rank Logic - Expanded for long-term progression
export const getRank = (level: number) => {
    if (level >= 100) return { title: 'Divinità Numerica', icon: Infinity, color: 'text-rose-500', bg: 'bg-rose-500/20' };
    if (level >= 80) return { title: 'Oracolo Supremo', icon: Crown, color: 'text-amber-300', bg: 'bg-amber-500/20' };
    if (level >= 60) return { title: 'Signore del Calcolo', icon: Gem, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20' };
    if (level >= 50) return { title: 'Maestro dell\'Algoritmo', icon: Layers, color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
    if (level >= 40) return { title: 'Architetto Matrix', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (level >= 30) return { title: 'Stratega Quantico', icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/20' };
    if (level >= 20) return { title: 'Entità Trascendente', icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-500/20' };
    if (level >= 15) return { title: 'Visionario', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (level >= 10) return { title: 'Operatore Elite', icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (level >= 5) return { title: 'Hacker Logico', icon: Shield, color: 'text-slate-300', bg: 'bg-slate-500/20' };
    return { title: 'Neofita', icon: BookOpen, color: 'text-slate-500', bg: 'bg-slate-500/10' };
};

const UserProfileModal: React.FC<UserProfileModalProps> = ({ currentUser, userProfile, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'badges' | 'trophies'>('profile');
    const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null); // Local preview state
    const [toastMessage, setToastMessage] = useState<string | null>(null); // Toast state
    const [referralInput, setReferralInput] = useState('');
    const [redeemStatus, setRedeemStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
    const [redeemLoading, setRedeemLoading] = useState(false);

    const handleRedeemReferral = async () => {
        if (!referralInput.trim()) return;
        setRedeemLoading(true);
        setRedeemStatus({ type: 'idle', message: '' });
        
        try {
            const { error } = await profileService.redeemReferral(referralInput.trim().toUpperCase());
            if (error) {
                setRedeemStatus({ type: 'error', message: error.message || 'Codice non valido o già riscattato.' });
            } else {
                setRedeemStatus({ type: 'success', message: 'Codice riscattato! Ricevuti +60 secondi!' });
                setReferralInput('');
                if (onUpdate && userProfile) {
                    const updated = await profileService.getProfile(userProfile.id);
                    if (updated) onUpdate(updated);
                }
            }
        } catch (err) {
            setRedeemStatus({ type: 'error', message: 'Errore durante il riscatto del codice.' });
        } finally {
            setRedeemLoading(false);
        }
    };

    // Fallback data if profile is missing (e.g. offline)
    const stats = userProfile || {
        total_score: 0,
        max_level: 1,
        estimated_iq: 100,
        username: 'Ospite',
        badges: [],
        avatar_url: undefined,
        referral_code: undefined
    };

    const unlockedBadges = stats.badges || [];

    const rank = getRank(stats.max_level);
    const RankIcon = rank.icon;

    // Avatar Upload Handler
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const file = e.target.files[0];
                console.log("Processing avatar...", file.name);

                // Compress/Resize Client Side
                const base64Image = await processAvatarImage(file);

                // Show immediate preview
                setPreviewAvatar(base64Image);

                // OPTIMISTIC UPDATE
                if (userProfile) {
                    // Update Local State (would be better if passed from parent setter, but we mock display for now)
                    // In a real app, call: await profileService.updateProfile({ id: userProfile.id, avatar_url: base64Image });
                    // For now, let's assume we can update it or just show it:
                    console.log("Avatar processed (length):", base64Image.length);

                    // SAVE TO DB (Base64 string in avatar_url for now - assuming column supports long text or we are testing)
                    // If supabase storage is not set, this might fail if string is too big, but we capped it at ~20-50kb.
                    await profileService.updateProfile({ id: userProfile.id, avatar_url: base64Image });
                    // Update Parent State to reflect changes everywhere immediately
                    if (onUpdate) {
                        onUpdate({ ...userProfile, avatar_url: base64Image });
                    }

                    // Show Toast
                    setToastMessage("Foto aggiornata con successo!");
                    setTimeout(() => setToastMessage(null), 3000);
                }
            } catch (err) {
                console.error("Avatar error:", err);
                setToastMessage("Errore caricamento foto.");
                setTimeout(() => setToastMessage(null), 3000);
            }
        }
    };

    const handleRemoveAvatar = async () => {
        if (!userProfile) return;
        setPreviewAvatar(null); // Clear preview
        stats.avatar_url = undefined; // Clear Optimistic

        try {
            await profileService.updateProfile({ id: userProfile.id, avatar_url: null as any }); // Send null to DB
            if (onUpdate) onUpdate({ ...userProfile, avatar_url: undefined });
            setToastMessage("Foto rimossa.");
            setTimeout(() => setToastMessage(null), 3000);
        } catch (e) { console.error("Remove Avatar Fail", e); }
    };

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 modal-overlay bg-black/80 backdrop-blur-sm" onPointerDown={(e) => { e.stopPropagation(); onClose(); }}>

            {/* TOAST NOTIFICATION */}
            {toastMessage && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[6000] px-6 py-3 bg-green-500 text-white rounded-full shadow-2xl font-bold text-sm animate-bounce flex items-center gap-2">
                    <Sparkles size={16} /> {toastMessage}
                </div>
            )}

            <div className="bg-slate-900 border-[3px] border-slate-700 w-full max-w-lg h-[80vh] rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden" onPointerDown={e => e.stopPropagation()}>
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

                {/* Header */}
                <div className="relative z-10 p-6 pb-2 flex justify-between items-center bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-[3px] border-[#FF8800] bg-slate-800 flex items-center justify-center overflow-hidden shadow-lg relative group">
                            {(previewAvatar || stats.avatar_url) ? (
                                <img src={previewAvatar || stats.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User size={32} className="text-white" />
                            )}

                            {currentUser && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                    <label className="cursor-pointer p-1 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                                        <Camera size={16} className="text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                    </label>

                                    {(previewAvatar || stats.avatar_url) && (
                                        <button onPointerDown={(e) => { e.stopPropagation(); handleRemoveAvatar(); }} className="p-1 bg-red-500/20 rounded-full hover:bg-red-500/40 transition-all text-red-400">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black font-orbitron text-white uppercase tracking-wider leading-none">
                                {stats.username}
                             </h2>
                            <div className={`flex items-center gap-2 mt-2 px-3 py-1 rounded-lg border border-white/10 ${rank.bg} w-fit`}>
                                <RankIcon size={12} className={rank.color} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${rank.color}`}>{rank.title}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        <Link
                            to="/site"
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-black/20 hover:bg-[#FF8800]/25 flex items-center justify-center text-[#FF8800] hover:text-white transition-all mr-2"
                            title="Torna alla Home del Sito"
                        >
                            <Home size={20} />
                        </Link>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/20 hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="relative z-10 px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3 px-2 rounded-xl font-black font-orbitron uppercase text-[10px] tracking-wider transition-all border-2 min-w-[80px]
                            ${activeTab === 'profile' ? 'bg-[#FF8800] border-[#FF8800] text-white shadow-lg scale-105' : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500'}`}
                    >
                        Profilo
                    </button>
                    <button
                        onClick={() => setActiveTab('badges')}
                        className={`flex-1 py-3 px-2 rounded-xl font-black font-orbitron uppercase text-[10px] tracking-wider transition-all border-2 min-w-[80px]
                            ${activeTab === 'badges' ? 'bg-purple-600 border-purple-500 text-white shadow-lg scale-105' : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500'}`}
                    >
                        Badge
                    </button>
                    <button
                        onClick={() => setActiveTab('trophies')}
                        className={`flex-1 py-3 px-2 rounded-xl font-black font-orbitron uppercase text-[10px] tracking-wider transition-all border-2 min-w-[80px]
                            ${activeTab === 'trophies' ? 'bg-amber-500 border-amber-400 text-white shadow-lg scale-105' : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500'}`}
                    >
                        Trofei
                    </button>
                </div>

                {/* Content Area */}
                <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6 custom-scroll">

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-4 animate-fadeIn">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2">
                                    <Brain className="text-pink-500 w-8 h-8" />
                                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">QI Stimato</span>
                                    <span className="text-3xl font-black font-orbitron text-white">{stats.estimated_iq}</span>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2">
                                    <Target className="text-cyan-500 w-8 h-8" />
                                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Max Level</span>
                                    <span className="text-3xl font-black font-orbitron text-white">{stats.max_level}</span>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 col-span-2">
                                    <Zap className="text-yellow-500 w-8 h-8" />
                                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Punteggio Totale</span>
                                    <span className="text-4xl font-black font-orbitron text-white">{stats.total_score.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Account Info */}
                            <div className="mt-6 p-4 bg-slate-800/30 rounded-2xl border border-white/5">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Shield size={16} className="text-slate-400" />
                                    Account Details
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Username</span>
                                        <span className="text-slate-300 font-mono">{stats.username}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">ID Utente</span>
                                        <span className="text-slate-600 font-mono text-xs">{stats.id ? stats.id.substring(0, 8) + '...' : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Stato</span>
                                        <span className="text-green-500 font-bold text-xs uppercase bg-green-500/10 px-2 py-1 rounded">Online</span>
                                    </div>
                                </div>
                            </div>

                            {/* Riscatta Codice Referral */}
                            {(!stats.referred_by) && (
                                <div className="mt-6 p-4 bg-slate-800/30 rounded-2xl border border-white/5">
                                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                        <Gift size={16} className="text-[#FF8800]" />
                                        Hai un Codice Amico?
                                    </h3>
                                    <p className="text-slate-400 text-xs mb-3">Inserisci il codice di chi ti ha invitato per ricevere subito 60 secondi di bonus extra!</p>
                                    
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={referralInput}
                                            onChange={(e) => setReferralInput(e.target.value)}
                                            placeholder="Esempio: NUM-XYZ123"
                                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono text-white placeholder-slate-600 focus:border-[#FF8800] focus:outline-none"
                                            disabled={redeemLoading}
                                        />
                                        <button
                                            onClick={handleRedeemReferral}
                                            disabled={redeemLoading || !referralInput.trim()}
                                            className="bg-[#FF8800] hover:bg-[#FF8800]/80 disabled:opacity-50 text-black font-black text-xs px-4 py-2 rounded-xl transition-all font-orbitron uppercase"
                                        >
                                            {redeemLoading ? '...' : 'Riscatta'}
                                        </button>
                                    </div>

                                    {redeemStatus.type !== 'idle' && (
                                        <p className={`text-xs mt-2 font-bold ${redeemStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                            {redeemStatus.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Referral Section */}
                            {stats.referral_code && (
                                <div className="mt-6 p-4 bg-indigo-900/30 rounded-2xl border border-indigo-500/30 text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 bg-indigo-600 rounded-bl-xl text-[10px] font-black text-white">
                                        BONUS: {stats.bonus_charges || 0} CARICHE
                                    </div>
                                    <h3 className="text-white font-bold mb-2 flex items-center justify-center gap-2 mt-2">
                                        <Sparkles size={16} className="text-indigo-400" />
                                        Invita e Guadagna 60s
                                    </h3>
                                    <p className="text-slate-400 text-xs mb-4">Condividi il tuo codice con gli amici. Quando si registrano, entrambi riceverete un Bonus di 60 secondi!</p>
                                    
                                    <div className="flex items-center justify-between bg-slate-900/80 rounded-xl p-3 border border-indigo-500/20 mb-4">
                                        <span className="text-slate-500 text-xs uppercase tracking-widest font-bold">Il tuo codice</span>
                                        <span className="text-indigo-400 font-orbitron font-black tracking-wider">{stats.referral_code}</span>
                                    </div>

                                    <button 
                                        onClick={() => {
                                            const link = `https://www.numbergame.it/invite?ref=${stats.referral_code}`;
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: 'Gioca a NumberGame!',
                                                    text: 'Ricevi 60s EXTRA! Usa il mio link per ricevere subito 60 secondi di bonus extra nella tua prima partita!',
                                                    url: link,
                                                }).catch(console.error);
                                            } else {
                                                navigator.clipboard.writeText(link);
                                                setToastMessage('Link copiato negli appunti!');
                                                setTimeout(() => setToastMessage(null), 3000);
                                            }
                                        }}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl text-white font-black font-orbitron uppercase text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                                    >
                                        CONDIVIDI IL LINK
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* BADGES TAB */}
                    {activeTab === 'badges' && (
                        <div className="grid grid-cols-3 gap-3 animate-fadeIn">
                            {BADGES.map((badge) => {
                                const isUnlocked = unlockedBadges.includes(badge.id);
                                const Icon = badge.icon;

                                return (
                                    <button
                                        key={badge.id}
                                        onClick={() => setSelectedBadge(selectedBadge === badge.id ? null : badge.id)}
                                        className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 relative transition-all duration-300
                                            ${isUnlocked
                                                ? `bg-gradient-to-br ${badge.bgGradient} border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-105 opacity-100`
                                                : 'bg-slate-800/50 border-white/5 opacity-50 grayscale hover:opacity-70'
                                            }
                                        `}
                                    >
                                        <Icon size={24} className={isUnlocked ? badge.color : 'text-slate-500'} />

                                        {/* Lock Overlay */}
                                        {!isUnlocked && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                                                <Lock size={12} className="text-slate-400" />
                                            </div>
                                        )}

                                        {/* Info Overlay (Click) */}
                                        {selectedBadge === badge.id && (
                                            <div className="absolute inset-0 bg-slate-900/95 z-20 flex flex-col items-center justify-center p-2 text-center rounded-xl animate-fadeIn">
                                                <span className={`text-[10px] font-black uppercase ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>{badge.title}</span>
                                                <span className="text-[8px] text-slate-400 leading-tight mt-1">{badge.description}</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* TROPHIES TAB */}
                    {activeTab === 'trophies' && (
                        <div className="flex flex-col items-center justify-center h-64 text-center animate-fadeIn">
                            <Trophy size={48} className="text-slate-700 mb-4" />
                            <h3 className="text-slate-300 font-orbitron font-bold uppercase mb-2">Sala dei Trofei</h3>
                            <p className="text-slate-500 text-xs px-8">Partecipa ai Tornei e agli Eventi Speciali per sbloccare coppe esclusive.</p>
                            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl max-w-xs">
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Prossimo Torneo</span>
                                <p className="text-white font-black font-orbitron text-sm mt-1">COMING SOON</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
