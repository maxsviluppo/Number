import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Swords, Loader2, Trophy, XCircle, AlertTriangle, User, Play, Ghost, Eye, Radio } from 'lucide-react';
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
    const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);
    const [myHostedMatch, setMyHostedMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(false);
    const [pendingChallenge, setPendingChallenge] = useState<any | null>(null); // Stato per la conferma sfida
    const channelRef = useRef<any>(null);

    const fetchMatches = useCallback(async () => {
        setLoading(true);
        const data = await matchService.getOpenMatches(mode);
        setMatches(data);
        setLoading(false);
    }, [mode]);

    const cleanupMyMatch = useCallback(async () => {
        if (myHostedMatch) {
            await matchService.cancelMatch(myHostedMatch.id);
            setMyHostedMatch(null);
        }
    }, [myHostedMatch]);

    // Track Presence for Observers
    useEffect(() => {
        const lobbyChannel = (supabase as any)
            .channel(`lobby_presence_${mode}`, {
                config: { presence: { key: currentUser.id } }
            })
            .on('presence', { event: 'sync' }, () => {
                const state = lobbyChannel.presenceState();
                const players = Object.values(state).map((presence: any) => presence[0]);
                setOnlinePlayers(players);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
                fetchMatches();
            })
            .subscribe(async (status: string) => {
                if (status === 'SUBSCRIBED') {
                    await lobbyChannel.track({
                        id: currentUser.id,
                        username: currentUser.user_metadata?.username || 'Guerriero',
                        level: currentUser.user_metadata?.max_level || 1,
                        joined_at: new Date().toISOString()
                    });
                }
            });

        fetchMatches();
        const intervalId = setInterval(fetchMatches, 5000);

        return () => {
            clearInterval(intervalId);
            (supabase as any).removeChannel(lobbyChannel);
        };
    }, [mode, currentUser, fetchMatches]);

    const hostMatch = async () => {
        if (myHostedMatch) return;
        soundService.playUIClick();
        const seed = Math.random().toString(36).substring(7);
        const newMatch = await matchService.createMatch(currentUser.id, seed, mode);
        if (newMatch) {
            setMyHostedMatch(newMatch);
            channelRef.current = matchService.subscribeToMatch(newMatch.id, (payload) => {
                if (payload.new.status === 'active' && payload.new.player2_id) {
                    onMatchStart(newMatch.grid_seed, newMatch.id, payload.new.player2_id);
                }
            });
        }
    };

    const joinMatch = async (matchId: string, seed: string, p1Id: string) => {
        setPendingChallenge(null);
        soundService.playUIClick();
        if (myHostedMatch) {
            await cleanupMyMatch();
        }

        const success = await matchService.joinMatch(matchId, currentUser.id);
        if (success) {
            soundService.playSuccess();
            onMatchStart(seed, matchId, p1Id);
        } else {
            soundService.playError();
            fetchMatches();
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-[2rem] w-full max-w-2xl h-[85vh] flex flex-col relative shadow-2xl overflow-hidden">

                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border-2 ${mode === 'blitz' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                            <Swords className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black font-orbitron text-white uppercase tracking-wider leading-none mb-1">
                                {mode === 'blitz' ? 'BLITZ ARENA' : 'NEURAL LOBBY'}
                            </h2>
                            <div className="flex gap-2 items-center">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">MODE: {mode}</span>
                                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest animate-pulse">Live</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchMatches} className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg active:scale-95 border border-white/5">
                            <span className="text-[10px] font-bold uppercase hidden sm:block">Aggiorna</span>
                            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={async () => {
                            await cleanupMyMatch();
                            onClose();
                        }} className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/5">
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="relative z-10 flex-grow overflow-y-auto custom-scroll pr-2 mb-6 space-y-4">
                    {/* SEZIONE 1: PARTITE (ATTESA / SFIDA) */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Partite in Corso</span>
                        </div>

                        {matches.filter(m => m.player1_id !== currentUser.id).length === 0 && (
                            <div className="py-4 text-center border border-dashed border-white/5 rounded-xl opacity-40 italic text-[10px] uppercase">Nessuna sfida attiva</div>
                        )}

                        {matches.map((match) => {
                            const isBusy = match.status === 'active';
                            if (match.player1_id === currentUser.id) return null;

                            return (
                                <div
                                    key={match.id}
                                    onClick={() => !isBusy && setPendingChallenge(match)}
                                    className={`p-4 rounded-2xl flex items-center justify-between transition-all border group
                                    ${isBusy
                                            ? 'bg-slate-900/40 border-slate-800 opacity-80 cursor-not-allowed'
                                            : 'bg-green-500/5 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.05)] cursor-pointer hover:border-green-500/50 hover:bg-green-500/10 active:scale-[0.98]'}`}>

                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2
                                                ${isBusy ? 'bg-slate-800 border-red-500/30' : 'bg-green-500/10 border-green-500/50 group-hover:border-green-500'}`}>
                                                {isBusy ? <Swords className="text-red-500" size={20} /> : <Play className="text-green-500" size={20} />}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900
                                                ${isBusy ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 group-hover:text-green-400 transition-colors">
                                                {match.player1?.username || 'Player'}
                                            </div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                                                LVL {match.player1?.max_level || 1} • {isBusy ? "Partita avviata" : "In attesa di sfidanti"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        {isBusy ? (
                                            <span className="text-[9px] bg-red-600 font-black text-white px-2 py-0.5 rounded shadow-lg uppercase tracking-widest border border-red-400/30">IN SFIDA</span>
                                        ) : (
                                            <span className="text-[9px] bg-green-500 font-black text-slate-950 px-2 py-0.5 rounded shadow-lg uppercase tracking-widest animate-pulse">PRONTO</span>
                                        )}
                                        <div className="text-[8px] text-slate-600 font-bold uppercase">{isBusy ? "Occupato" : "Clicca per sfidare"}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* SEZIONE 2: OSSERVATORI (ONLINE) */}
                    <div className="space-y-3 pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-3 h-3 text-cyan-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Spettatori in Lobby</span>
                        </div>

                        {onlinePlayers.filter(p => !matches.some(m => m.player1_id === p.id) && p.id !== currentUser.id).length === 0 && (
                            <p className="text-[10px] text-slate-600 italic text-center py-2 uppercase">Nessun osservatore attivo</p>
                        )}

                        {onlinePlayers.map((player) => {
                            if (matches.some(m => m.player1_id === player.id) || player.id === currentUser.id) return null;

                            return (
                                <div key={player.id} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between opacity-70">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center">
                                            <Eye className="text-cyan-500/50" size={16} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-300 uppercase">{player.username}</div>
                                            <span className="text-[8px] text-cyan-500/60 font-black uppercase tracking-tighter">OSSERVATORE</span>
                                        </div>
                                    </div>
                                    <div className="text-[8px] text-slate-600 font-mono">CONNESSO</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col gap-3">
                    {myHostedMatch ? (
                        <div className="flex items-center justify-between bg-white/5 border border-green-500/30 p-3 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                                <span className="text-[11px] font-black text-white uppercase tracking-wider">Il tuo tavolo è Online</span>
                            </div>
                            <button onClick={cleanupMyMatch} className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase">Chiudi Tavolo</button>
                        </div>
                    ) : (
                        <button
                            onClick={hostMatch}
                            className={`w-full py-4 rounded-xl font-orbitron font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 border-2 border-white
                                ${mode === 'blitz' ? 'bg-orange-600' : 'bg-red-600'}`}
                        >
                            <Play size={16} fill="white" /> APRI TAVOLO (IN ATTESA)
                        </button>
                    )}

                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl justify-center">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_6px_#06b6d4]"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Il tuo stato: <span className="text-cyan-400">{myHostedMatch ? 'IN ATTESA' : 'OSSERVATORE'}</span>
                        </span>
                    </div>
                </div>

                {/* TOAST DI CONFERMA SFIDA */}
                {pendingChallenge && (
                    <div className="absolute inset-0 z-50 flex items-end justify-center p-6 bg-black/40 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-slate-900 border-2 border-green-500/50 p-6 rounded-[2rem] w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(34,197,94,0.2)] animate-slideUp">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center animate-bounce-subtle">
                                    <Swords className="text-green-500" size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black font-orbitron text-white uppercase tracking-wider">CONFERMI SFIDA?</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Stai per sfidare <span className="text-green-400 font-bold">{pendingChallenge.player1?.username || 'Guerriero'}</span>.
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full mt-2">
                                    <button
                                        onClick={() => setPendingChallenge(null)}
                                        className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest border border-slate-700 hover:bg-slate-700 transition-all"
                                    >
                                        ANNULLA
                                    </button>
                                    <button
                                        onClick={() => joinMatch(pendingChallenge.id, pendingChallenge.grid_seed, pendingChallenge.player1_id)}
                                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(22,163,74,0.4)] hover:bg-green-500 transition-all"
                                    >
                                        SI, SFIDA!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NeuralDuelLobby;
