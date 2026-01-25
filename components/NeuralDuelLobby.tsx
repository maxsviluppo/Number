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
    const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'error'>('idle');
    const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
    const [statusMsg, setStatusMsg] = useState('');
    const channelRef = useRef<any>(null);

    // Gestione Pulizia
    useEffect(() => {
        return () => {
            if (channelRef.current) (supabase as any).removeChannel(channelRef.current);
        };
    }, []);

    const findMatch = async () => {
        setStatus('searching');
        setStatusMsg(`Scansione rete neurale (${mode === 'blitz' ? 'BLITZ' : 'STANDARD'})...`);
        soundService.playTick(); // Simuliamo suono radar

        try {
            // 1. Cerca partita esistente
            const openMatch = await matchService.findOpenMatch(mode);

            if (openMatch && openMatch.player1_id !== currentUser.id) {
                // TROVATA! Unisciti
                setStatusMsg('Segnale rilevato! Sincronizzazione...');
                const joined = await matchService.joinMatch(openMatch.id, currentUser.id);

                if (joined) {
                    setStatus('found');
                    soundService.playSuccess(); // Suono successo
                    setTimeout(() => {
                        onMatchStart(openMatch.grid_seed, openMatch.id, openMatch.player1_id);
                    }, 1500);
                } else {
                    setStatus('error'); // Qualcuno l'ha presa prima
                    setStatusMsg('Segnale perso (lobby piena). Riprova.');
                }
            } else {
                // 2. Nessuna partita, CREANE UNA
                setStatusMsg('Nessun segnale. Creazione beacon...');
                const seed = Math.random().toString(36).substring(7); // Genera seed casuale
                const newMatch = await matchService.createMatch(currentUser.id, seed, mode);

                if (newMatch) {
                    setCurrentMatch(newMatch);
                    setStatusMsg('In attesa di sfidanti...');

                    // 3. Ascolta quando qualcuno entra (Realtime)
                    channelRef.current = matchService.subscribeToMatch(newMatch.id, (payload) => {
                        if (payload.new.status === 'active' && payload.new.player2_id) {
                            // QUALCUNO È ENTRATO!
                            setStatus('found');
                            soundService.playSuccess();
                            setTimeout(() => {
                                onMatchStart(newMatch.grid_seed, newMatch.id, payload.new.player2_id);
                            }, 1500);
                        }
                    });
                }
            }

        } catch (e) {
            console.error(e);
            setStatus('error');
            setStatusMsg('Errore di connessione al server.');
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-[2rem] max-w-md w-full text-center relative overflow-hidden shadow-2xl">

                {/* Background Decor */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-red-600/20 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(220,38,38,0.4)] border border-red-500/30">
                        {status === 'searching' ? (
                            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                        ) : status === 'found' ? (
                            <Swords className="w-10 h-10 text-green-400 animate-pulse" />
                        ) : (
                            <Swords className="w-10 h-10 text-red-500" />
                        )}
                    </div>

                    <h2 className="text-3xl font-black font-orbitron text-white mb-2 uppercase italic tracking-wider">
                        {mode === 'blitz' ? 'BLITZ ARENA' : 'NEURAL DUEL'}
                    </h2>
                    <p className="text-slate-400 text-sm mb-8 font-mono">
                        {statusMsg || (mode === 'blitz' ? "Best of 5 Rounds (3 Targets/Round)" : "Standard 1vs1 (5 Targets)")}
                    </p>

                    {status === 'idle' && (
                        <button
                            onClick={findMatch}
                            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:scale-105 active:scale-95 transition-all text-white font-orbitron font-black text-lg py-4 rounded-xl shadow-lg shadow-red-900/40 uppercase tracking-widest"
                        >
                            CERCA AVVERSARIO {mode === 'blitz' ? 'BLITZ' : 'STANDARD'}
                        </button>
                    )}

                    {status === 'searching' && (
                        <div className="flex flex-col gap-3 w-full">
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 animate-progressBar w-full origin-left"></div>
                            </div>
                            <button onClick={() => { setStatus('idle'); /* Cleanup logic needed */ onClose(); }} className="text-slate-500 text-xs hover:text-white mt-2">ANNULLA RICERCA</button>
                        </div>
                    )}

                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-600 hover:text-white">
                        <XCircle size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NeuralDuelLobby;

// Add this to index.css or tailwind config for loader animation if not present
// @keyframes progressBar { 0% { transform: scaleX(0); } 50% { transform: scaleX(0.5); } 100% { transform: scaleX(1); } }
