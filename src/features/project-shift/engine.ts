import type {
  Direction,
  EntityKind,
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

export function createInitialState(stage: StageDefinition): GameSnapshot {
  return {
    stageId: stage.id,
    player: clonePosition(stage.player),
    cubes: stage.cubes.map(clonePosition),
    moves: 0,
    completed: false
  };
}

export function cloneSnapshot(state: GameSnapshot): GameSnapshot {
  return {
    ...state,
    player: clonePosition(state.player),
    cubes: state.cubes.map(clonePosition)
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

export function getTile(stage: StageDefinition, position: Position): Tile {
  return stage.tiles[position.y]?.[position.x] ?? { kind: 'wall' };
}

export function getOpenDoorChannels(stage: StageDefinition, state: GameSnapshot) {
  const occupied = new Set([positionKey(state.player), ...state.cubes.map(positionKey)]);
  const channels = new Set<string>();

  for (let y = 0; y < stage.height; y += 1) {
    for (let x = 0; x < stage.width; x += 1) {
      const tile = stage.tiles[y][x];
      if (tile.kind === 'switch' && occupied.has(`${x},${y}`)) {
        channels.add(tile.channel);
      }
    }
  }

  return channels;
}

export function areGoalsPowered(stage: StageDefinition, state: GameSnapshot) {
  const cubes = new Set(state.cubes.map(positionKey));

  for (let y = 0; y < stage.height; y += 1) {
    for (let x = 0; x < stage.width; x += 1) {
      const tile = stage.tiles[y][x];
      if ((tile.kind === 'goal' || (tile.kind === 'switch' && tile.goal)) && !cubes.has(`${x},${y}`)) {
        return false;
      }
    }
  }

  return true;
}

function canTraverse(
  stage: StageDefinition,
  state: GameSnapshot,
  from: Position,
  to: Position,
  direction: Direction,
  entity: EntityKind
) {
  const tile = getTile(stage, to);
  if (tile.kind === 'wall') return false;
  if (tile.kind === 'door' && !getOpenDoorChannels(stage, state).has(tile.channel)) return false;
  if (tile.kind === 'exit' && (entity !== 'player' || !areGoalsPowered(stage, state))) return false;
  if (tile.kind === 'oneWay' && tile.direction !== direction) return false;

  const fromTile = getTile(stage, from);
  if (fromTile.kind === 'oneWay' && fromTile.direction !== direction) return false;

  return true;
}

function findWarpDestination(stage: StageDefinition, position: Position) {
  const tile = getTile(stage, position);
  if (tile.kind !== 'warp') return null;

  for (let y = 0; y < stage.height; y += 1) {
    for (let x = 0; x < stage.width; x += 1) {
      const candidate = stage.tiles[y][x];
      if (
        candidate.kind === 'warp' &&
        candidate.channel === tile.channel &&
        (x !== position.x || y !== position.y)
      ) {
        return { x, y };
      }
    }
  }

  return null;
}

function cubeIndexAt(cubes: Position[], position: Position) {
  return cubes.findIndex((cube) => samePosition(cube, position));
}

interface AdvanceResult {
  moved: boolean;
  pushed: boolean;
  teleported: boolean;
}

function advance(
  stage: StageDefinition,
  state: GameSnapshot,
  entity: EntityKind,
  entityIndex: number,
  direction: Direction
): AdvanceResult {
  const vector = VECTORS[direction];
  const current = entity === 'player' ? state.player : state.cubes[entityIndex];
  const target = { x: current.x + vector.x, y: current.y + vector.y };

  if (!canTraverse(stage, state, current, target, direction, entity)) {
    return { moved: false, pushed: false, teleported: false };
  }

  const blockingCube = cubeIndexAt(state.cubes, target);
  let pushed = false;
  let teleported = false;

  if (blockingCube >= 0) {
    if (entity === 'cube') return { moved: false, pushed: false, teleported: false };

    const cubeMove = advance(stage, state, 'cube', blockingCube, direction);
    if (!cubeMove.moved) return { moved: false, pushed: false, teleported: false };
    pushed = true;
    teleported = cubeMove.teleported;
  }

  const occupiedByPlayer = entity === 'cube' && samePosition(state.player, target);
  if (occupiedByPlayer) return { moved: false, pushed: false, teleported: false };

  const destination = findWarpDestination(stage, target);
  let finalTarget = target;

  if (destination) {
    const warpBlockedByCube = cubeIndexAt(state.cubes, destination) >= 0;
    const warpBlockedByPlayer = entity === 'cube' && samePosition(state.player, destination);
    if (!warpBlockedByCube && !warpBlockedByPlayer && canTraverse(stage, state, target, destination, direction, entity)) {
      finalTarget = destination;
      teleported = true;
    }
  }

  if (entity === 'player') {
    state.player = finalTarget;
  } else {
    state.cubes[entityIndex] = finalTarget;
  }

  return { moved: true, pushed, teleported };
}

function slideCube(stage: StageDefinition, state: GameSnapshot, cubeIndex: number, direction: Direction) {
  let moved = false;
  let teleported = false;
  let guard = stage.width * stage.height;

  while (getTile(stage, state.cubes[cubeIndex]).kind === 'ice' && guard > 0) {
    const result = advance(stage, state, 'cube', cubeIndex, direction);
    if (!result.moved) break;
    moved = true;
    teleported ||= result.teleported;
    guard -= 1;
  }

  return { moved, teleported };
}

export function move(stage: StageDefinition, current: GameSnapshot, direction: Direction): MoveResult {
  if (current.completed) {
    return {
      state: cloneSnapshot(current),
      changed: false,
      pushed: false,
      teleported: false,
      slid: false,
      completedNow: false
    };
  }

  const state = cloneSnapshot(current);
  const cubePositionsBefore = state.cubes.map(clonePosition);
  const first = advance(stage, state, 'player', -1, direction);

  if (!first.moved) {
    return {
      state: cloneSnapshot(current),
      changed: false,
      pushed: false,
      teleported: false,
      slid: false,
      completedNow: false
    };
  }

  let pushed = first.pushed;
  let teleported = first.teleported;
  let slid = false;

  for (let index = 0; index < state.cubes.length; index += 1) {
    if (!samePosition(cubePositionsBefore[index], state.cubes[index])) {
      const cubeSlide = slideCube(stage, state, index, direction);
      slid ||= cubeSlide.moved;
      teleported ||= cubeSlide.teleported;
    }
  }

  let guard = stage.width * stage.height;
  while (getTile(stage, state.player).kind === 'ice' && guard > 0) {
    const result = advance(stage, state, 'player', -1, direction);
    if (!result.moved) break;
    pushed ||= result.pushed;
    teleported ||= result.teleported;
    slid = true;
    guard -= 1;
  }

  state.moves += 1;
  state.completed = getTile(stage, state.player).kind === 'exit' && areGoalsPowered(stage, state);

  return {
    state,
    changed: true,
    pushed,
    teleported,
    slid,
    completedNow: state.completed && !current.completed
  };
}

export function isSnapshotValid(stage: StageDefinition, snapshot: GameSnapshot) {
  if (snapshot.stageId !== stage.id || snapshot.moves < 0) return false;
  if (snapshot.cubes.length !== stage.cubes.length) return false;

  const positions = [snapshot.player, ...snapshot.cubes];
  const unique = new Set(positions.map(positionKey));
  if (unique.size !== positions.length) return false;

  return positions.every((position) => {
    const tile = getTile(stage, position);
    return tile.kind !== 'wall' && position.x >= 0 && position.y >= 0;
  });
}
