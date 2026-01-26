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
    onRematchRequest?: () => void;
    isWinnerProp?: boolean; // Override derived logic
}

const DuelRecapModal: React.FC<DuelRecapProps> = ({
    matchData,
    currentUser,
    myScore,
    opponentScore,
    isFinal,
    onReady,
    onExit,
    onRematch,
    onRematchRequest,
    isWinnerProp
}) => {
    // Determine status: Use explicit prop if available, else derive
    const amIP1 = matchData?.player1_id === currentUser.id;
    const derivedWinner = matchData?.winner_id === currentUser.id;
    // Fix: If isWinnerProp is provided (true/false), use it. otherwise use derived.
    const isWinner = isWinnerProp !== undefined ? isWinnerProp : derivedWinner;

    const myRounds = amIP1 ? matchData.p1_rounds : matchData.p2_rounds;
    const oppRounds = amIP1 ? matchData.p2_rounds : matchData.p1_rounds;

    const isAbandonment = matchData?.status === 'finished' &&
        matchData?.winner_id &&
        (matchData.mode === 'standard' ?
            (myRounds < 5 && oppRounds < 5) : // Check Rounds/Targets (5 for Standard)
            (myRounds < 3 && oppRounds < 3)); // 3 for Blitz

    const [rematchRequested, setRematchRequested] = useState(false);

    const handleRematchClick = () => {
        if (onRematchRequest) {
            onRematchRequest();
            setRematchRequested(true);
        }
    };

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 modal-overlay bg-black/95 backdrop-blur-xl animate-fadeIn">
            <div className="bg-slate-900 border-[3px] border-[#FF8800] w-full max-w-2xl rounded-[2.5rem] shadow-[0_0_60px_rgba(255,136,0,0.3)] flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

                {/* HEADER */}
                <div className="relative z-10 bg-slate-950/50 p-6 border-b border-white/10 text-center">
                    <h2 className="text-3xl font-black font-orbitron text-white uppercase tracking-wider flex items-center justify-center gap-3">
                        <Swords className="text-[#FF8800] animate-pulse" size={32} />
                        {isWinner ? "VITTORIA" : "SCONFITTA"}
                    </h2>
                    <p className={`text-sm font-bold uppercase tracking-widest mt-2 ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
                        {isAbandonment ? "PER ABBANDONO" : (isWinner ? "DOMINIO TOTALE" : "BATTO IN RITIRATA")}
                    </p>
                </div>

                {/* SCORES AREA */}
                <div className="relative z-10 flex-1 p-8 flex flex-col sm:flex-row items-center justify-between gap-8">

                    {/* ME */}
                    <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${isWinner ? 'scale-110' : 'opacity-80 scale-95'}`}>
                        <div className={`w-32 h-32 rounded-full border-[6px] flex flex-col items-center justify-center shadow-2xl relative
                            ${isWinner ? 'border-[#FF8800] bg-[#FF8800]/10' : 'border-slate-800 bg-slate-900/50'}`}>
                            <span className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1">PUNTI TUOI</span>
                            <span className={`font-orbitron font-black text-5xl ${isWinner ? 'text-[#FF8800]' : 'text-slate-400'}`}>{myScore}</span>
                        </div>
                        <h3 className="text-white font-black uppercase text-sm tracking-wider">TU</h3>
                        {isFinal && isWinner && (
                            <div className="flex flex-col items-center mt-2 animate-bounce">
                                <span className="text-[#FF8800] font-black uppercase text-xs bg-[#FF8800]/20 px-3 py-1 rounded-full border border-[#FF8800]/30">
                                    +{myScore} XP
                                </span>
                            </div>
                        )}
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center">
                        <span className="font-black font-orbitron text-6xl text-white/5 italic">VS</span>
                    </div>

                    {/* OPPONENT */}
                    <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${!isWinner ? 'scale-110' : 'opacity-60 scale-95'}`}>
                        <div className={`w-32 h-32 rounded-full border-[6px] flex flex-col items-center justify-center shadow-2xl relative
                            ${!isWinner ? 'border-green-500 bg-green-500/10' : 'border-slate-700 bg-slate-800/50'}`}>
                            <span className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1">PUNTI AVV</span>
                            <span className={`font-orbitron font-black text-5xl ${!isWinner ? 'text-green-500' : 'text-slate-500'}`}>{opponentScore}</span>
                        </div>
                        <h3 className="text-white font-black uppercase text-sm tracking-wider">{amIP1 ? matchData.player2?.username : matchData.player1?.username || 'Avversario'}</h3>
                    </div>

                </div>

                {/* FOOTER ACTIONS */}
                <div className="relative z-10 bg-slate-950 p-6 flex flex-col sm:flex-row gap-4 border-t border-white/10">
                    <button onClick={onExit} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-orbitron font-black uppercase tracking-widest transition-all active:scale-95 border-2 border-slate-600 flex items-center justify-center gap-2">
                        <Home size={18} /> TORNA ALLA LOBBY
                    </button>
                    {!isWinner && (
                        <button
                            onClick={handleRematchClick}
                            disabled={rematchRequested}
                            className={`flex-1 py-4 text-white rounded-xl font-orbitron font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 border-2 flex items-center justify-center gap-2
                            ${rematchRequested ? 'bg-slate-700 border-slate-600 cursor-wait' : 'bg-[#FF8800] border-white animate-pulse'}`}
                        >
                            <RotateCw size={18} /> {rematchRequested ? "RICHIESTA INVIATA..." : "RIVINCITA"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DuelRecapModal;
