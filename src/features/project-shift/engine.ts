import type {
  Direction,
  GameHistory,
  GameSnapshot,
  MoveResult,
  Position,
  StageDefinition,
  Tile
} from './types.ts';

const VECTORS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const clonePosition = ({ x, y }: Position): Position => ({ x, y });
const positionKey = ({ x, y }: Position) => `${x},${y}`;

export function samePosition(left: Position, right: Position) {
  return left.x === right.x && left.y === right.y;
}

export function getTile(stage: StageDefinition, position: Position): Tile {
  return stage.tiles[position.y]?.[position.x] ?? { kind: 'wall' };
}

export function isTarget(stage: StageDefinition, position: Position) {
  return getTile(stage, position).kind === 'target';
}

export function areAllBoxesOnTargets(stage: StageDefinition, boxes: Position[]) {
  return boxes.length > 0 && boxes.every((box) => isTarget(stage, box));
}

export function createInitialState(stage: StageDefinition): GameSnapshot {
  return {
    stageId: stage.id,
    player: clonePosition(stage.player),
    boxes: stage.boxes.map(clonePosition),
    moves: 0,
    pushes: 0,
    completed: areAllBoxesOnTargets(stage, stage.boxes)
  };
}

export function cloneSnapshot(state: GameSnapshot): GameSnapshot {
  return {
    ...state,
    player: clonePosition(state.player),
    boxes: state.boxes.map(clonePosition)
  };
}

export function createHistory(state: GameSnapshot): GameHistory {
  return { past: [], present: cloneSnapshot(state), future: [] };
}

export function commitMove(history: GameHistory, state: GameSnapshot): GameHistory {
  return {
    past: [...history.past, cloneSnapshot(history.present)],
    present: cloneSnapshot(state),
    future: []
  };
}

export function undo(history: GameHistory): GameHistory {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: cloneSnapshot(previous),
    future: [cloneSnapshot(history.present), ...history.future]
  };
}

export function redo(history: GameHistory): GameHistory {
  const next = history.future[0];
  if (!next) return history;
  return {
    past: [...history.past, cloneSnapshot(history.present)],
    present: cloneSnapshot(next),
    future: history.future.slice(1)
  };
}

function boxIndexAt(boxes: Position[], position: Position) {
  return boxes.findIndex((box) => samePosition(box, position));
}

export function move(stage: StageDefinition, current: GameSnapshot, direction: Direction): MoveResult {
  if (current.completed) {
    return { state: cloneSnapshot(current), changed: false, pushed: false, completedNow: false };
  }

  const vector = VECTORS[direction];
  const target = { x: current.player.x + vector.x, y: current.player.y + vector.y };
  if (getTile(stage, target).kind === 'wall') {
    return { state: cloneSnapshot(current), changed: false, pushed: false, completedNow: false };
  }

  const state = cloneSnapshot(current);
  const boxIndex = boxIndexAt(state.boxes, target);
  let pushed = false;

  if (boxIndex >= 0) {
    const boxTarget = { x: target.x + vector.x, y: target.y + vector.y };
    if (getTile(stage, boxTarget).kind === 'wall' || boxIndexAt(state.boxes, boxTarget) >= 0) {
      return { state: cloneSnapshot(current), changed: false, pushed: false, completedNow: false };
    }
    state.boxes[boxIndex] = boxTarget;
    state.pushes += 1;
    pushed = true;
  }

  state.player = target;
  state.moves += 1;
  state.completed = areAllBoxesOnTargets(stage, state.boxes);

  return {
    state,
    changed: true,
    pushed,
    completedNow: state.completed && !current.completed
  };
}

export function isSnapshotValid(stage: StageDefinition, snapshot: GameSnapshot) {
  if (
    snapshot.stageId !== stage.id ||
    !Number.isInteger(snapshot.moves) ||
    snapshot.moves < 0 ||
    !Number.isInteger(snapshot.pushes) ||
    snapshot.pushes < 0 ||
    snapshot.pushes > snapshot.moves ||
    snapshot.boxes.length !== stage.boxes.length
  ) return false;

  const positions = [snapshot.player, ...snapshot.boxes];
  const unique = new Set(positions.map(positionKey));
  if (unique.size !== positions.length) return false;

  return positions.every((position) =>
    position.x >= 0 &&
    position.y >= 0 &&
    position.x < stage.width &&
    position.y < stage.height &&
    getTile(stage, position).kind !== 'wall'
  );
}
