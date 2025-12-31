
import React, { useEffect, useState, useRef } from 'react';
import { HexCellData } from '../types';

interface HexCellProps {
  data: HexCellData;
  isSelected: boolean;
  isSelectable: boolean;
  onMouseEnter: (id: string) => void;
  onMouseDown: (id: string) => void;
}

const HexCell: React.FC<HexCellProps> = ({
  data,
  isSelected,
  isSelectable,
  onMouseEnter,
  onMouseDown,
}) => {
  const [animationClass, setAnimationClass] = useState('animate-hex-entry');
  const prevSelected = useRef(isSelected);
  const isNumber = data.type === 'number';
  
  // Posizionamento basato su scala variabile CSS
  const topValue = data.row * 65;
  const leftValue = data.col * 75 + (data.row % 2 === 1 ? 38 : 0);

  // Tema visivo migliorato per operatori per massima leggibilità e stile
  const getOperatorTheme = (val: string) => {
    switch (val) {
      case '+': return { 
        text: 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.9)]', 
        bg: 'bg-emerald-900/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.3)]', 
        border: 'border-emerald-500/50' 
      };
      case '-': return { 
        text: 'text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.9)]', 
        bg: 'bg-rose-900/40 shadow-[inset_0_0_20px_rgba(244,63,94,0.3)]', 
        border: 'border-rose-500/50' 
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

  const theme = getOperatorTheme(data.value);

  // Gestione animazioni di selezione e deselezione
  useEffect(() => {
    if (isSelected && !prevSelected.current) {
      setAnimationClass('animate-hex-select');
    } else if (!isSelected && prevSelected.current) {
      setAnimationClass('animate-hex-deselect');
    }
    prevSelected.current = isSelected;
  }, [isSelected]);

  // Delay di ingresso basato sulla posizione per un effetto "wave"
  const entryDelay = (data.row * 0.05) + (data.col * 0.05);

  const handleTouchStart = (e: React.TouchEvent) => {
    onMouseDown(data.id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element) {
      const cellId = element.closest('[data-cell-id]')?.getAttribute('data-cell-id');
      if (cellId) {
        onMouseEnter(cellId);
      }
    }
  };

  return (
    <div
      className={`absolute w-[calc(64px*var(--hex-scale))] h-[calc(72px*var(--hex-scale))] transition-all duration-300 cursor-pointer flex items-center justify-center hexagon-clip border-2 ${animationClass}
        ${isSelected 
          ? 'bg-cyan-400 shadow-[0_0_40px_rgba(34,211,238,1)] z-20 border-white scale-110' 
          : isNumber 
            ? 'bg-slate-800/95 border-white/10 active:scale-95 hover:bg-slate-700/95' 
            : `${theme.bg} ${theme.border} active:scale-95 hover:brightness-125`
        }
        ${!isSelectable && !isSelected ? 'opacity-20 pointer-events-none' : ''}
      `}
      style={{ 
        top: `calc(${topValue}px * var(--hex-scale))`, 
        left: `calc(${leftValue}px * var(--hex-scale))`,
        animationDelay: animationClass === 'animate-hex-entry' ? `${entryDelay}s` : '0s'
      }}
      data-cell-id={data.id}
      onMouseDown={() => onMouseDown(data.id)}
      onMouseEnter={() => onMouseEnter(data.id)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none ${isSelected ? 'opacity-50' : 'opacity-10'}`}></div>
      
      <span className={`font-orbitron font-black select-none transition-all duration-200 leading-none pt-0.5
        ${isSelected 
          ? 'text-slate-950 scale-110' 
          : isNumber 
            ? 'text-cyan-400 text-[calc(2.6rem*var(--hex-scale))] drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]' 
            : `${theme.text} text-[calc(3.4rem*var(--hex-scale))]`
        }`}>
        {data.value}
      </span>
    </div>
  );
};

export default HexCell;
