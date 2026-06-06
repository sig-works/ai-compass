export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export type Tile = { kind: 'floor' } | { kind: 'wall' } | { kind: 'target' };

export interface StageDefinition {
  id: string;
  tier: number;
  number: number;
  name: string;
  difficulty: number;
  concept: string;
  width: number;
  height: number;
  tiles: Tile[][];
  player: Position;
  boxes: Position[];
  boxCount: number;
  minMoves: number | null;
  minPushes: number | null;
  solution: Direction[];
  isValidated: boolean;
}

export interface GameSnapshot {
  stageId: string;
  player: Position;
  boxes: Position[];
  moves: number;
  pushes: number;
  completed: boolean;
}

export interface MoveResult {
  state: GameSnapshot;
  changed: boolean;
  pushed: boolean;
  completedNow: boolean;
}

export interface GameHistory {
  past: GameSnapshot[];
  present: GameSnapshot;
  future: GameSnapshot[];
}

export interface SavedRun {
  stageId: string;
  snapshot: GameSnapshot;
}

export interface ProjectShiftSave {
  version: 4;
  unlocked: number;
  currentStageId: string;
  bestMoves: Record<string, number>;
  bestPushes: Record<string, number>;
  run: SavedRun | null;
}
