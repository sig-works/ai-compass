export type Direction = 'up' | 'down' | 'left' | 'right';
export type EntityKind = 'player' | 'cube';

export interface Position {
  x: number;
  y: number;
}

export type Tile =
  | { kind: 'floor' }
  | { kind: 'wall' }
  | { kind: 'goal' }
  | { kind: 'exit' }
  | { kind: 'ice' }
  | { kind: 'oneWay'; direction: Direction }
  | { kind: 'switch'; channel: string; goal?: boolean }
  | { kind: 'door'; channel: string }
  | { kind: 'warp'; channel: string };

export interface StageDefinition {
  id: string;
  tier: number;
  number: number;
  name: string;
  briefing: string;
  difficulty: number;
  width: number;
  height: number;
  tiles: Tile[][];
  player: Position;
  cubes: Position[];
  par: number;
  mechanics: Array<'push' | 'switch' | 'oneWay' | 'warp' | 'ice'>;
  solution: Direction[];
}

export interface GameSnapshot {
  stageId: string;
  player: Position;
  cubes: Position[];
  moves: number;
  completed: boolean;
}

export interface MoveResult {
  state: GameSnapshot;
  changed: boolean;
  pushed: boolean;
  teleported: boolean;
  slid: boolean;
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
  version: 3;
  unlocked: number;
  currentStageId: string;
  bestMoves: Record<string, number>;
  run: SavedRun | null;
}
