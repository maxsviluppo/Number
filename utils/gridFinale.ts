import { HexCellData } from '../types';

export const GRID_FINALE_TITLE_HOLD_MS = 5000;
export const GRID_FINALE_WIN_AUDIO_ADVANCE_MS = 2000;
export const GRID_FINALE_WIN_BURST_MS = 1750;
export const GRID_FINALE_WIN_STAGGER_MS = 780;

const TITLE_REVEAL_MS = { win: 1180, lose: 980 } as const;

export function getGridFinaleTitleRevealMs(mode: 'win' | 'lose'): number {
  return TITLE_REVEAL_MS[mode];
}

/** Delay from finale start until modal (title visible for at least GRID_FINALE_TITLE_HOLD_MS). */
export function getGridFinalePostDelay(mode: 'win' | 'lose'): number {
  return TITLE_REVEAL_MS[mode] + GRID_FINALE_TITLE_HOLD_MS;
}

/** When to play win audio relative to finale start (2s before modal). */
export function getGridFinaleWinAudioDelay(): number {
  return Math.max(0, getGridFinalePostDelay('win') - GRID_FINALE_WIN_AUDIO_ADVANCE_MS);
}

export function buildGridFinaleCells(
  grid: HexCellData[],
  mode: 'win' | 'lose',
  isOrangeTheme: boolean
): HexCellData[] {
  if (grid.length === 0) return grid;

  const rowSpacing = isOrangeTheme ? 52 : 65;
  const colSpacing = isOrangeTheme ? 52 : 75;
  const offsetAmount = isOrangeTheme ? 0 : 38;

  let centerRow = 0;
  let centerCol = 0;
  grid.forEach(c => {
    centerRow += c.row;
    centerCol += c.col;
  });
  centerRow /= grid.length;
  centerCol /= grid.length;

  const centerX = centerCol * colSpacing + (Math.round(centerRow) % 2 === 1 ? offsetAmount : 0);
  const centerY = centerRow * rowSpacing;

  const distEntries = grid.map(cell => {
    const cellX = cell.col * colSpacing + (cell.row % 2 === 1 ? offsetAmount : 0);
    const cellY = cell.row * rowSpacing;
    const dist = Math.hypot(cellX - centerX, cellY - centerY);
    return { cell, cellX, cellY, dist };
  });

  const maxDist = Math.max(...distEntries.map(e => e.dist), 1);

  return distEntries.map(({ cell, cellX, cellY, dist }) => {
    if (mode === 'win') {
      const dx = cellX - centerX;
      const dy = cellY - centerY;
      const radial = dist || 1;
      const normX = dx / radial;
      const normY = dy / radial;
      const burstDist = 125 + Math.random() * 70 + dist * 0.55;
      const spinDir = Math.random() > 0.5 ? 1 : -1;
      // Outer crystals leave first, inner ones last (wave toward center)
      const outerRatio = dist / maxDist;
      const finaleDelayMs = (1 - outerRatio) * GRID_FINALE_WIN_STAGGER_MS + Math.random() * 55;

      return {
        ...cell,
        finaleMode: 'win' as const,
        finaleBurstX: normX * burstDist,
        finaleBurstY: normY * burstDist,
        finaleBurstRot: spinDir * (35 + Math.random() * 55),
        finaleDelayMs,
        finaleDurationMs: GRID_FINALE_WIN_BURST_MS + Math.random() * 220,
      };
    }

    return {
      ...cell,
      finaleMode: 'lose' as const,
      finaleDelayMs: Math.random() * 550,
      finaleFallDrift: (Math.random() - 0.5) * 70,
      finaleFallRot: (Math.random() - 0.5) * 140,
    };
  });
}
