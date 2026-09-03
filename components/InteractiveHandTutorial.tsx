import React, { useEffect, useState, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  InteractiveTutorialStep,
  getTutorialTargetElementId,
} from '../constants/interactiveTutorial';

interface InteractiveHandTutorialProps {
  step: InteractiveTutorialStep;
  message: string;
  continueLabel: string;
  pathHintLabel?: string;
  onContinue: () => void;
  isVisible: boolean;
}

const InteractiveHandTutorial: React.FC<InteractiveHandTutorialProps> = ({
  step,
  message,
  continueLabel,
  pathHintLabel = 'Follow the hand and tap the highlighted cell',
  onContinue,
  isVisible,
}) => {
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const isPathStep = step.kind === 'path';
  const showContinue = step.kind === 'info' || step.kind === 'complete';
  const useSpotlight = step.kind === 'info';

  const resolveHighlightElement = useCallback((): Element | null => {
    if (step.kind === 'path') {
      return document.querySelector(`[data-cell-id="${step.cellId}"]`);
    }
    if (step.kind === 'info') {
      return document.getElementById(getTutorialTargetElementId(step.target));
    }
    return null;
  }, [step]);

  const updateRects = useCallback(() => {
    const highlightEl = resolveHighlightElement();
    setHighlightRect(highlightEl ? highlightEl.getBoundingClientRect() : null);
  }, [resolveHighlightElement]);

  useEffect(() => {
    if (!isVisible) {
      setHighlightRect(null);
      return;
    }

    updateRects();
    const raf = requestAnimationFrame(updateRects);
    window.addEventListener('resize', updateRects);
    window.addEventListener('scroll', updateRects, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateRects);
      window.removeEventListener('scroll', updateRects, true);
    };
  }, [isVisible, updateRects, step, message, continueLabel]);

  if (!isVisible) return null;

  const bubbleStyle: React.CSSProperties = showContinue
    ? {
        position: 'fixed',
        bottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(300px, calc(100vw - 24px))',
        zIndex: 100001,
      }
    : highlightRect
      ? (() => {
          const bubbleWidth = 260;
          const padding = 16;
          const spaceBelow = window.innerHeight - highlightRect.bottom;
          let leftPos = highlightRect.left + highlightRect.width / 2 - bubbleWidth / 2;
          leftPos = Math.max(12, Math.min(leftPos, window.innerWidth - bubbleWidth - 12));

          if (spaceBelow > 180) {
            return {
              top: highlightRect.bottom + padding,
              left: leftPos,
              position: 'fixed' as const,
              width: bubbleWidth,
              zIndex: 100001,
            };
          }
          return {
            top: Math.max(12, highlightRect.top - 160),
            left: leftPos,
            position: 'fixed' as const,
            width: bubbleWidth,
            zIndex: 100001,
          };
        })()
      : {
          position: 'fixed',
          bottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(300px, calc(100vw - 24px))',
          zIndex: 100001,
        };

  return (
    <div className="fixed inset-0 z-[99998] pointer-events-none">
      {useSpotlight && (
        <div
          className="absolute inset-0 bg-black/50 pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()}
        />
      )}

      {highlightRect && isPathStep && (
        <div
          className="absolute border-[4px] border-[#FF8800] rounded-xl z-[99999] pointer-events-none box-content animate-pulse"
          style={{
            top: highlightRect.top - 6,
            left: highlightRect.left - 6,
            width: highlightRect.width + 12,
            height: highlightRect.height + 12,
            boxShadow: '0 0 18px rgba(255, 136, 0, 0.65)',
          }}
        />
      )}

      {highlightRect && useSpotlight && (
        <div
          className="absolute border-[4px] border-[#FF8800] rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] z-[99999] pointer-events-none box-content"
          style={{
            top: highlightRect.top - 6,
            left: highlightRect.left - 6,
            width: highlightRect.width + 12,
            height: highlightRect.height + 12,
          }}
        />
      )}

      <div
        className={`transition-all duration-300 ${showContinue ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={bubbleStyle}
      >
        <div className="bg-white border-[3px] border-slate-900 rounded-2xl shadow-2xl relative">
          <div className="p-4">
            <p className="text-slate-700 font-bold text-sm leading-relaxed font-comic mb-3">
              {message}
            </p>

            {isPathStep && (
              <p className="text-[10px] font-black uppercase tracking-wider text-[#FF8800] font-orbitron">
                {pathHintLabel}
              </p>
            )}

            {showContinue && (
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onContinue();
                }}
                className="w-full mt-2 bg-slate-900 text-white py-2.5 rounded-lg font-orbitron font-black uppercase text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#FF8800]"
              >
                {continueLabel}
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveHandTutorial;
