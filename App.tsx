
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HexCellData, GameState } from './types';
import { INITIAL_TIME, BASE_POINTS_START, MAX_STREAK, GRID_ROWS, GRID_COLS, OPERATORS, MOCK_LEADERBOARD } from './constants';
import HexCell from './components/HexCell';
import ParticleEffect from './components/ParticleEffect';
import { getIQInsights } from './services/geminiService';
import { soundService } from './services/soundService';
import { Trophy, Timer, Zap, Brain, RefreshCw, ChevronRight, Play, Award, BarChart3, HelpCircle, Sparkles, Home, ArrowLeft, X } from 'lucide-react';

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
  const [insight, setInsight] = useState<string>("");
  const [activeModal, setActiveModal] = useState<'leaderboard' | 'tutorial' | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [targetAnimKey, setTargetAnimKey] = useState(0);
  const [scoreAnimKey, setScoreAnimKey] = useState(0);
  const [isVictoryAnimating, setIsVictoryAnimating] = useState(false);
  const [triggerParticles, setTriggerParticles] = useState(false);
  const timerRef = useRef<number | null>(null);

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

  const handleStartGameClick = () => {
    const tutorialDone = localStorage.getItem('number_tutorial_done');
    if (tutorialDone !== 'true') {
      setTutorialStep(0);
      setActiveModal('tutorial');
    } else {
      startGame();
    }
  };

  const startGame = () => {
    localStorage.setItem('number_tutorial_done', 'true');
    setActiveModal(null);
    setIsVictoryAnimating(false);
    setTriggerParticles(false);
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

  const goToHome = (e?: React.PointerEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (gameState.status === 'playing') {
      if (!confirm("Vuoi davvero abbandonare la sfida corrente?")) return;
    }
    
    soundService.playReset();
    setGameState(prev => ({ ...prev, status: 'idle' }));
    setSelectedPath([]);
    setIsDragging(false);
  };

  const nextTutorialStep = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(prev => prev + 1);
      soundService.playTick();
    } else {
      if (gameState.status === 'playing') {
        setActiveModal(null);
        localStorage.setItem('number_tutorial_done', 'true');
      } else {
        startGame();
      }
    }
  };

  const evaluatePath = (pathIds: string[]) => {
    if (pathIds.length < 3) {
      if (pathIds.length > 0) soundService.playReset();
      setSelectedPath([]);
      return;
    }

    const expression: string[] = pathIds.map(id => {
      const cell = grid.find(c => c.id === id);
      return cell ? cell.value : '';
    });

    try {
      let result = 0;
      let currentOp = '+';

      for (let i = 0; i < expression.length; i++) {
        const part = expression[i];
        if (part === '+') currentOp = '+';
        else if (part === '-') currentOp = '-';
        else if (part === '×') currentOp = '×';
        else if (part === '÷') currentOp = '÷';
        else {
          const num = parseInt(part);
          if (currentOp === '+') result += num;
          else if (currentOp === '-') result -= num;
          else if (currentOp === '×') result *= num;
          else if (currentOp === '÷') result = num !== 0 ? Math.floor(result / num) : result;
        }
      }

      if (result === gameState.targetResult) {
        handleSuccess();
      } else {
        handleError();
      }
    } catch (e) {
      handleError();
    }
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
        estimatedIQ: Math.min(200, prev.estimatedIQ + 4 + (currentPoints / (INITIAL_TIME - prev.timeLeft + 1)) * 0.1),
      }));

      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          streak: 0,
          level: prev.level + 1,
          status: 'level-complete'
        }));
        setIsVictoryAnimating(false);
        setTriggerParticles(false);
      }, 1200);
    } else {
      setGameState(prev => ({
        ...prev,
        totalScore: prev.totalScore + currentPoints,
        streak: nextStreak,
        estimatedIQ: Math.min(200, prev.estimatedIQ + (currentPoints / (INITIAL_TIME - prev.timeLeft + 1)) * 0.1),
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
      setSelectedPath(prev => [...prev, id]);
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

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0)_0%,rgba(2,6,23,1)_100%)]"></div>
      </div>

      {/* HOME PAGE */}
      {gameState.status === 'idle' && (
        <div className="z-10 w-full max-w-xl flex flex-col items-center text-center px-6 py-10 animate-screen-in">
          
          <div className="relative mb-14 animate-float">
            <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
            
            {/* Logo Energy Effect Hexagon */}
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
            Sincronizza i tuoi neuroni. Risolvi puzzle aritmetici complessi in una corsa contro il tempo per sbloccare il tuo vero potenziale cognitivo. 
            <span className="text-indigo-400 block mt-2 font-bold">Riuscirai a restare tra le menti più brillanti?</span>
          </p>

          <div className="grid grid-cols-3 gap-3 mb-12 w-full max-w-md">
            {[
              { 
                icon: <Zap className="w-5 h-5" />, 
                title: "Streak", 
                description: "Raddoppia i punti risolvendo puzzle consecutivamente senza errori."
              },
              { 
                icon: <Timer className="w-5 h-5" />, 
                title: "Carry-over", 
                description: "Il tempo risparmiato in un livello viene aggiunto al successivo."
              },
              { 
                icon: <Award className="w-5 h-5" />, 
                title: "QI Ranking", 
                description: "Valutazione dinamica del tuo quoziente intellettivo basata su velocità e precisione."
              }
            ].map((item, i) => (
              <div key={i} className="group relative glass-panel py-4 px-2 rounded-2xl border border-white/5 bg-white/[0.02] cursor-help hover:bg-white/[0.05] transition-all duration-300">
                <div className="text-cyan-400 mb-2 flex justify-center drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] transition-transform group-hover:scale-110 duration-300">{item.icon}</div>
                <h3 className="font-orbitron font-bold text-[9px] text-slate-300 uppercase tracking-tighter group-hover:text-white transition-colors">{item.title}</h3>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 glass-panel rounded-xl text-[10px] text-slate-300 font-medium leading-snug opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-50 shadow-2xl border-cyan-500/30">
                  <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-cyan-500/30 rotate-45"></div>
                  {item.description}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-5 items-center w-full max-w-sm">
            <button 
              onClick={handleStartGameClick}
              className="w-full group relative overflow-hidden flex items-center justify-center gap-4 bg-[length:200%_auto] bg-[linear-gradient(135deg,#06b6d4_0%,#6366f1_50%,#a855f7_100%)] text-white py-5 rounded-2xl font-orbitron font-black text-xl hover:bg-[position:right_center] transition-all duration-500 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] active:scale-95 z-20 border border-white/20"
            >
              <Play className="w-6 h-6 fill-current drop-shadow-lg" />
              <span className="drop-shadow-md">INIZIA SFIDA</span>
            </button>
            
            <div className="grid grid-cols-2 gap-4 w-full">
              <button onClick={() => { setTutorialStep(0); setActiveModal('tutorial'); }} className="group relative overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-br from-slate-800/80 to-slate-900/90 py-4 rounded-xl border border-white/10 active:scale-95 z-20">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span className="font-orbitron text-[10px] font-black uppercase tracking-widest text-slate-300">Tutorial</span>
              </button>
              <button onClick={() => setActiveModal('leaderboard')} className="group relative overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-br from-slate-800/80 to-slate-900/90 py-4 rounded-xl border border-white/10 active:scale-95 z-20">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <span className="font-orbitron text-[10px] font-black uppercase tracking-widest text-slate-300">Classifica</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME UI */}
      {gameState.status !== 'idle' && (
        <div className="w-full h-full flex flex-col items-center z-10 p-4 max-w-4xl animate-screen-in">
          <header className="w-full flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <button 
                onPointerDown={goToHome}
                className="group flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-90 border border-white/10 shadow-lg relative z-[999] cursor-pointer"
                title="Torna alla Home"
              >
                <Home className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-orbitron text-[10px] font-black uppercase text-slate-300 group-hover:text-white transition-colors">Home</span>
              </button>
              <div className="h-8 w-[1px] bg-white/10 mx-1 hidden sm:block"></div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black font-orbitron text-white tracking-tighter lowercase">number</h1>
                <span className="text-[9px] text-cyan-400 font-black uppercase">LV.{gameState.level}</span>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3">
                <span className={`text-2xl font-orbitron font-black ${gameState.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {gameState.timeLeft}
                </span>
                <Timer className={`w-5 h-5 ${gameState.timeLeft < 10 ? 'text-red-500' : 'text-cyan-400'}`} />
              </div>
              <div key={scoreAnimKey} className="glass-panel px-4 py-2 rounded-xl flex flex-col items-center animate-score-update">
                <span className="text-[8px] text-slate-500 uppercase font-black">Score</span>
                <span className="text-lg font-orbitron font-black text-amber-400">{gameState.totalScore}</span>
              </div>
            </div>
          </header>

          <main className="relative flex-grow w-full flex flex-col items-center justify-center">
            {(gameState.status === 'playing' || isVictoryAnimating) && (
              <div className={`w-full flex flex-col items-center h-full transition-opacity duration-500 ${isVictoryAnimating ? 'animate-victory-grid' : ''}`}>
                 <div className="mb-6 flex flex-col items-center">
                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Target</span>
                    <div key={targetAnimKey} className="text-7xl font-black font-orbitron text-white drop-shadow-2xl animate-target-update">
                       {gameState.targetResult}
                    </div>
                    <div className="flex gap-1.5 mt-4">
                      {[...Array(MAX_STREAK)].map((_, i) => (
                        <div key={i} className={`w-8 h-1.5 rounded-full transition-all duration-500 ${i < gameState.streak ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-800'}`} />
                      ))}
                    </div>
                 </div>
                 
                 <div className="relative flex-grow w-full flex items-center justify-center overflow-visible">
                   <div className="relative w-[calc(400px*var(--hex-scale))] h-[calc(480px*var(--hex-scale))] mx-auto">
                     {grid.map(cell => (
                       <HexCell
                         key={cell.id}
                         data={cell}
                         isSelected={selectedPath.includes(cell.id)}
                         isSelectable={!isVictoryAnimating}
                         onMouseEnter={onMoveInteraction}
                         onMouseDown={onStartInteraction}
                       />
                     ))}
                   </div>
                 </div>
              </div>
            )}

            {gameState.status === 'level-complete' && (
              <div className="glass-panel p-8 rounded-[2.5rem] border-cyan-400/30 text-center modal-content w-full max-w-sm mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-trophy">
                   <Trophy className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black font-orbitron mb-2 text-white animate-screen-in" style={{animationDelay: '0.2s'}}>LIVELLO {gameState.level - 1} OK</h2>
                <div className="bg-white/5 p-4 rounded-2xl mb-8 text-xs italic text-slate-300 animate-screen-in" style={{animationDelay: '0.4s'}}>
                  "{insight}"
                </div>
                <button onClick={nextLevel} className="w-full bg-cyan-400 text-slate-950 py-4 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm shadow-[0_5px_15px_rgba(34,211,238,0.3)] active:scale-95 animate-screen-in" style={{animationDelay: '0.6s'}}>
                  PROSSIMO LIVELLO
                </button>
              </div>
            )}

            {gameState.status === 'game-over' && (
              <div className="glass-panel p-8 rounded-[2.5rem] border-red-500/30 text-center modal-content w-full max-w-sm mx-auto">
                <h2 className="text-4xl font-black font-orbitron mb-4 text-red-500">FINE</h2>
                <div className="mb-8">
                   <span className="text-[10px] text-slate-500 uppercase font-black">QI Stimato</span>
                   <div className="text-7xl font-black font-orbitron text-white animate-target-update">{Math.round(gameState.estimatedIQ)}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl mb-8 text-xs italic text-slate-300 animate-screen-in">
                  "{insight}"
                </div>
                <button onClick={startGame} className="w-full bg-white text-slate-950 py-4 rounded-xl font-orbitron font-black uppercase tracking-widest text-sm mb-4 active:scale-95 animate-screen-in" style={{animationDelay: '0.2s'}}>
                  RIPROVA
                </button>
                <button onClick={() => goToHome()} className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] hover:text-white transition-colors animate-screen-in" style={{animationDelay: '0.4s'}}>
                  Torna alla Home
                </button>
              </div>
            )}
          </main>

          {gameState.status === 'playing' && !isVictoryAnimating && (
            <div className="flex gap-4 mt-6">
              <button 
                onPointerDown={(e) => { e.stopPropagation(); setTutorialStep(0); setActiveModal('tutorial'); }}
                className="glass-panel p-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-5 h-5 text-slate-400" />
              </button>
              <button 
                onPointerDown={(e) => { e.stopPropagation(); setActiveModal('leaderboard'); }}
                className="glass-panel p-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          )}
        </div>
      )}

      {activeModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 modal-overlay" onPointerDown={() => activeModal !== 'tutorial' && setActiveModal(null)}>
          <div className="glass-panel w-full max-w-md p-8 rounded-[2rem] border-white/10 modal-content relative allow-scroll max-h-[85vh] flex flex-col" onPointerDown={e => e.stopPropagation()}>
            {activeModal !== 'tutorial' && (
              <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500 hover:text-white" />
              </button>
            )}

            {activeModal === 'tutorial' && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="mb-8 animate-float">
                  {TUTORIAL_STEPS[tutorialStep].icon}
                </div>
                <h2 className="text-3xl font-black font-orbitron text-white mb-4 tracking-tighter">
                  {TUTORIAL_STEPS[tutorialStep].title}
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-10 font-medium">
                  {TUTORIAL_STEPS[tutorialStep].description}
                </p>
                
                <div className="flex gap-2 mb-10">
                  {TUTORIAL_STEPS.map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === tutorialStep ? 'bg-cyan-400 w-8' : 'bg-slate-700'}`} />
                  ))}
                </div>

                <button 
                  onClick={nextTutorialStep}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white py-5 rounded-2xl font-orbitron font-black text-sm uppercase tracking-[0.2em] shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  {tutorialStep === TUTORIAL_STEPS.length - 1 ? (gameState.status === 'playing' ? 'CHIUDI' : 'GIOCA ORA') : 'AVANTI'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {activeModal === 'leaderboard' && (
              <div className="flex flex-col h-full overflow-hidden">
                <h2 className="text-2xl font-black font-orbitron text-white mb-6 flex items-center gap-3"><Award className="w-6 h-6 text-amber-400" /> RANKING</h2>
                <div className="space-y-3 custom-scroll overflow-y-auto flex-grow pr-2">
                  {MOCK_LEADERBOARD.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-500">{idx + 1}.</span>
                        <div className="flex flex-col"><span className="text-sm font-bold text-white">{p.name}</span><span className="text-[8px] text-slate-500 uppercase">{p.country}</span></div>
                      </div>
                      <div className="text-right"><span className="font-orbitron font-bold text-cyan-400 text-xs block">IQ {p.iq}</span><span className="text-[9px] text-slate-500 font-bold">{p.score} PT</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="mt-auto py-6 text-slate-600 text-[8px] tracking-[0.4em] uppercase font-black z-10 pointer-events-none opacity-40">AI Evaluation Engine v3.4</footer>
    </div>
  );
};

export default App;
