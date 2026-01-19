
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
    icon: <Brain className="w-12 h-12 text-[#FF8800]" />
  },
  {
    title: "REGOLE DI CONNESSIONE",
    description: "Trascina il dito partendo da un Numero. Devi sempre alternare: Numero → Operatore → Numero. Non puoi collegare due numeri o due operatori direttamente.",
    icon: <RefreshCw className="w-12 h-12 text-[#FF8800]" />
  },
  {
    title: "IL POTERE DELLA STREAK",
    description: "Ogni successo consecutivo raddoppia i punti (5, 10, 20, 40, 80). Completa 5 successi per superare il livello. Un errore resetta la streak a 5 punti!",
    icon: <Zap className="w-12 h-12 text-[#FF8800]" />
  },
  {
    title: "TEMPO E CARRY-OVER",
    description: "Hai 60 secondi base. La vera sfida? Il tempo che risparmi in un livello viene aggiunto interamente a quello successivo. La velocità è la tua arma migliore.",
    icon: <Timer className="w-12 h-12 text-[#FF8800]" />
  },
  {
    title: "QI RANKING",
    description: "La nostra AI valuterà la tua velocità e precisione per stimare il tuo Quoziente Intellettivo. Scala la classifica globale e dimostra di essere una delle menti più brillanti.",
    icon: <Award className="w-12 h-12 text-[#FF8800]" />
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
    levelTargets: [],
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
  const theme = 'orange'; // Fixed theme
  const [levelBuffer, setLevelBuffer] = useState<{ grid: HexCellData[], targets: number[] }[]>([]);
  const timerRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const handleUserInteraction = useCallback(async () => {
    await soundService.init();
  }, []);

  const toggleMute = async (e?: React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    await handleUserInteraction();

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

  const createLevelData = useCallback(() => {
    const newGrid: HexCellData[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const isOperator = (r + c) % 2 !== 0;
        newGrid.push({
          id: `${r}-${c}`,
          row: r,
          col: c,
          type: 'number',
          value: isOperator
            ? OPERATORS[Math.floor(Math.random() * OPERATORS.length)]
            : Math.floor(Math.random() * 10).toString(),
        });
        newGrid[newGrid.length - 1].type = isOperator ? 'operator' : 'number';
      }
    }

    const targets: number[] = [];
    while (targets.length < 5) {
      const n1 = Math.floor(Math.random() * 15) + 1;
      const n2 = Math.floor(Math.random() * 10) + 1;
      const op = OPERATORS[Math.floor(Math.random() * 3)];
      let res = 0;
      if (op === '+') res = n1 + n2;
      if (op === '-') res = Math.max(1, n1 - n2);
      if (op === '×') res = n1 * n2;
      if (op === '÷') res = n1;
      if (res > 0 && !targets.includes(res)) {
        targets.push(res);
      }
    }

    return { grid: newGrid, targets };
  }, []);

  const generateGrid = useCallback(() => {
    let nextLevelData;
    let newBuffer = [...levelBuffer];

    if (newBuffer.length === 0) {
      // Initialize buffer if empty
      nextLevelData = createLevelData();
      for (let i = 0; i < 5; i++) {
        newBuffer.push(createLevelData());
      }
    } else {
      // Shift buffer
      nextLevelData = newBuffer.shift()!;
      // Replenish buffer
      newBuffer.push(createLevelData());
    }

    setGrid(nextLevelData.grid);
    setLevelBuffer(newBuffer);

    setGameState(prev => ({
      ...prev,
      targetResult: 0, // Legacy support, unused
      levelTargets: nextLevelData.targets.map(t => ({ value: t, completed: false }))
    }));
    setTargetAnimKey(k => k + 1);
  }, [levelBuffer, createLevelData]);

  const startGame = async () => {
    await handleUserInteraction();
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
      levelTargets: [],
    });
    // Reset buffer on start to ensure fresh sequence
    setLevelBuffer([]);
    // generateGrid will handle initialization because buffer is empty
    setTimeout(() => generateGrid(), 0);
  };

  const handleStartGameClick = async (e?: React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    await handleUserInteraction();
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

  const nextTutorialStep = async () => {
    await handleUserInteraction();
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
    // Check if result matches any uncompleted target
    const matchedTarget = gameState.levelTargets.find(t => t.value === result && !t.completed);

    if (matchedTarget) {
      handleSuccess(result!);
    } else {
      handleError();
    }
    setPreviewResult(null);
  };

  const handleSuccess = (matchedValue: number) => {
    soundService.playSuccess();
    const nextStreak = gameState.streak + 1;
    const currentPoints = gameState.basePoints * Math.pow(2, Math.min(nextStreak - 1, MAX_STREAK - 1));
    setScoreAnimKey(k => k + 1);

    // Update targets state
    const newTargets = gameState.levelTargets.map(t =>
      t.value === matchedValue ? { ...t, completed: true } : t
    );
    const allDone = newTargets.every(t => t.completed);

    if (allDone) {
      setIsVictoryAnimating(true);
      setTriggerParticles(true);
      setGameState(prev => ({
        ...prev,
        totalScore: prev.totalScore + currentPoints,
        streak: 0,
        estimatedIQ: Math.min(200, prev.estimatedIQ + 4),
        levelTargets: newTargets
      }));
      setTimeout(() => {
        setGameState(prev => {
          if (prev.status === 'idle') return prev;
          return {
            ...prev,
            level: prev.level + 1,
            status: 'level-complete'
          }
        });
        setIsVictoryAnimating(false);
        setTriggerParticles(false);
      }, 1200);
    } else {
      // Level Continues
      setGameState(prev => ({
        ...prev,
        totalScore: prev.totalScore + currentPoints,
        streak: nextStreak,
        estimatedIQ: Math.min(200, prev.estimatedIQ + 0.5),
        levelTargets: newTargets
      }));
      // Regenerate ONLY grid, keep targets
      setGrid(createLevelData().grid);
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

  const onStartInteraction = async (id: string) => {
    if (gameState.status !== 'playing' || isVictoryAnimating) return;
    await handleUserInteraction();

    const cell = grid.find(c => c.id === id);
    if (cell && cell.type === 'number') {
      soundService.playSelect();
      setIsDragging(true);
      setSelectedPath([id]);
      setPreviewResult(parseInt(cell.value));
    }
  };

  const isAdjacent = (cell1: HexCellData, cell2: HexCellData): boolean => {
    if (theme === 'orange') {
      const dr = Math.abs(cell1.row - cell2.row);
      const dc = Math.abs(cell1.col - cell2.col);
      // Rectilinear adjacency: Up/Down OR Left/Right
      return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
    }

    const dr = Math.abs(cell1.row - cell2.row);
    const dc = cell2.col - cell1.col;

    // Stessa riga
    if (dr === 0) return Math.abs(dc) === 1;

    // Righe adiacenti
    if (dr === 1) {
      // Per il sistema offset a righe pari
      if (cell1.row % 2 === 0) {
        return dc === 0 || dc === -1;
      } else {
        return dc === 0 || dc === 1;
      }
    }
    return false;
  };

  const onMoveInteraction = (id: string) => {
    if (!isDragging || gameState.status !== 'playing' || isVictoryAnimating) return;
    if (selectedPath.includes(id)) return;

    const lastId = selectedPath[selectedPath.length - 1];
    const lastCell = grid.find(c => c.id === lastId);
    const currentCell = grid.find(c => c.id === id);

    if (lastCell && currentCell) {
      // Regola 1: Alternanza Tipi (Numero -> Operatore o viceversa)
      const typeCheck = lastCell.type !== currentCell.type;

      // Regola 2: Adiacenza Fisica (Deve essere un vicino diretto nell'esagono)
      const adjacencyCheck = isAdjacent(lastCell, currentCell);

      if (typeCheck && adjacencyCheck) {
        soundService.playTick();
        const newPath = [...selectedPath, id];
        setSelectedPath(newPath);
        setPreviewResult(calculateResultFromPath(newPath));
      }
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
      className="h-[100dvh] w-full bg-gradient-to-t from-[#004488] to-[#0088dd] text-slate-100 flex flex-col items-center justify-center select-none relative overflow-hidden"
      onPointerDown={handleUserInteraction}
      onMouseUp={handleGlobalEnd}
      onTouchEnd={handleGlobalEnd}
    >


      <ParticleEffect trigger={triggerParticles} />

      {/* Abstract Curves Background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-[0.08]">
        <path d="M-100 200 Q 200 0 500 300 T 1000 100" stroke="white" strokeWidth="60" fill="none" />
        <path d="M-100 500 Q 300 300 600 600 T 1200 400" stroke="white" strokeWidth="40" fill="none" />
        <path d="M-100 800 Q 400 600 800 900 T 1300 700" stroke="white" strokeWidth="80" fill="none" />
        <path d="M800 -100 Q 600 300 900 600" stroke="white" strokeWidth="30" fill="none" />
      </svg>

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



      {gameState.status === 'idle' && (
        <div className="z-10 w-full max-w-xl flex flex-col items-center text-center px-6 py-10 animate-screen-in">
          <div className="mb-6 flex flex-col items-center">
            {/* Logo: Custom Shape Image with White Border & Brain */}
            {/* Logo: Pure Color CSS Mask Implementation */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-500">
              {/* 1. White Border Layer (Masked Div) */}
              <div className="absolute inset-0 bg-white" style={{
                maskImage: 'url(/oct.png)',
                WebkitMaskImage: 'url(/oct.png)',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
              }}></div>

              {/* 2. Orange Body Layer (Masked Div - Scaled Down) */}
              <div className="absolute inset-0 bg-[#FF8800] scale-[0.85]" style={{
                maskImage: 'url(/oct.png)',
                WebkitMaskImage: 'url(/oct.png)',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
              }}></div>

              {/* 3. Brain Icon - Centered */}
              <Brain className="relative w-16 h-16 text-white drop-shadow-md z-10" strokeWidth={2.5} />
            </div>

            <h1 className="text-6xl sm:text-8xl font-black font-orbitron tracking-tighter text-[#FF8800] lowercase" style={{ WebkitTextStroke: '3px white' }}>
              number
            </h1>
          </div>

          <div className="max-w-md bg-white/10 border-2 border-white/20 backdrop-blur-md px-8 py-4 rounded-2xl mb-10 shadow-[0_8px_0_rgba(0,0,0,0.1)] transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <p className="text-white text-sm sm:text-base font-bold leading-relaxed drop-shadow-sm">
              Sincronizza i tuoi neuroni. <br />
              Risolvi puzzle aritmetici in una corsa contro il tempo.
            </p>
          </div>

          <div className="flex flex-col gap-4 items-center w-full max-w-sm relative z-20">
            <button
              onPointerDown={handleStartGameClick}
              className="w-full group relative overflow-hidden flex items-center justify-center gap-4 bg-[#FF8800] text-white py-5 rounded-2xl font-orbitron font-black text-xl border-[4px] border-white shadow-[0_8px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300"
            >
              <Play className="w-8 h-8 fill-current" />
              <span className="tracking-widest">GIOCA</span>
            </button>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button onPointerDown={async (e) => { e.stopPropagation(); await handleUserInteraction(); soundService.playUIClick(); setTutorialStep(0); setActiveModal('tutorial'); }}
                className="flex items-center justify-center gap-2 bg-white text-[#FF8800] py-4 rounded-xl border-[3px] border-white shadow-[0_6px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none hover:scale-105 transition-all duration-300">
                <HelpCircle className="w-6 h-6" />
                <span className="font-orbitron text-xs font-black uppercase tracking-widest">Tutorial</span>
              </button>
              <button onPointerDown={async (e) => { e.stopPropagation(); await handleUserInteraction(); soundService.playUIClick(); setActiveModal('leaderboard'); }}
                className="flex items-center justify-center gap-2 bg-white text-[#FF8800] py-4 rounded-xl border-[3px] border-white shadow-[0_6px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none hover:scale-105 transition-all duration-300">
                <BarChart3 className="w-6 h-6" />
                <span className="font-orbitron text-xs font-black uppercase tracking-widest">Classifica</span>
              </button>
            </div>

            <button
              onPointerDown={toggleMute}
              className={`mt-2 flex items-center gap-3 px-6 py-3 rounded-2xl border-[3px] border-white transition-all duration-300 shadow-[0_6px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none hover:scale-105
                ${isMuted
                  ? 'bg-slate-300 text-slate-500'
                  : 'bg-white text-[#FF8800]'
                }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              <span className="font-orbitron text-xs font-black uppercase tracking-[0.2em]">
                Audio {isMuted ? 'OFF' : 'ON'}
              </span>
            </button>


          </div>
        </div>
      )}

      {gameState.status !== 'idle' && (
        <div className="w-full h-full flex flex-col items-center z-10 p-4 max-w-4xl animate-screen-in">
          <header className="w-full max-w-2xl mx-auto mb-2 relative z-50">
            <div className="
              relative w-full flex justify-between items-center px-4 py-3 rounded-[2.5rem] border-[4px] border-white shadow-[0_8px_0_rgba(0,0,0,0.15)]
              bg-[#FF8800]
              transition-all duration-300
            ">
              {/* Left Group: Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onPointerDown={goToHome}
                  className="w-11 h-11 rounded-full border-[3px] border-white flex items-center justify-center transition-all active:scale-90 shadow-md bg-white text-[#FF8800]"
                  title="Home"
                >
                  <Home className="w-6 h-6" />
                </button>
                <button
                  onPointerDown={toggleMute}
                  className="w-11 h-11 rounded-full border-[3px] border-white flex items-center justify-center transition-all active:scale-90 shadow-md bg-white text-[#FF8800]"
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
              </div>

              {/* Center: Floating Timer (Half-In/Half-Out) */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 transform translate-y-[-10%] z-20">
                <div className="relative w-24 h-24 rounded-full bg-slate-900 border-[4px] border-white flex items-center justify-center shadow-xl">
                  <svg className="absolute inset-0 w-full h-full -rotate-90 scale-90">
                    <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                    <circle
                      cx="50%" cy="50%" r="45%"
                      stroke={gameState.timeLeft < 10 ? '#ef4444' : '#FF8800'}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * gameState.timeLeft / INITIAL_TIME)}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="text-3xl font-black font-orbitron text-white">
                    {gameState.timeLeft}
                  </span>
                </div>
              </div>

              {/* Right Group: Stats */}
              <div className="flex items-center gap-3 pl-20 sm:pl-0">
                <div className="w-11 h-11 rounded-full border-[3px] border-white flex flex-col items-center justify-center shadow-md bg-white text-[#FF8800]">
                  <span className="text-[7px] font-black uppercase leading-none opacity-80 mb-0.5">PTS</span>
                  <span className="text-xs font-black font-orbitron leading-none tracking-tighter">{gameState.totalScore}</span>
                </div>
                <div className="w-11 h-11 rounded-full border-[3px] border-white flex flex-col items-center justify-center shadow-md bg-white text-[#FF8800]">
                  <span className="text-[7px] font-black uppercase leading-none opacity-80 mb-0.5">LV</span>
                  <span className="text-sm font-black font-orbitron leading-none">{gameState.level}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="relative flex-grow w-full flex flex-col items-center justify-center">
            {gameState.status === 'playing' && (
              <div className="w-full flex flex-col items-center h-full relative">
                {/* Info Row: Current Calculation Badge (Left) */}
                <div className="w-full max-w-2xl px-4 flex justify-start items-center min-h-[50px] mb-2 mt-6">
                  <div className={`transition-all duration-300 transform origin-left
                        ${isDragging && selectedPath.length > 0 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 -translate-x-4 pointer-events-none'}`}>
                    <div className={`px-5 py-2 rounded-xl border-[3px] flex items-center gap-3 shadow-md transition-colors duration-200
                          ${(previewResult !== null && gameState.levelTargets.some(t => t.value === previewResult && !t.completed))
                        ? 'bg-[#FF8800] border-white text-white scale-105'
                        : 'bg-white border-[#FF8800] text-[#FF8800]'}`}>
                      <span className="text-[10px] font-black uppercase tracking-wider opacity-80">Totale:</span>
                      <span className="text-2xl font-black font-orbitron leading-none">
                        {previewResult !== null ? previewResult : '...'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 mb-5">
                  {/* Level Targets List */}
                  <div className="flex gap-2 items-center flex-wrap justify-center max-w-[300px]">
                    {gameState.levelTargets.map((t, i) => (
                      <div key={i} className={`
                                flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300
                                ${t.completed
                          ? 'bg-[#FF8800] border-2 border-white scale-110 shadow-[0_0_15px_rgba(255,136,0,0.6)]'
                          : 'bg-[#0055AA] border-2 border-white/30 opacity-80'}
                                font-orbitron font-bold text-white text-md shadow-md
                             `}>
                        {t.value}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative flex-grow w-full flex items-center justify-center overflow-visible">
                  <div className={`relative mx-auto transition-all duration-300
                    ${theme === 'orange'
                      ? 'w-[calc(272px*var(--hex-scale))] h-[calc(376px*var(--hex-scale))]'
                      : 'w-[calc(400px*var(--hex-scale))] h-[calc(480px*var(--hex-scale))]'
                    }`}>
                    {grid.map(cell => (
                      <HexCell key={cell.id} data={cell} isSelected={selectedPath.includes(cell.id)} isSelectable={!isVictoryAnimating} onMouseEnter={onMoveInteraction} onMouseDown={onStartInteraction} theme={theme} />
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
        </div >
      )}

      {
        activeModal === 'tutorial' && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 modal-overlay bg-black/80" onPointerDown={() => { soundService.playUIClick(); setActiveModal(null); }}>
            <div className="bg-white border-[4px] border-[#FF8800] w-full max-w-md p-8 rounded-[2rem] shadow-[0_0_50px_rgba(255,136,0,0.3)] flex flex-col" onPointerDown={e => e.stopPropagation()}>
              <div className="flex flex-col items-center text-center py-4">
                <div className="mb-6 scale-125 drop-shadow-sm">{TUTORIAL_STEPS[tutorialStep].icon}</div>
                <h2 className="text-2xl font-black font-orbitron text-[#FF8800] mb-4 uppercase tracking-widest">{TUTORIAL_STEPS[tutorialStep].title}</h2>
                <p className="text-slate-600 font-bold text-sm leading-relaxed mb-10 border-t-2 border-slate-100 pt-4 w-full">{TUTORIAL_STEPS[tutorialStep].description}</p>
                <button onPointerDown={(e) => { e.stopPropagation(); nextTutorialStep(); }} className="w-full bg-[#FF8800] text-white border-[3px] border-white py-5 rounded-2xl font-orbitron font-black text-sm uppercase shadow-lg active:scale-95 transition-all outline-none ring-0">
                  {tutorialStep === TUTORIAL_STEPS.length - 1 ? 'GIOCA ORA' : 'AVANTI'}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        activeModal === 'leaderboard' && (
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
        )
      }

      <footer className="mt-auto py-6 text-slate-600 text-[8px] tracking-[0.4em] uppercase font-black z-10 pointer-events-none opacity-40">AI Evaluation Engine v3.6</footer>
    </div >
  );
};

export default App;
