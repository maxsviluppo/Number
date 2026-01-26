import React, { useState, useEffect } from 'react';
import { Swords, CheckCircle2, Clock, Trophy, XCircle, RotateCw, Home, User } from 'lucide-react';
import { matchService } from '../services/matchService';
import { soundService } from '../services/soundService';

interface DuelRecapProps {
    matchData: any;
    currentUser: any;
    myScore: number;
    opponentScore: number;
    roundWinnerId: string | null; // Null if waiting, or ID of round winner
    isFinal: boolean; // True if Blitz ended or Standard ended
    onReady: () => void; // Triggered when server says GO
    onExit: () => void;
    onRematch?: () => void;
}

const DuelRecapModal: React.FC<DuelRecapProps> = ({
    matchData,
    currentUser,
    myScore,
    opponentScore,
    isFinal,
    onReady,
    onExit,
    onRematch
}) => {
    const [imReady, setImReady] = useState(false);
    const [opponentReady, setOpponentReady] = useState(false);

    const amIP1 = matchData?.player1_id === currentUser.id;
    const isWinner = matchData?.winner_id === currentUser.id;
    const isAbandonment = matchData?.status === 'finished' &&
        matchData?.winner_id &&
        (matchData.mode === 'standard' ?
            (myScore < 5 && opponentScore < 5) : // Standard requires 5 targets
            (matchData.p1_rounds < 3 && matchData.p2_rounds < 3)); // Blitz rounds

    // Determine Round Winner (local logic for display if not in DB yet)
    // For Blitz: Round Winner is implied by who triggered the round end? 
    // Or we just show scores.
    const iWonRound = myScore > opponentScore;

    useEffect(() => {
        if (!matchData) return;
        setOpponentReady(amIP1 ? matchData.p2_ready : matchData.p1_ready);

        // Auto-trigger if both ready
        if (matchData.p1_ready && matchData.p2_ready && !isFinal) {
            // Give a small delay for visual confirmation
            setTimeout(() => {
                onReady();
            }, 1000);
        }
    }, [matchData, amIP1, isFinal, onReady]);

    const handleReady = async () => {
        if (imReady) return;
        soundService.playUIClick();
        setImReady(true);
        await matchService.setPlayerReady(matchData.id, amIP1, true);
    };

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 modal-overlay bg-black/95 backdrop-blur-xl animate-fadeIn">
            <div className="bg-slate-900 border-[3px] border-[#FF8800] w-full max-w-2xl rounded-[2.5rem] shadow-[0_0_60px_rgba(255,136,0,0.3)] flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

                {/* HEADER */}
                <div className="relative z-10 bg-slate-950/50 p-6 border-b border-white/10 text-center">
                    <h2 className="text-3xl font-black font-orbitron text-white uppercase tracking-wider flex items-center justify-center gap-3">
                        <Swords className="text-[#FF8800] animate-pulse" size={32} />
                        {isFinal ? "DUELLO TERMINATO" : `ROUND ${matchData.current_round} COMPLETATO`}
                    </h2>
                    {isFinal && (
                        <p className={`text-sm font-bold uppercase tracking-widest mt-2 ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
                            {isWinner ? (isAbandonment ? "VITTORIA PER ABBANDONO" : "VITTORIA ASSOLUTA") : (isAbandonment ? "SCONFITTA PER ABBANDONO" : "SCOPE ALLIANCE")}
                        </p>
                    )}
                </div>

                {/* PLAYERS COMPARISON */}
                <div className="relative z-10 flex-1 p-8 flex flex-col sm:flex-row items-center justify-between gap-8">

                    <div className="relative z-10 flex-1 p-8 flex flex-col sm:flex-row items-center justify-between gap-8">

                        {/* ME */}
                        <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${isWinner ? 'scale-110' : 'opacity-80 scale-95'}`}>
                            <div className={`w-28 h-28 rounded-full border-[6px] flex flex-col items-center justify-center shadow-2xl relative
                            ${isWinner ? 'border-[#FF8800] bg-[#FF8800]/10' : 'border-slate-800 bg-slate-900/50'}`}>
                                <span className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1">PUNTI TUOI</span>
                                <span className={`font-orbitron font-black text-4xl ${isWinner ? 'text-[#FF8800]' : 'text-slate-400'}`}>{myScore}</span>
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-black uppercase text-sm tracking-wider">TU</h3>
                            </div>
                            {isFinal && isWinner && (
                                <span className="text-[#FF8800] font-black uppercase text-[10px] bg-[#FF8800]/20 px-3 py-1 rounded-full border border-[#FF8800]/30 animate-pulse">
                                    VITTORIA
                                </span>
                            )}
                        </div>

                        {/* VS */}
                        <div className="flex flex-col items-center">
                            <span className="font-black font-orbitron text-5xl text-white/5 italic">VS</span>
                        </div>

                        {/* OPPONENT */}
                        <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${!isWinner ? 'scale-110' : 'opacity-80 scale-95'}`}>
                            <div className={`w-28 h-28 rounded-full border-[6px] flex flex-col items-center justify-center shadow-2xl relative
                            ${!isWinner ? 'border-green-500 bg-green-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
                                <span className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1">PUNTI AVV</span>
                                <span className={`font-orbitron font-black text-4xl ${!isWinner ? 'text-green-500' : 'text-slate-500'}`}>{opponentScore}</span>
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-black uppercase text-sm tracking-wider">{amIP1 ? matchData.player2?.username : matchData.player1?.username || 'Avversario'}</h3>
                            </div>
                        </div>

                    </div>

                </div>

                {/* FOOTER ACTIONS */}
                <div className="relative z-10 bg-slate-950 p-6 flex flex-col gap-3 border-t border-white/10">
                    {isFinal ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={onExit} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-orbitron font-black uppercase tracking-widest transition-all active:scale-95 border-2 border-slate-600 flex items-center justify-center gap-2">
                                <Home size={18} /> TORNA ALLA LOBBY
                            </button>
                            {!isWinner && (
                                <button
                                    onClick={() => onRematch?.()}
                                    className="flex-1 py-4 bg-[#FF8800] text-white rounded-xl font-orbitron font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 border-2 border-white flex items-center justify-center gap-2 animate-pulse"
                                >
                                    <RotateCw size={18} /> RIVINCITA
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleReady}
                            disabled={imReady}
                            className={`w-full py-5 rounded-xl font-orbitron font-black text-xl uppercase tracking-widest shadow-lg transition-all active:scale-95 border-[3px]
                            ${imReady
                                    ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-default'
                                    : 'bg-green-600 text-white border-white hover:bg-green-500 animate-pulse-slow'}`}
                        >
                            {imReady ? (opponentReady ? "LANCIO ROUND..." : "ATTESA AVVERSARIO...") : "SONO PRONTO"}
                        </button>
                    )}

                    {!isFinal && !imReady && (
                        <button onClick={onExit} className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-red-400 transition-colors mt-2">
                            ABBANDONA SFIDA (SCONFITTA)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DuelRecapModal;
