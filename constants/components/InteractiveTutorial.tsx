import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Target, X, Zap, CheckCircle, Play } from 'lucide-react';

interface InteractiveTutorialProps {
    onComplete: () => void;
    grid: any[];
    targets: number[];
}

interface DemoStep {
    message: string;
    icon: React.ReactNode;
    highlightCells?: string[];
    highlightTarget?: number;
    duration: number;
    isError?: boolean;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
    onComplete,
    grid,
    targets
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [demoSteps, setDemoSteps] = useState<DemoStep[]>([]);

    // Find valid paths for demonstration
    const findDemoPaths = useCallback(() => {
        if (!grid || grid.length === 0 || !targets || targets.length === 0) return;
        const steps: DemoStep[] = [];

        // Step 1: Introduction
        steps.push({
            message: "👀 Guarda! Ora ti mostro come trovare un Target...",
            icon: <Sparkles className="w-6 h-6" />,
            duration: 4000
        });

        // Find first valid combination
        const firstTarget = targets[0];
        const firstPath = findSimplePath(firstTarget);
        if (firstPath) {
            steps.push({
                message: `🎯 Cerco di fare ${firstTarget}... Collego le celle verdi trascinando il dito!`,
                icon: <Target className="w-6 h-6" />,
                highlightCells: firstPath,
                highlightTarget: firstTarget,
                duration: 6000
            });

            steps.push({
                message: `✅ Perfetto! Risultato trovato: ${firstTarget}!`,
                icon: <CheckCircle className="w-6 h-6" />,
                highlightCells: firstPath,
                highlightTarget: firstTarget,
                duration: 4000
            });
        }

        // Find a wrong combination
        const wrongPath = findWrongPath();
        if (wrongPath) {
            steps.push({
                message: "❌ Ops! Se il risultato è sbagliato (es. Rosso), il target non viene completato...",
                icon: <X className="w-6 h-6" />,
                highlightCells: wrongPath,
                duration: 5000,
                isError: true
            });
        }

        // Find second valid combination (or different target)
        const secondTarget = targets.find(t => t !== firstTarget) || targets[1];
        const secondPath = findSimplePath(secondTarget);
        if (secondPath) {
            steps.push({
                message: `⚡ Ora provo con ${secondTarget}... Basta unire numero + operatore + numero!`,
                icon: <Zap className="w-6 h-6" />,
                highlightCells: secondPath,
                highlightTarget: secondTarget,
                duration: 6000
            });

            steps.push({
                message: "🎉 Ecco fatto! Hai completato un altro target!",
                icon: <CheckCircle className="w-6 h-6" />,
                highlightCells: secondPath,
                highlightTarget: secondTarget,
                duration: 4000
            });
        }

        // Final message
        steps.push({
            message: "🤔 Tutto chiaro? Ricorda: trascina tra le celle per collegarle!",
            icon: <Play className="w-6 h-6" />,
            duration: 999999 // Effectively wait forever
        });

        setDemoSteps(steps);
    }, [grid, targets]);

    // Simple path finder (finds a basic 3-cell combination)
    const findSimplePath = (targetValue: number): string[] | null => {
        const numberCells = grid.filter(c => c.type === 'number');
        const opCells = grid.filter(c => c.type === 'operator');

        for (const num1 of numberCells) {
            const adjacentOps = opCells.filter(op => isAdjacent(num1, op));

            for (const op of adjacentOps) {
                const adjacentNums = numberCells.filter(num2 =>
                    num2.id !== num1.id && isAdjacent(op, num2)
                );

                for (const num2 of adjacentNums) {
                    const result = calculateSimple(
                        parseInt(num1.value),
                        op.value,
                        parseInt(num2.value)
                    );

                    if (result === targetValue) {
                        return [num1.id, op.id, num2.id];
                    }
                }
            }
        }
        return null;
    };

    // Find a wrong path (doesn't match any target)
    const findWrongPath = (): string[] | null => {
        const numberCells = grid.filter(c => c.type === 'number');
        const opCells = grid.filter(c => c.type === 'operator');

        for (const num1 of numberCells) {
            const adjacentOps = opCells.filter(op => isAdjacent(num1, op));

            for (const op of adjacentOps) {
                const adjacentNums = numberCells.filter(num2 =>
                    num2.id !== num1.id && isAdjacent(op, num2)
                );

                for (const num2 of adjacentNums) {
                    const result = calculateSimple(
                        parseInt(num1.value),
                        op.value,
                        parseInt(num2.value)
                    );

                    if (!targets.includes(result)) {
                        return [num1.id, op.id, num2.id];
                    }
                }
            }
        }
        return null;
    };

    const isAdjacent = (cell1: any, cell2: any): boolean => {
        const dr = Math.abs(cell1.row - cell2.row);
        const dc = Math.abs(cell1.col - cell2.col);
        return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
    };

    const calculateSimple = (num1: number, op: string, num2: number): number => {
        switch (op) {
            case '+': return num1 + num2;
            case '-': return num1 - num2;
            case '×': return num1 * num2;
            case '÷': return num2 !== 0 ? Math.floor(num1 / num2) : 0;
            default: return 0;
        }
    };

    useEffect(() => {
        findDemoPaths();
    }, [findDemoPaths]);

    useEffect(() => {
        if (demoSteps.length === 0 || currentStep >= demoSteps.length) {
            return;
        }

        const step = demoSteps[currentStep];

        // Add highlight class to cells
        if (step.highlightCells) {
            step.highlightCells.forEach(cellId => {
                const cellElement = document.querySelector(`[data-cell-id="${cellId}"]`);
                if (cellElement) {
                    cellElement.classList.add('tutorial-highlight');
                    if (step.isError) {
                        cellElement.classList.add('tutorial-error');
                    }
                }
            });
        }

        // Add highlight to target
        if (step.highlightTarget !== undefined) {
            const targetElement = document.querySelector(`[data-target-value="${step.highlightTarget}"]`);
            if (targetElement) {
                targetElement.classList.add('tutorial-target-highlight');
            }
        }

        // Auto-proceed unless it's the last step
        if (currentStep < demoSteps.length - 1) {
            const timer = setTimeout(() => {
                // Remove highlight class
                if (step.highlightCells) {
                    step.highlightCells.forEach(cellId => {
                        const cellElement = document.querySelector(`[data-cell-id="${cellId}"]`);
                        if (cellElement) {
                            cellElement.classList.remove('tutorial-highlight', 'tutorial-error');
                        }
                    });
                }
                if (step.highlightTarget !== undefined) {
                    const targetElement = document.querySelector(`[data-target-value="${step.highlightTarget}"]`);
                    if (targetElement) {
                        targetElement.classList.remove('tutorial-target-highlight');
                    }
                }
                setCurrentStep(s => s + 1);
            }, step.duration);

            return () => {
                clearTimeout(timer);
                // Cleanup highlights
                if (step.highlightCells) {
                    step.highlightCells.forEach(cellId => {
                        const cellElement = document.querySelector(`[data-cell-id="${cellId}"]`);
                        if (cellElement) {
                            cellElement.classList.remove('tutorial-highlight', 'tutorial-error');
                        }
                    });
                }
                if (step.highlightTarget !== undefined) {
                    const targetElement = document.querySelector(`[data-target-value="${step.highlightTarget}"]`);
                    if (targetElement) {
                        targetElement.classList.remove('tutorial-target-highlight');
                    }
                }
            };
        }
    }, [currentStep, demoSteps, onComplete]);

    if (demoSteps.length === 0 || currentStep >= demoSteps.length) return null;

    const step = demoSteps[currentStep];
    const isLastStep = currentStep === demoSteps.length - 1;

    return (
        <>
            {/* Speech Bubble */}
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none animate-fadeIn">
                <div className="relative pointer-events-auto">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl border-4 border-white/30 max-w-md mx-auto backdrop-blur-sm animate-float ${step.isError
                        ? 'bg-gradient-to-br from-red-500 to-orange-600'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                        } text-white`}>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1 animate-pulse text-white">
                                    {step.icon}
                                </div>
                                <p className="font-bold text-lg leading-tight">{step.message}</p>
                            </div>

                            {isLastStep && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onComplete();
                                    }}
                                    className="w-full bg-white text-blue-600 py-3 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg hover:scale-105 active:scale-95 transition-all mt-2"
                                >
                                    Sì, torna alla Home
                                </button>
                            )}
                        </div>
                    </div>
                    <div className={`absolute left-1/2 -translate-x-1/2 -bottom-3 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] ${step.isError ? 'border-t-orange-600' : 'border-t-blue-600'
                        }`}></div>
                </div>
            </div>

            {/* Add CSS for tutorial highlights */}
            <style>{`
                .tutorial-highlight {
                    background-color: #10b981 !important; /* Emerald 500 */
                    color: white !important;
                    animation: tutorial-pulse 1s ease-in-out infinite;
                    box-shadow: 0 0 20px 8px rgba(16, 185, 129, 0.7) !important;
                    z-index: 50 !important;
                    border-color: white !important;
                }
                .tutorial-error {
                    background-color: #ef4444 !important; /* Red 500 */
                    box-shadow: 0 0 20px 8px rgba(239, 68, 68, 0.7) !important;
                    border-color: white !important;
                }
                .tutorial-target-highlight {
                    animation: target-pulse 1.2s ease-in-out infinite;
                    box-shadow: 0 0 30px 12px rgba(255, 255, 255, 1) !important;
                    background-color: #FF8800 !important;
                    border-color: white !important;
                    transform: scale(1.15);
                    z-index: 100 !important;
                }
                @keyframes tutorial-pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.18);
                    }
                }
                @keyframes target-pulse {
                    0%, 100% {
                        transform: scale(1.15);
                        filter: brightness(1);
                    }
                    50% {
                        transform: scale(1.35);
                        filter: brightness(1.4);
                    }
                }
            `}</style>
        </>
    );
};

export default InteractiveTutorial;
