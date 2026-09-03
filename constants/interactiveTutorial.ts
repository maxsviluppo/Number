import { HexCellData } from '../types';
import { GRID_ROWS, GRID_COLS } from '../constants';

export const INTERACTIVE_TUTORIAL_STORAGE_KEY = 'interactive_tutorial_done';

/** Fixed path the user must trace: 5 + 3 = 8 */
export const TUTORIAL_PATH = ['0-0', '0-1', '0-2'] as const;

export const TUTORIAL_TARGETS = [8] as const;

export type InteractiveTutorialStep =
  | { kind: 'info'; target: 'targets' | 'score' | 'timer'; messageKey: string }
  | { kind: 'path'; requiredLength: 1 | 2 | 3; cellId: string; messageKey: string }
  | { kind: 'complete'; messageKey: string };

export const INTERACTIVE_TUTORIAL_STEPS: InteractiveTutorialStep[] = [
  { kind: 'info', target: 'targets', messageKey: 'stepTargets' },
  { kind: 'path', requiredLength: 1, cellId: '0-0', messageKey: 'stepFirstNumber' },
  { kind: 'path', requiredLength: 2, cellId: '0-1', messageKey: 'stepOperator' },
  { kind: 'path', requiredLength: 3, cellId: '0-2', messageKey: 'stepSecondNumber' },
  { kind: 'info', target: 'score', messageKey: 'stepScore' },
  { kind: 'info', target: 'timer', messageKey: 'stepTimer' },
  { kind: 'complete', messageKey: 'stepComplete' },
];

const TUTORIAL_CELL_VALUES: Record<string, string> = {
  '0-0': '5',
  '0-1': '+',
  '0-2': '3',
  '0-3': '×',
  '0-4': '9',
  '1-0': '-',
  '1-1': '7',
  '1-2': '+',
  '1-3': '1',
  '1-4': '-',
  '2-0': '4',
  '2-1': '÷',
  '2-2': '2',
  '2-3': '×',
  '2-4': '6',
  '3-0': '+',
  '3-1': '8',
  '3-2': '-',
  '3-3': '5',
  '3-4': '+',
  '4-0': '1',
  '4-1': '×',
  '4-2': '3',
  '4-3': '-',
  '4-4': '2',
  '5-0': '-',
  '5-1': '6',
  '5-2': '+',
  '5-3': '4',
  '5-4': '-',
  '6-0': '9',
  '6-1': '÷',
  '6-2': '3',
  '6-3': '+',
  '6-4': '1',
};

export function getTutorialGrid(): HexCellData[] {
  const grid: HexCellData[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const id = `${r}-${c}`;
      const isOperator = (r + c) % 2 !== 0;
      grid.push({
        id,
        row: r,
        col: c,
        type: isOperator ? 'operator' : 'number',
        value: TUTORIAL_CELL_VALUES[id] ?? (isOperator ? '+' : '1'),
      });
    }
  }
  return grid;
}

export function getTutorialTargetElementId(
  target: 'targets' | 'score' | 'timer'
): string {
  switch (target) {
    case 'targets':
      return 'targets-display-tutorial';
    case 'score':
      return 'score-display-game';
    case 'timer':
      return 'timer-display-game';
  }
}

export function isTutorialPathPrefix(pathIds: string[], length: number): boolean {
  return TUTORIAL_PATH.slice(0, length).every((id, idx) => pathIds[idx] === id);
}

export function isInteractiveTutorialDone(): boolean {
  try {
    return localStorage.getItem(INTERACTIVE_TUTORIAL_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}
