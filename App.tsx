
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HexCellData, GameState } from './types';
import { INITIAL_TIME, BASE_POINTS_START, MAX_STREAK, GRID_ROWS, GRID_COLS, OPERATORS, MOCK_LEADERBOARD } from './constants';
import HexCell from './components/HexCell';
import ParticleEffect from './components/ParticleEffect';
import { getIQInsights } from './services/geminiService';
import { soundService } from './services/soundService';
import { Trophy, Timer, Zap, Brain, RefreshCw, ChevronRight, Play, Award, BarChart3, HelpCircle, Sparkles, Home, X, Volume2, VolumeX } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    title: "BENVENUTO",
    description: "In 'number', il tuo obiettivo è collegare numeri e operatori sulla griglia esagonale per raggiungere il risultato Target visualizzato in alto.",
    icon: <Brain className="w-12 h-12 text-cyan-400" />
  },
  {
    title: "REGOLE DI CONNESSIONE",
    description: "Trascina il dito partendo da un Numero. Devi sempre alternare: Numero → Operatore → Numero. Non puoi collegare due numeri o due operatori direttamente.",
    icon: <RefreshCw className="w-12 h-12 text-indigo-400" />
  },
  {
    title: "IL POTERE DELLA STREAK",
    description: "Ogni successo consecutivo raddoppia i punti (5, 10, 20, 40, 80). Completa 5 successi per superare il livello. Un errore resetta la streak a 5 punti!",
    icon: <Zap className="w-12 h-12 text-amber-400" />
  },
  {
    title: "TEMPO E CARRY-OVER",
    description: "Hai 60 secondi base. La vera sfida? Il tempo che risparmi in un livello viene aggiunto interamente a quello successivo. La velocità è la tua arma migliore.",
    icon: <Timer className="w-12 h-12 text-rose-400" />
  },
  {
    title: "QI RANKING",
    description: "La nostra AI valuterà la tua velocità e precisione per stimare il tuo Quoziente Intellettivo. Scala la classifica globale e dimostra di essere una delle menti più brillanti.",
    icon: <Award className="w-12 h-12 text-emerald-400" />
  }
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalScore: 0,
    streak: 0,
    level: 1,
    timeLeft: INITIAL_TIME,
    targetResult: 0,
    status: 'idle',
    estimatedIQ: 100,
    lastLevelPerfect: true,
    basePoints: BASE_POINTS_START,
  });

  const [grid, setGrid] = useState<HexCellData[]>([]);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewResult, setPreviewResult] = useState<number | null>(null);
  const [insight, setInsight] = useState<string>("");
  const [activeModal, setActiveModal] = useState<'leaderboard' | 'tutorial' | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [targetAnimKey, setTargetAnimKey] = useState(0);
  const [scoreAnimKey, setScoreAnimKey] = useState(0);
  const [isVictoryAnimating, setIsVictoryAnimating] = useState(false);
  const [triggerParticles, setTriggerParticles] = useState(false);
  const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const toggleMute = (e?: React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    soundService.setMuted(newMuted);
    if (!newMuted) soundService.playUIClick();
  };

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    setToast({ message, visible: true });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2500);
  };

  const calculateResultFromPath = (pathIds: string[]): number | null => {
    if (pathIds.length < 1) return null;
    
    const expression: string[] = pathIds.map(id => {
      const cell = grid.find(c => c.id === id);
      return cell ? cell.value : '';
    });

    try {
      let result = 0;
      let currentOp = '+';
      let hasStarted = false;

      for (let i = 0; i < expression.length; i++) {
        const part = expression[i];
        if (OPERATORS.includes(part)) {
          currentOp = part;
        } else {
          const num = parseInt(part);
          if (!hasStarted) {
            result = num;
            hasStarted = true;
          } else {
            if (currentOp === '+') result += num;
            else if (currentOp === '-') result -= num;
            else if (currentOp === '×') result *= num;
            else if (currentOp === '÷') result = num !== 0 ? Math.floor(result / num) : result;
          }
        }
      }
      return result;
    } catch (e) {
      return null;
    }
  };

  const generateGrid = useCallback(() => {
    const newGrid: HexCellData[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const isOperator = (r + c) % 2 !== 0;
        newGrid.push({
          id: `${r}-${c}`,
          row: r,
          col: c,
          type: isOperator ? 'operator' : 'number',
          value: isOperator 
            ? OPERATORS[Math.floor(Math.random() * OPERATORS.length)]
            : Math.floor(Math.random() * 10).toString(),
        });
      }
    }
    setGrid(newGrid);

    const n1 = Math.floor(Math.random() * 15) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    const op = OPERATORS[Math.floor(Math.random() * 3)]; 
    let res = 0;
    if (op === '+') res = n1 + n2;
    if (op === '-') res = Math.max(1, n1 - n2);
    if (op === '×') res = n1 * n2;
    if (op === '÷') res = n1; 
    
    setGameState(prev => ({ ...prev, targetResult: res || 10 }));
    setTargetAnimKey(k => k + 1);
  }, []);

  const startGame = () => {
    soundService.playUIClick();
    try {
      localStorage.setItem('number_tutorial_done', 'true');
    } catch (e) { console.warn("LocalStorage blocked", e); }
    
    setActiveModal(null);
    setIsVictoryAnimating(false);
    setTriggerParticles(false);
    setPreviewResult(null);
    setGameState({
      score: 0,
      totalScore: 0,
      streak: 0,
      level: 1,
      timeLeft: INITIAL_TIME,
      targetResult: 0,
      status: 'playing',
      estimatedIQ: 100,
      lastLevelPerfect: true,
      basePoints: BASE_POINTS_START,
    });
    generateGrid();
  };

  const handleStartGameClick = (e?: React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    let tutorialDone = 'false';
    try {
      tutorialDone = localStorage.getItem('number_tutorial_done') || 'false';
    } catch (e) { tutorialDone = 'true'; }

    if (tutorialDone !== 'true') {
      soundService.playUIClick();
      setTutorialStep(0);
      setActiveModal('tutorial');
    } else {
      startGame();
    }
  };

  const goToHome = (e?: React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    soundService.playReset();
    showToast("Sincronizzazione Terminata");
    setGameState(prev => ({ ...prev, status: 'idle' }));
    setSelectedPath([]);
    setIsDragging(false);
    setPreviewResult(null);
  };

  const nextTutorialStep = () => {
    soundService.playTick();
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      startGame();
    }
  };

  const evaluatePath = (pathIds: string[]) => {
    if (pathIds.length < 3) {
      if (pathIds.length > 0) soundService.playReset();
      setSelectedPath([]);
      setPreviewResult(null);
      return;
    }

    const result = calculateResultFromPath(pathIds);
    if (result === gameState.targetResult) {
      handleSuccess();
    } else {
      handleError();
    }
    setPreviewResult(null);
  };

  const handleSuccess = () => {
    soundService.playSuccess();
    const nextStreak = gameState.streak + 1;
    const currentPoints = gameState.basePoints * Math.pow(2, Math.min(nextStreak - 1, MAX_STREAK - 1));
    setScoreAnimKey(k => k + 1);
    
    if (nextStreak === MAX_STREAK) {
      setIsVictoryAnimating(true);
      setTriggerParticles(true);
      setGameState(prev => ({
        ...prev,
        totalScore: prev.totalScore + currentPoints,
        streak: nextStreak,
        estimatedIQ: Math.min(200, prev.estimatedIQ + 4),
      }));
      setTimeout(() => {
        setGameState(prev => {
           if (prev.status === 'idle') return prev;
           return {
            ...prev,
            streak: 0,
            level: prev.level + 1,
            status: 'level-complete'
          }
        });
        setIsVictoryAnimating(false);
        setTriggerParticles(false);
      }, 1200);
    } else {
      setGameState(prev => ({
        ...prev,
        totalScore: prev.totalScore + currentPoints,
        streak: nextStreak,
        estimatedIQ: Math.min(200, prev.estimatedIQ + 0.5),
      }));
      generateGrid();
    }
    setSelectedPath([]);
  };

  const handleError = () => {
    soundService.playError();
    setGameState(prev => ({
      ...prev,
      streak: 0,
      lastLevelPerfect: false,
      basePoints: BASE_POINTS_START,
      estimatedIQ: Math.max(70, prev.estimatedIQ - 1.5),
    }));
    setSelectedPath([]);
  };

  const nextLevel = () => {
    soundService.playUIClick();
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      basePoints: prev.lastLevelPerfect ? 6 : 5,
      lastLevelPerfect: true,
    }));
    generateGrid();
  };

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            if (timerRef.current) window.clearInterval(timerRef.current);
            return { ...prev, timeLeft: 0, status: 'game-over' };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [gameState.status]);

  useEffect(() => {
    if (gameState.status === 'level-complete' || gameState.status === 'game-over') {
      getIQInsights(gameState.totalScore, gameState.level, gameState.timeLeft).then(setInsight);
    }
  }, [gameState.status]);

  const onStartInteraction = (id: string) => {
    if (gameState.status !== 'playing' || isVictoryAnimating) return;
    const cell = grid.find(c => c.id === id);
    if (cell && cell.type === 'number') {
      soundService.playSelect();
      setIsDragging(true);
      setSelectedPath([id]);
      setPreviewResult(parseInt(cell.value));
    }
  };

  const onMoveInteraction = (id: string) => {
    if (!isDragging || gameState.status !== 'playing' || isVictoryAnimating) return;
    if (selectedPath.includes(id)) return;
    const lastId = selectedPath[selectedPath.length - 1];
    const lastCell = grid.find(c => c.id === lastId);
    const currentCell = grid.find(c => c.id === id);
    if (lastCell && currentCell && lastCell.type !== currentCell.type) {
      soundService.playTick();
      const newPath = [...selectedPath, id];
      setSelectedPath(newPath);
      setPreviewResult(calculateResultFromPath(newPath));
    }
  };

  const handleGlobalEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      evaluatePath(selectedPath);
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center select-none relative overflow-hidden"
      onMouseUp={handleGlobalEnd}
      onTouchEnd={handleGlobalEnd}
    >
      <ParticleEffect trigger={triggerParticles} />

      {/* Futuristic Toast Notification */}
      <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[3000] transition-all duration-500 pointer-events-none
        ${toast.visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-16 opacity-0 scale-95'}`}>
        <div className="glass-panel px-8 py-4 rounded-[1.5rem] border border-cyan-400/60 shadow-[0_0_40px_rgba(34,211,238,0.4)] flex items-center gap-5 backdrop-blur-2xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg">
            <Home className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-orbitron text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-0.5">Sistema</span>
            <span className="font-orbitron text-sm font-black text-white tracking-widest uppercase">{toast.message}</span>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0)_0%,rgba(2,6,23,1)_100%)]"></div>
      </div>

      {/* HOME PAGE */}
      {gameState.status === 'idle' && (
        <div className="z-10 w-full max-w-xl flex flex-col items-center text-center px-6 py-10 animate-screen-in">
          <div className="relative mb-14 animate-float">
            <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 hexagon-clip flex items-center justify-center overflow-hidden shadow-[0_0_120px_rgba(34,211,238,0.25)] bg-transparent">
              <div className="energy-ring"></div>
              <div className="absolute inset-[4px] bg-[#020617]/40 backdrop-blur-3xl hexagon-clip flex items-center justify-center">
                <div className="logo-inner-glow"></div>
                <div className="logo-outline"></div>
                <Brain className="w-20 h-20 sm:w-24 sm:h-24 text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.95)]" />
              </div>
              <div className="absolute bottom-6 right-6 bg-indigo-600 rounded-full p-2 border border-white/20 shadow-[0_0_30px_rgba(79,70,229,0.8)] animate-pulse">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h1 className="text-5xl sm:text-7xl font-black font-orbitron tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-500 lowercase">
              number
            </h1>
            <div className="mt-1 text-cyan-400 font-orbitron tracking-[0.4em] text-xs sm:text-sm font-black uppercase drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              IQ Challenge
            </div>
          </div>

          <p className="max-w-md text-slate-400 text-sm sm:text-base mb-10 leading-relaxed font-medium">
            Sincronizza i tuoi neuroni. Risolvi puzzle aritmetici complessi in una corsa contro il tempo.
          </p>

          <div className="flex flex-col gap-5 items-center w-full max-w-sm relative z-20">
            <button 
              onPointerDown={handleStartGameClick}
              className="w-full group relative overflow-hidden flex items-center justify-center gap-4 bg-[linear-gradient(135deg,#06b6d4_0%,#6366f1_100%)] text-white py-5 rounded-2xl font-orbitron font-black text-xl shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] active:scale-95 transition-all border border-white/20"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>INIZIA SFIDA</span>
            </button>
            
            <div className="grid grid-cols-2 gap-4 w-full">
              <button onPointerDown={(e) => { e.stopPropagation(); soundService.playUIClick(); setTutorialStep(0); setActiveModal('tutorial'); }} className="flex items-center justify-center gap-2 bg-slate-800/80 py-4 rounded-xl border border-white/10 active:scale-95 transition-all">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span className="font-orbitron text-[10px] font-black uppercase tracking-widest text-slate-300">Tutorial</span>
              </button>
              <button onPointerDown={(e) => { e.stopPropagation(); soundService.playUIClick(); setActiveModal('leaderboard'); }} className="flex items-center justify-center gap-2 bg-slate-800/80 py-4 rounded-xl border border-white/10 active:scale-95 transition-all">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <span className="font-orbitron text-[10px] font-black uppercase tracking-widest text-slate-300">Classifica</span>
              </button>
            </div>

            {/* Home Audio Toggle */}
            <button 
              onPointerDown={toggleMute}
              className={`mt-4 flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 backdrop-blur-md
                ${isMuted 
                  ? 'bg-slate-900/40 border-slate-700 text-slate-500' 
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
              <span className="font-orbitron text-[10px] font-black uppercase tracking-[0.2em]">
                Audio {isMuted ? 'OFF' : 'ON'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* GAME UI */}
      {gameState.status !== 'idle' && (
        <div className="w-full h-full flex flex-col items-center z-10 p-4 max-w-4xl animate-screen-in">
          <header className="w-full flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button 
                onPointerDown={goToHome}
                className="group flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl border border-white/10 shadow-lg relative z-[999] active:scale-90 transition-all cursor-pointer"
                title="Torna alla Home"
              >
                <Home className="w-5 h-5 text-cyan-400" />
                <span className="hidden sm:inline font-orbitron text-[10px] font-black uppercase text-slate-300">Home</span>
              </button>
              
              {/* In-game Audio Toggle */}
              <button 
                onPointerDown={toggleMute}
                className={`px-4 py-2 rounded-2xl border transition-all duration-300 flex items-center justify-center
                  ${isMuted ? 'bg-slate-900/60 border-slate-700 text-slate-500' : 'bg-white/10 border-white/10 text-cyan-400'}`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="flex gap-3 items-center">
              <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3">
                <span className={`text-2xl font-orbitron font-black ${gameState.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{gameState.timeLeft}</span>
                <Timer className="w-5 h-5 text-cyan-400" />
              </div>
              <div key={scoreAnimKey} className="glass-panel px-4 py-2 rounded-xl flex flex-col items-center">
                <span className="text-[8px] text-slate-500 uppercase font-black">Score</span>
                <span className="text-lg font-orbitron font-black text-amber-400">{gameState.totalScore}</span>
              </div>
            </div>
          </header>

          <main className="relative flex-grow w-full flex flex-col items-center justify-center">
            {gameState.status === 'playing' && (
              <div className="w-full flex flex-col items-center h-full relative">
                 <div className="mb-6 flex flex-col items-center">
                    <span className="text-slate-500 text-[9px] font-black uppercase mb-1">Target</span>
                    <div key={targetAnimKey} className="text-7xl font-black font-orbitron text-white drop-shadow-2xl">{gameState.targetResult}</div>
                    
                    {/* Floating Preview Result */}
                    <div className={`absolute top-24 z-[100] transition-all duration-300 
                      ${isDragging && selectedPath.length > 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}`}>
                      <div className={`glass-panel px-6 py-2 rounded-full border-2 transition-colors duration-300
                        ${previewResult === gameState.targetResult ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] bg-cyan-950/40' : 'border-white/20'}`}>
                        <span className="text-[10px] text-slate-400 uppercase font-black mr-2">In corso:</span>
                        <span className={`text-2xl font-orbitron font-black ${previewResult === gameState.targetResult ? 'text-cyan-400' : 'text-white'}`}>
                          {previewResult !== null ? previewResult : '...'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 mt-10">
                      {[...Array(MAX_STREAK)].map((_, i) => (
                        <div key={i} className={`w-8 h-1.5 rounded-full ${i < gameState.streak ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-800'}`} />
                      ))}
                    </div>
                 </div>
                 
                 <div className="relative flex-grow w-full flex items-center justify-center overflow-visible">
                   <div className="relative w-[calc(400px*var(--hex-scale))] h-[calc(480px*var(--hex-scale))] mx-auto">
                     {grid.map(cell => (
                       <HexCell key={cell.id} data={cell} isSelected={selectedPath.includes(cell.id)} isSelectable={!isVictoryAnimating} onMouseEnter={onMoveInteraction} onMouseDown={onStartInteraction} />
                     ))}
                   </div>
                 </div>
              </div>
            )}
            
            {gameState.status === 'game-over' && (
               <div className="glass-panel p-8 rounded-[2.5rem] text-center modal-content animate-screen-in">
                  <h2 className="text-4xl font-black font-orbitron mb-4 text-red-500">FINE</h2>
                  <div className="mb-8">
                     <span className="text-[10px] text-slate-500 uppercase font-black">QI Stimato</span>
                     <div className="text-7xl font-black font-orbitron text-white">{Math.round(gameState.estimatedIQ)}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl mb-8 text-xs italic text-slate-300">
                    "{insight}"
                  </div>
                  <button onPointerDown={(e) => { e.stopPropagation(); startGame(); }} className="w-full bg-white text-slate-950 py-4 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm mb-4 active:scale-95 transition-all">RIPROVA</button>
                  <button onPointerDown={goToHome} className="text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-colors">Torna alla Home</button>
               </div>
            )}
            
            {gameState.status === 'level-complete' && (
               <div className="glass-panel p-8 rounded-[2.5rem] text-center modal-content animate-screen-in">
                  <Trophy className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-black font-orbitron mb-4">LIVELLO {gameState.level - 1} OK</h2>
                  <div className="bg-white/5 p-4 rounded-2xl mb-8 text-xs italic text-slate-300">
                    "{insight}"
                  </div>
                  <button onPointerDown={(e) => { e.stopPropagation(); nextLevel(); }} className="w-full bg-cyan-400 text-slate-950 py-4 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm active:scale-95 transition-all">PROSSIMO LIVELLO</button>
               </div>
            )}
          </main>
        </div>
      )}

      {activeModal === 'tutorial' && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 modal-overlay bg-black/80" onPointerDown={() => { soundService.playUIClick(); setActiveModal(null); }}>
          <div className="glass-panel w-full max-w-md p-8 rounded-[2rem] modal-content flex flex-col" onPointerDown={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center py-4">
              <div className="mb-8">{TUTORIAL_STEPS[tutorialStep].icon}</div>
              <h2 className="text-2xl font-black font-orbitron text-white mb-4 uppercase">{TUTORIAL_STEPS[tutorialStep].title}</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-10">{TUTORIAL_STEPS[tutorialStep].description}</p>
              <button onPointerDown={(e) => { e.stopPropagation(); nextTutorialStep(); }} className="w-full bg-cyan-500 text-white py-5 rounded-2xl font-orbitron font-black text-sm uppercase active:scale-95 transition-all">
                {tutorialStep === TUTORIAL_STEPS.length - 1 ? 'GIOCA ORA' : 'AVANTI'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeModal === 'leaderboard' && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 modal-overlay bg-black/80" onPointerDown={() => { soundService.playUIClick(); setActiveModal(null); }}>
          <div className="glass-panel w-full max-w-md p-8 rounded-[2rem] modal-content flex flex-col" onPointerDown={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black font-orbitron text-white mb-6 uppercase flex items-center gap-3"><Award className="text-amber-400" /> RANKING</h2>
            <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-2 custom-scroll">
              {MOCK_LEADERBOARD.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{idx + 1}. {p.name}</span>
                    <span className="text-[8px] text-slate-500 uppercase">{p.country}</span>
                  </div>
                  <span className="font-orbitron font-bold text-cyan-400 text-xs">IQ {p.iq}</span>
                </div>
              ))}
            </div>
            <button onPointerDown={() => { soundService.playUIClick(); setActiveModal(null); }} className="mt-8 w-full bg-slate-800 text-white py-4 rounded-xl font-orbitron font-black text-xs uppercase active:scale-95 transition-all">CHIUDI</button>
          </div>
        </div>
      )}

      <footer className="mt-auto py-6 text-slate-600 text-[8px] tracking-[0.4em] uppercase font-black z-10 pointer-events-none opacity-40">AI Evaluation Engine v3.6</footer>
    </div>
  );
};

export default App;
