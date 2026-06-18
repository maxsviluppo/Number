import { HexCellData } from '../types';

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

  return grid.map(cell => {
    const cellX = cell.col * colSpacing + (cell.row % 2 === 1 ? offsetAmount : 0);
    const cellY = cell.row * rowSpacing;

    if (mode === 'win') {
      const dx = cellX - centerX;
      const dy = cellY - centerY;
      const dist = Math.hypot(dx, dy) || 1;
      const normX = dx / dist;
      const normY = dy / dist;
      const burstDist = 110 + Math.random() * 90 + dist * 0.4;
      const spinDir = Math.random() > 0.5 ? 1 : -1;

      return {
        ...cell,
        finaleMode: 'win' as const,
        finaleBurstX: normX * burstDist,
        finaleBurstY: normY * burstDist,
        finaleBurstRot: spinDir * (50 + Math.random() * 80),
        finaleDelayMs: Math.min(400, dist * 1.5 + Math.random() * 90),
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
