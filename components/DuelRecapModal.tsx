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
    onExit
}) => {
    const [imReady, setImReady] = useState(false);
    const [opponentReady, setOpponentReady] = useState(false);

    const amIP1 = matchData?.player1_id === currentUser.id;
    const isWinner = matchData?.winner_id === currentUser.id;

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
                            {isWinner ? "VITTORIA ASSOLUTA" : "SCOPE ALLIANCE"}
                        </p>
                    )}
                </div>

                {/* PLAYERS COMPARISON */}
                <div className="relative z-10 flex-1 p-8 flex flex-col sm:flex-row items-center justify-between gap-8">

                    {/* ME */}
                    <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${iWonRound ? 'scale-110' : 'opacity-80 scale-95'}`}>
                        <div className={`w-24 h-24 rounded-full border-[4px] flex items-center justify-center shadow-xl relative
                            ${iWonRound ? 'border-green-500 bg-green-500/10' : 'border-slate-600 bg-slate-800'}`}>
                            <span className="font-orbitron font-black text-4xl text-white">{myScore}</span>
                            {iWonRound && <Trophy className="absolute -top-6 text-yellow-400 drop-shadow-lg animate-bounce" size={32} />}
                        </div>
                        <div className="text-center">
                            <h3 className="text-white font-black uppercase text-sm tracking-wider">TU</h3>
                            <p className="text-[#FF8800] text-xs font-bold">Lvl {currentUser.user_metadata?.max_level || 1}</p>
                        </div>
                        {isFinal ? (
                            isWinner ?
                                <span className="text-green-400 font-bold uppercase text-xs border border-green-400/30 px-2 py-1 rounded">+XP EARNED</span> :
                                <span className="text-red-500 font-bold uppercase text-xs">NO POINTS</span>
                        ) : (
                            <div className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase border transition-all flex items-center gap-2
                                ${imReady ? 'bg-green-500 text-slate-900 border-green-500' : 'bg-slate-800 text-slate-500 border-slate-600'}`}>
                                {imReady ? <><CheckCircle2 size={12} /> PRONTO</> : <><Clock size={12} /> IN ATTESA</>}
                            </div>
                        )}
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center">
                        <span className="font-black font-orbitron text-4xl text-white/20 italic">VS</span>
                        {!isFinal && <div className="text-[10px] text-slate-500 uppercase font-bold mt-2">Best of {matchData.mode === 'blitz' ? '5 Rounds' : '1 Match'}</div>}
                    </div>

                    {/* OPPONENT */}
                    <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${!iWonRound ? 'scale-110' : 'opacity-80 scale-95'}`}>
                        <div className={`w-24 h-24 rounded-full border-[4px] flex items-center justify-center shadow-xl relative
                            ${!iWonRound ? 'border-green-500 bg-green-500/10' : 'border-slate-600 bg-slate-800'}`}>
                            <span className="font-orbitron font-black text-4xl text-white">{opponentScore}</span>
                            {!iWonRound && <Trophy className="absolute -top-6 text-yellow-400 drop-shadow-lg animate-bounce" size={32} />}
                        </div>
                        <div className="text-center">
                            <h3 className="text-white font-black uppercase text-sm tracking-wider">{amIP1 ? matchData.player2?.username : matchData.player1?.username || 'Avversario'}</h3>
                            <p className="text-slate-500 text-xs font-bold">Rivale</p>
                        </div>
                        {isFinal ? (
                            !isWinner ?
                                <span className="text-green-400 font-bold uppercase text-xs border border-green-400/30 px-2 py-1 rounded">WINNER</span> :
                                <span className="text-slate-500 font-bold uppercase text-xs">DEFEATED</span>
                        ) : (
                            <div className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase border transition-all flex items-center gap-2
                                ${opponentReady ? 'bg-green-500 text-slate-900 border-green-500' : 'bg-slate-800 text-slate-500 border-slate-600'}`}>
                                {opponentReady ? <><CheckCircle2 size={12} /> PRONTO</> : <><Clock size={12} /> ...</>}
                            </div>
                        )}
                    </div>

                </div>

                {/* FOOTER ACTIONS */}
                <div className="relative z-10 bg-slate-950 p-6 flex flex-col gap-3 border-t border-white/10">
                    {isFinal ? (
                        <div className="flex gap-4">
                            <button onClick={onExit} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-orbitron font-black uppercase tracking-widest transition-all active:scale-95 border-2 border-slate-600 flex items-center justify-center gap-2">
                                <Home size={18} /> TORNA ALLA HOME
                            </button>
                            {/* Rematch could be implemented here */}
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
