
export type CellType = 'number' | 'operator';

export interface HexCellData {
  id: string;
  type: CellType;
  value: string;
  row: number;
  col: number;
}

export interface GameState {
  score: number;
  totalScore: number;
  streak: number;
  level: number;
  timeLeft: number;
  targetResult: number;
  status: 'playing' | 'level-complete' | 'game-over' | 'idle';
  estimatedIQ: number;
  lastLevelPerfect: boolean;
  basePoints: number;
}

export interface PlayerRank {
  name: string;
  score: number;
  iq: number;
  country: string;
}
