
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Target, Zap, Clock, Brain, RefreshCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import HexCell from './HexCell';
import { HexCellData } from '../types';

interface BonusChallengeModalProps {
    onComplete: (bonusSeconds: number) => void;
    onFail: () => void;
}

const BonusChallengeModal: React.FC<BonusChallengeModalProps> = ({ onComplete, onFail }) => {
    const [grid, setGrid] = useState<HexCellData[]>([]);
    const [target, setTarget] = useState<number>(0);
    const [selectedPath, setSelectedPath] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState(10);
    const [status, setStatus] = useState<'playing' | 'success' | 'fail'>('playing');
    const [previewResult, setPreviewResult] = useState<number | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const generateChallenge = useCallback(() => {
        const nums = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15];
        const ops = ['+', '-', '×', '÷'];

        let valid = false;
        let attempt = 0;

        while (!valid && attempt < 100) {
            attempt++;
            const n1 = nums[Math.floor(Math.random() * nums.length)];
            const n2 = nums[Math.floor(Math.random() * nums.length)];
            const n3 = nums[Math.floor(Math.random() * nums.length)];
            const o1 = ops[Math.floor(Math.random() * ops.length)];
            const o2 = ops[Math.floor(Math.random() * ops.length)];

            let r1: number;
            if (o1 === '+') r1 = n1 + n2;
            else if (o1 === '-') r1 = n1 - n2;
            else if (o1 === '×') r1 = n1 * n2;
            else { if (n1 % n2 !== 0) continue; r1 = n1 / n2; }

            let final: number;
            if (o2 === '+') final = r1 + n3;
            else if (o2 === '-') final = r1 - n3;
            else if (o2 === '×') final = r1 * n3;
            else { if (r1 % n3 !== 0) continue; final = r1 / n3; }

            if (final > 0 && final < 100 && final !== n1 && final !== n2 && final !== n3) {
                setTarget(final);

                // Create 3x3 grid
                const cells: HexCellData[] = [];
                const positions = [
                    { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 },
                    { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 },
                    { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }
                ];

                // Shuffle positions
                const shuffled = [...positions].sort(() => Math.random() - 0.5);

                // The chain: n1, o1, n2, o2, n3 (5 cells)
                const sequence = [
                    { val: n1.toString(), type: 'number' as const },
                    { val: o1, type: 'operator' as const },
                    { val: n2.toString(), type: 'number' as const },
                    { val: o2, type: 'operator' as const },
                    { val: n3.toString(), type: 'number' as const }
                ];

                // Place sequence in connected manner? 
                // For 3x3 it's small enough that we can just place them randomly and hope for the best,
                // or place them in a snake pattern. Let's do a simple 3x3 grid where all are "selectable" regardless of distance
                // but let's keep the standard "must be adjacent" if the game logic requires it.
                // Actually, in the main game, distance is handled. Here we'll just place them.

                sequence.forEach((item, idx) => {
                    const pos = shuffled.pop()!;
                    cells.push({
                        id: `bonus-${idx}`,
                        type: item.type,
                        value: item.val,
                        row: pos.r,
                        col: pos.c
                    });
                });

                // Fill remaining 4 cells with junk
                for (let i = 0; i < 4; i++) {
                    const pos = shuffled.pop()!;
                    const isNum = Math.random() > 0.4;
                    cells.push({
                        id: `junk-${i}`,
                        type: isNum ? 'number' : 'operator',
                        value: isNum ? (Math.floor(Math.random() * 9) + 1).toString() : ops[Math.floor(Math.random() * ops.length)],
                        row: pos.r,
                        col: pos.c
                    });
                }

                setGrid(cells);
                valid = true;
            }
        }
    }, []);

    useEffect(() => {
        generateChallenge();
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    setStatus('fail');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current!);
    }, [generateChallenge]);

    const calculateResult = (path: string[]) => {
        if (path.length === 0) return null;
        const items = path.map(id => grid.find(c => c.id === id)).filter(Boolean);
        if (items.length === 0) return null;

        let res = 0;
        let lastOp = '+';

        for (const item of items) {
            if (item?.type === 'number') {
                const val = parseInt(item.value);
                if (lastOp === '+') res += val;
                else if (lastOp === '-') res -= val;
                else if (lastOp === '×') res *= val;
                else if (lastOp === '÷') res = val !== 0 ? res / val : res;
            } else {
                lastOp = item?.value || '+';
            }
        }
        return res;
    };

    const onStartInteraction = (id: string) => {
        if (status !== 'playing') return;
        setIsDragging(true);
        handlePathUpdate(id);
    };

    const onMoveInteraction = (id: string) => {
        if (status !== 'playing' || !isDragging) return;
        handlePathUpdate(id);
    };

    const onEndInteraction = () => {
        setIsDragging(false);
    };

    const handlePathUpdate = (id: string) => {
        setSelectedPath(prev => {
            if (prev.includes(id)) return prev;

            const newPath = [...prev, id];
            const result = calculateResult(newPath);
            setPreviewResult(result);

            if (result === target && newPath.length >= 5) {
                setStatus('success');
                clearInterval(timerRef.current!);
                setTimeout(() => onComplete(20), 1500);
            }

            return newPath;
        });
    };

    useEffect(() => {
        const handleUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchend', handleUp);
        return () => {
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchend', handleUp);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
            <div className="relative w-full max-w-md bg-slate-950 border-[3px] border-cyan-500/50 rounded-[2.5rem] p-8 shadow-[0_0_80px_rgba(34,211,238,0.3)] overflow-hidden">

                {/* Cyber Decor */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

                {/* Header */}
                <div className="relative z-10 text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] mb-4">
                        <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black font-orbitron text-white uppercase tracking-widest mb-1">
                        NEURAL <span className="text-cyan-400">SURGE</span>
                    </h2>
                    <p className="text-cyan-500/70 text-[10px] font-black uppercase tracking-[0.3em]">Estrazione Frammento Bonus</p>
                </div>

                {/* Timer Bar */}
                <div className="relative w-full h-2 bg-slate-900 rounded-full mb-8 overflow-hidden border border-white/5">
                    <div
                        className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 3 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'}`}
                        style={{ width: `${(timeLeft / 10) * 100}%` }}
                    ></div>
                </div>

                {/* Challenge Area */}
                <div className="relative flex flex-col items-center gap-8 z-10">
                    {/* Target Display */}
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-cyan-500/50 font-black uppercase tracking-widest mb-2">TARGET RICHIESTO</span>
                        <div className="px-10 py-4 bg-cyan-950/30 border-2 border-cyan-400 rounded-2xl shadow-[inset_0_0_20px_rgba(34,211,238,0.2)]">
                            <span className="text-6xl font-black font-orbitron text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                                {target}
                            </span>
                        </div>
                    </div>

                    {/* Mini Grid 3x3 */}
                    <div className="relative w-[220px] h-[220px] mb-4" style={{ '--hex-scale': '0.8' } as any}>
                        {grid.map(cell => (
                            <HexCell
                                key={cell.id}
                                data={cell}
                                isSelected={selectedPath.includes(cell.id)}
                                isSelectable={status === 'playing'}
                                onMouseEnter={onMoveInteraction}
                                onMouseDown={onStartInteraction}
                                theme="default"
                            />
                        ))}
                    </div>

                    {/* Preview Result */}
                    <div className={`h-8 flex items-center transition-all duration-300 ${previewResult !== null ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-cyan-400 font-orbitron font-black text-xl">
                            Sequenza: {previewResult}
                        </span>
                    </div>
                </div>

                {/* Overlays */}
                {status === 'success' && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-cyan-950/90 backdrop-blur-md animate-fadeIn">
                        <CheckCircle2 size={80} className="text-cyan-400 mb-4 animate-bounce" />
                        <h3 className="text-3xl font-black font-orbitron text-white uppercase tracking-tighter">SINCRONIZZATO!</h3>
                        <span className="text-cyan-400 font-black text-xl animate-pulse">+20s BONUS CARRIERA</span>
                    </div>
                )}

                {status === 'fail' && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-md animate-fadeIn">
                        <AlertTriangle size={80} className="text-red-500 mb-4 animate-shake" />
                        <h3 className="text-3xl font-black font-orbitron text-white uppercase tracking-tighter">FALLITO</h3>
                        <span className="text-red-400 font-bold mb-8 uppercase tracking-widest text-xs">Frammento Perduto</span>
                        <button
                            onClick={onFail}
                            className="px-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-bold uppercase tracking-widest hover:bg-white/20 transition-all"
                        >
                            Chiudi
                        </button>
                    </div>
                )}

                {/* Close Button (only if playing) */}
                {status === 'playing' && (
                    <button
                        onClick={onFail}
                        className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default BonusChallengeModal;
