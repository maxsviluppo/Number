import React, { useState, useEffect, useRef } from 'react';
import { Swords, Loader2, Trophy, XCircle, AlertTriangle } from 'lucide-react';
import { matchService, Match } from '../services/matchService';
import { soundService } from '../services/soundService';
import { authService, supabase } from '../services/supabaseClient';

interface NeuralDuelProps {
    currentUser: any; // User object
    onClose: () => void;
    onMatchStart: (seed: string, matchId: string, opponentId: string) => void;
    mode: 'standard' | 'blitz';
}

const NeuralDuelLobby: React.FC<NeuralDuelProps> = ({ currentUser, onClose, onMatchStart, mode }) => {
    const [matches, setMatches] = useState<any[]>([]);
    const [myHostedMatch, setMyHostedMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(false);
    const channelRef = useRef<any>(null);

    // Initial Fetch & Subscription
    useEffect(() => {
        fetchMatches();

        // Realtime Listener for the Lobby List
        const lobbyChannel = (supabase as any)
            .channel(`lobby_${mode}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'matches', filter: `mode=eq.${mode}` },
                () => {
                    fetchMatches(); // Refresh list on any change
                }
            )
            .subscribe();

        return () => {
            (supabase as any).removeChannel(lobbyChannel);
            if (channelRef.current) (supabase as any).removeChannel(channelRef.current);
            // Cleanup: If I am hosting, delete my match on unmount? 
            // Ideally yes, but tricky if accidental close. Let's rely on manual Cancel or timeout.
        };
    }, [mode]);

    // Cleanup my match if I close properly while hosting
    useEffect(() => {
        return () => {
            // Can't async here easily, but we could try.
            // For now, let user manually cancel or garbage collector handle it.
        };
    }, [myHostedMatch]);

    const fetchMatches = async () => {
        setLoading(true);
        const data = await matchService.getOpenMatches(mode);
        // Filter out my own matches from the "Joinable" list (optional, but good UX)
        // Also remove matches that are not pending (though service filters pending).
        setMatches(data.filter(m => m.player1_id !== currentUser.id));
        setLoading(false);
    };

    const hostMatch = async () => {
        soundService.playUIClick();
        const seed = Math.random().toString(36).substring(7);
        const newMatch = await matchService.createMatch(currentUser.id, seed, mode);
        if (newMatch) {
            setMyHostedMatch(newMatch);
            soundService.playTick(); // Radar sound

            // Listen for opponent joining MY match
            channelRef.current = matchService.subscribeToMatch(newMatch.id, (payload) => {
                if (payload.new.status === 'active' && payload.new.player2_id) {
                    soundService.playSuccess();
                    onMatchStart(newMatch.grid_seed, newMatch.id, payload.new.player2_id);
                }
            });
        } else {
            alert("ERRORE: Impossibile creare la partita. \nPossibili cause:\n1. Problemi di rete.\n2. Permessi Database (RLS).\nControlla che le colonne 'mode' e 'grid_seed' esistano.");
        }
    };

    const joinMatch = async (matchId: string, seed: string, p1Id: string) => {
        soundService.playUIClick();
        const success = await matchService.joinMatch(matchId, currentUser.id);
        if (success) {
            soundService.playSuccess();
            onMatchStart(seed, matchId, p1Id);
        } else {
            soundService.playError();
            // Toast? "Partita non più disponibile"
            fetchMatches();
        }
    };

    const cancelHosting = async () => {
        if (myHostedMatch) {
            soundService.playUIClick();
            await matchService.cancelMatch(myHostedMatch.id);
            if (channelRef.current) (supabase as any).removeChannel(channelRef.current);
            setMyHostedMatch(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-[2rem] w-full max-w-2xl h-[80vh] flex flex-col relative shadow-2xl overflow-hidden">

                {/* Background Decor */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border-2 ${mode === 'blitz' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                            {mode === 'blitz' ? <Swords className="w-6 h-6" /> : <Swords className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black font-orbitron text-white uppercase tracking-wider">
                                {mode === 'blitz' ? 'BLITZ ARENA' : 'SFIDE STANDARD'}
                            </h2>
                            <p className="text-slate-400 text-xs font-mono">
                                {mode === 'blitz' ? "Vinci 3 Round su 5" : "Trova 5 Target"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchMatches} className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg">
                            <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => {
                            if (myHostedMatch) cancelHosting();
                            onClose();
                        }} className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg">
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="relative z-10 flex-grow overflow-y-auto custom-scroll pr-2 mb-6">
                    {myHostedMatch ? (
                        <div className="flex flex-col items-center justify-center h-full animate-fadeIn">
                            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-[#FF8800] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,136,0,0.3)] relative">
                                <div className="absolute inset-0 rounded-full border border-white/20 animate-ping"></div>
                                <Loader2 className="w-10 h-10 text-[#FF8800] animate-spin" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 font-orbitron">IN ATTESA DI SFIDANTI...</h3>
                            <p className="text-slate-400 text-sm mb-8 text-center max-w-xs">
                                La tua sfida è visibile nella lobby. Preparati a combattere.
                            </p>
                            <button
                                onClick={cancelHosting}
                                className="px-8 py-3 bg-slate-800 text-slate-300 border border-slate-600 rounded-xl font-bold text-xs uppercase hover:bg-slate-700 hover:text-white transition-all shadow-lg"
                            >
                                ANNULLA TAVOLO
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {matches.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-60 text-slate-500 gap-4">
                                    <Swords className="w-12 h-12 opacity-20" />
                                    <p className="text-sm font-mono">NESSUNA SFIDA ATTIVA</p>
                                    <p className="text-xs max-w-xs text-center opacity-60">Sii il primo a scendere nell'arena. Crea un tavolo e aspetta un avversario.</p>
                                </div>
                            ) : (
                                matches.map((match) => (
                                    <div key={match.id} className="bg-slate-800/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:bg-slate-800 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10 shadow-inner">
                                                <span className="font-bold text-white text-xs">{(match.player1?.username || 'U').substring(0, 2).toUpperCase()}</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white group-hover:text-[#FF8800] transition-colors">
                                                    {match.player1?.username || 'Sfidante Anonimo'}
                                                </div>
                                                <div className="text-[10px] text-slate-500 uppercase font-black tracking-wide">
                                                    LVL {match.player1?.max_level || 1} • {new Date(match.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => joinMatch(match.id, match.grid_seed, match.player1_id)}
                                            className="bg-white text-slate-900 hover:bg-[#FF8800] hover:text-white px-5 py-2 rounded-lg font-black font-orbitron text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
                                        >
                                            SFIDA
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* BOTTOM ACTION */}
                {!myHostedMatch && (
                    <div className="relative z-10 pt-4 border-t border-white/10">
                        <button
                            onClick={hostMatch}
                            className={`w-full py-5 rounded-xl font-orbitron font-black text-lg uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3
                                ${mode === 'blitz'
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-900/30'
                                    : 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-red-900/30'
                                }
                            `}
                        >
                            <Swords className="w-6 h-6" /> CREA NUOVO TAVOLO
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NeuralDuelLobby;

// Add this to index.css or tailwind config for loader animation if not present
// @keyframes progressBar { 0% { transform: scaleX(0); } 50% { transform: scaleX(0.5); } 100% { transform: scaleX(1); } }
