import React, { useEffect, useState, useRef } from 'react';
import { HexCellData } from '../types';

interface HexCellProps {
  data: HexCellData;
  isSelected: boolean;
  isSelectable: boolean;
  onMouseEnter: (id: string) => void;
  onMouseDown: (id: string) => void;
  theme?: 'default' | 'orange';
  isBossLevel?: boolean;
  bossLevelId?: number | null;
  pathStatus?: 'correct' | 'wrong' | null;
}

const HexCell: React.FC<HexCellProps> = ({
  data,
  isSelected,
  isSelectable,
  onMouseEnter,
  onMouseDown,
  theme = 'default',
  isBossLevel = false,
  bossLevelId = null,
  pathStatus = null,
}) => {
  const [animationClass, setAnimationClass] = useState('animate-hex-entry');
  const prevSelected = useRef(isSelected);
  const isNumber = data.type === 'number';

  // Posizionamento basato su scala variabile CSS
  const isOrangeTheme = theme === 'orange';

  // For Orange theme: Rectilinear grid with centered alignment
  const rowSpacing = isOrangeTheme ? 52 : 65;
  const colSpacing = isOrangeTheme ? 52 : 75;
  const offsetAmount = isOrangeTheme ? 0 : 38;

  const topValue = data.row * rowSpacing;
  const leftValue = data.col * colSpacing + (data.row % 2 === 1 ? offsetAmount : 0);

  // Tema visivo migliorato per operatori per massima leggibilità e stile
  const getOperatorTheme = (val: string) => {
    switch (val) {
      case '+': return {
        text: 'text-[#82c9a2] drop-shadow-[0_0_10px_rgba(130,201,162,0.6)]',
        bg: 'bg-emerald-950/30 shadow-[inset_0_0_15px_rgba(130,201,162,0.2)]',
        border: 'border-[#82c9a2]/40'
      };
      case '-': return {
        text: 'text-[#d698b0] drop-shadow-[0_0_10px_rgba(214,152,176,0.6)]',
        bg: 'bg-rose-950/30 shadow-[inset_0_0_15px_rgba(214,152,176,0.2)]',
        border: 'border-[#d698b0]/40'
      };
      case '×': return {
        text: 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]',
        bg: 'bg-amber-900/40 shadow-[inset_0_0_20px_rgba(245,158,11,0.3)]',
        border: 'border-amber-500/50'
      };
      case '÷': return {
        text: 'text-violet-400 drop-shadow-[0_0_15px_rgba(167,139,250,0.9)]',
        bg: 'bg-violet-900/40 shadow-[inset_0_0_20px_rgba(139,92,246,0.3)]',
        border: 'border-violet-500/50'
      };
      default: return {
        text: 'text-white',
        bg: 'bg-slate-900/60',
        border: 'border-white/10'
      };
    }
  };

  const operatorTheme = getOperatorTheme(data.value);
  // Shape logic: Default uses css-clip. Orange uses specific shapes per type.
  const shapeClass = theme === 'orange'
    ? 'octagon-clip'
    : 'hexagon-clip';

  // Gestione animazioni di selezione e deselezione
  useEffect(() => {
    if (isSelected && !prevSelected.current) {
      setAnimationClass('animate-hex-select');
    } else if (!isSelected && prevSelected.current) {
      setAnimationClass('animate-hex-deselect');
    }
    prevSelected.current = isSelected;
  }, [isSelected]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    onMouseDown(data.id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element) {
      const cellId = element.closest('[data-cell-id]')?.getAttribute('data-cell-id');
      if (cellId) {
        onMouseEnter(cellId);
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onMouseDown(data.id);
  };

  const isInteractive = (isSelectable || isSelected) && !data.isFallen && !data.finaleMode;

  const cellAnimation = data.finaleMode === 'win'
    ? 'animate-crystal-finale-burst'
    : data.finaleMode === 'lose'
      ? 'animate-crystal-finale-fall'
      : data.isFallen
        ? 'animate-fallen'
        : data.isVibrating
          ? 'animate-vibrate'
          : animationClass;

  const finaleStyle: React.CSSProperties = data.finaleMode === 'win'
    ? {
        ['--burst-x' as string]: `${data.finaleBurstX ?? 0}px`,
        ['--burst-y' as string]: `${data.finaleBurstY ?? 0}px`,
        ['--burst-rot' as string]: `${data.finaleBurstRot ?? 90}deg`,
        animationDelay: `${data.finaleDelayMs ?? 0}ms`,
      }
    : data.finaleMode === 'lose'
      ? {
          ['--fall-drift' as string]: `${data.finaleFallDrift ?? 0}px`,
          ['--fall-rot' as string]: `${data.finaleFallRot ?? 0}deg`,
          animationDelay: `${data.finaleDelayMs ?? 0}ms`,
        }
      : {};

  return (
    <div
      className={`absolute transition-transform duration-[75ms] ease-out flex items-center justify-center pointer-events-none
        ${isOrangeTheme ? '' : shapeClass} 
        ${!isOrangeTheme ? 'border-2' : ''} 
        ${cellAnimation}
        ${isOrangeTheme ? 'w-[calc(52px*var(--hex-scale))] h-[calc(52px*var(--hex-scale))]' : ''}
        ${!isOrangeTheme ? 'w-[calc(64px*var(--hex-scale))] h-[calc(72px*var(--hex-scale))]' : ''}
        ${isSelected && !data.finaleMode
          ? isOrangeTheme ? 'z-20 scale-[1.14]' : 'bg-cyan-400 shadow-[0_0_48px_rgba(34,211,238,1)] z-20 border-white scale-110'
          : isOrangeTheme
            ? data.finaleMode ? '' : 'active:scale-95'
            : isNumber
              ? bossLevelId === 2
                ? 'bg-gradient-to-br from-amber-700 to-amber-500 border-amber-600 active:scale-95 text-amber-50'
                : 'bg-slate-800/95 border-white/10 active:scale-95 hover:bg-slate-700/95'
              : bossLevelId === 2
                ? 'bg-gradient-to-br from-amber-800 to-amber-600 border-amber-700 active:scale-95 text-amber-100'
                : `${operatorTheme.bg} ${operatorTheme.border} active:scale-95 hover:brightness-125`
        }
        ${data.isFallen && !data.finaleMode ? 'opacity-0 scale-50 pointer-events-none translate-y-20' : ''}
        ${(!isSelectable && !isSelected) && !data.isFallen && !data.finaleMode ? 'opacity-20' : ''}
      `}
      style={{
        top: `calc(${topValue}px * var(--hex-scale))`,
        left: `calc(${leftValue}px * var(--hex-scale))`,
        animationDelay: (!data.finaleMode && animationClass === 'animate-hex-entry' && !data.isFallen) ? `${data.row * 0.09}s` : undefined,
        ...finaleStyle,
      }}
      data-cell-id={data.id}
    >
      {/* Interactive Hit Area - Clipped to shape only for default theme. For orange theme, uses full square to eliminate drag dead zones. */}
      <div
        className={`absolute inset-0 ${isInteractive ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'} ${isOrangeTheme ? '' : shapeClass} z-40`}
        style={{ touchAction: 'none' }}
        data-cell-id={data.id}
        onMouseDown={() => onMouseDown(data.id)}
        onMouseEnter={() => onMouseEnter(data.id)}
        onPointerDown={handlePointerDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      />

      {isOrangeTheme && isSelected && !pathStatus && (
        <div
          className="absolute inset-0 pointer-events-none z-[4]"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255,160,50,0.32) 0%, rgba(255,120,20,0.14) 42%, transparent 72%)',
            clipPath: 'polygon(29.29% 0%, 70.71% 0%, 100% 29.29%, 100% 70.71%, 70.71% 100%, 29.29% 100%, 0% 70.71%, 0% 29.29%)',
            transform: isNumber ? 'scale(2.2)' : 'scale(1.05)',
          }}
        />
      )}

      {/* PNG Background for Orange Theme Octagons (Numbers and Operators) */}
      {isOrangeTheme && (
        <img
          src="/ottagonocristallo.png"
          alt="cell"
          className="hex-crystal-img absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{
            transform: isNumber ? 'scale(2.5)' : 'scale(1.17)',
            opacity: isSelected ? 1 : 0.95,
            filter: (() => {
              const tone = `brightness(var(--hex-crystal-brightness)) contrast(var(--hex-crystal-contrast)) saturate(var(--hex-crystal-saturate))`;
              const shadow = 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))';

              let glowEffect = '';
              if (isSelected) {
                const selectBoost = ' brightness(var(--hex-select-brightness)) contrast(var(--hex-select-contrast)) saturate(var(--hex-select-saturate)) drop-shadow(0 0 var(--hex-select-glow-spread) rgba(255,136,0,var(--hex-select-glow-alpha))) drop-shadow(0 0 calc(var(--hex-select-glow-spread) * 1.65) rgba(255,190,80,calc(var(--hex-select-glow-alpha) * 0.58)))';
                if (pathStatus === 'correct') {
                  glowEffect = `${selectBoost} hue-rotate(95deg) saturate(1.16) brightness(1.08) drop-shadow(0 0 12px rgba(16,185,129,0.31))`;
                } else if (pathStatus === 'wrong') {
                  glowEffect = `${selectBoost} hue-rotate(335deg) saturate(1.18) brightness(1.08) drop-shadow(0 0 12px rgba(239,68,68,0.31))`;
                } else {
                  glowEffect = selectBoost;
                }
              }

              if (isNumber) {
                if (isBossLevel) {
                  return bossLevelId === 2
                    ? `brightness(0.6) sepia(0.8) saturate(1.1) ${shadow}`
                    : `hue-rotate(100deg) saturate(1.1) brightness(0.7) ${shadow}`;
                }
                return `${shadow} ${tone}${glowEffect}`;
              }

              let opHue = 'none';
              switch (data.value) {
                case '+': opHue = 'hue-rotate(95deg) saturate(0.9) brightness(1.0)'; break;
                case '-': opHue = 'hue-rotate(295deg) saturate(0.92) brightness(1.02)'; break;
                case '×': opHue = 'hue-rotate(18deg) saturate(0.9) brightness(1.02)'; break;
                case '÷': opHue = 'hue-rotate(235deg) saturate(1.0) brightness(0.95)'; break;
              }
              return `${opHue} ${shadow} ${tone}${glowEffect}`;
            })(),
            transition: 'opacity 0.08s ease-out'
          }}
        />
      )}

      {/* Flash Reflect Overlay - speculare bianco durante glow corretto o errato */}
      {isSelected && (pathStatus === 'correct' || pathStatus === 'wrong') && (
        <div
          className="absolute inset-0 pointer-events-none z-30 animate-hex-flash-reflect"
          style={{
            background: pathStatus === 'correct'
              ? 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.12) 50%, transparent 100%)'
              : 'linear-gradient(135deg, rgba(255,200,200,0.52) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            // Clip al contorno esatto della cella per evitare alone quadrato
            clipPath: isOrangeTheme
              ? 'polygon(29.29% 0%, 70.71% 0%, 100% 29.29%, 100% 70.71%, 70.71% 100%, 29.29% 100%, 0% 70.71%, 0% 29.29%)'
              : undefined,
          }}
        />
      )}

      {!isOrangeTheme && (
        <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none ${isSelected ? 'opacity-50' : 'opacity-10'}`}></div>
      )}

      <span 
        className={`font-orbitron font-black select-none transition-transform duration-[75ms] ease-out leading-none z-10 pointer-events-none
          ${isSelected
            ? 'text-white scale-[1.14]'
            : isOrangeTheme && isNumber
              ? 'text-white text-[calc(2.8rem*var(--hex-scale))] drop-shadow-lg'
              : isOrangeTheme && !isNumber
                ? 'text-white text-[calc(1.4rem*var(--hex-scale))] drop-shadow-md'
                : isNumber
                  ? bossLevelId === 2
                    ? 'text-amber-50 text-[calc(2.6rem*var(--hex-scale))] drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]'
                    : 'text-cyan-400 text-[calc(2.6rem*var(--hex-scale))] drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]'
                  : bossLevelId === 2
                    ? 'text-amber-200 text-[calc(3.4rem*var(--hex-scale))] drop-shadow-[0_0_15px_rgba(120,53,15,0.5)]'
                    : `${operatorTheme.text} text-[calc(3.4rem*var(--hex-scale))]`
          }`}
        style={isOrangeTheme ? {
          textShadow: isSelected
            ? `0 -2px 3px rgba(0, 0, 0, 0.95), 0 2px 4px rgba(255, 255, 255, 0.32), 0 0 10px rgba(255, 255, 255, 0.38), 0 0 14px rgba(255, 136, 0, var(--hex-num-orange-glow-selected)), 0 0 22px rgba(255, 180, 60, calc(var(--hex-num-orange-glow-selected) * 0.72)), -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000`
            : `0 -2px 3px rgba(0, 0, 0, 0.95), 0 2px 3px rgba(255, 255, 255, 0.28), 0 0 8px rgba(255, 136, 0, var(--hex-num-orange-glow)), -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000`
        } : undefined}
      >
        {data.value}
      </span>
    </div>
  );
};

export default HexCell;
