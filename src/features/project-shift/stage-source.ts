import type { Direction, Position, StageDefinition, Tile } from './types.ts';

export interface StageSource {
  id: string;
  tier: number;
  number: number;
  name: string;
  difficulty: number;
  map: string[];
  boxCount: number;
  minMoves: number | null;
  minPushes: number | null;
  concept: string;
  solution: string;
  isValidated: boolean;
}

export interface StageWarning {
  stageId: string;
  code: 'box-in-corner' | 'wall-dead-square' | 'blocked-2x2';
  message: string;
  position: Position;
}

const directionByCode: Record<string, Direction> = {
  U: 'up',
  D: 'down',
  L: 'left',
  R: 'right'
};
const allowedSymbols = new Set(['#', ' ', '.', '$', '@', '*', '+']);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function isWalkableSymbol(symbol: string) {
  return symbol !== '#';
}

function countSymbols(source: StageSource) {
  const counts = new Map<string, number>();
  for (const row of source.map) {
    for (const symbol of row) counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
  }
  return counts;
}

function validateReachableArea(source: StageSource) {
  const playerSymbols = new Set(['@', '+']);
  let start: Position | null = null;
  for (let y = 0; y < source.map.length; y += 1) {
    for (let x = 0; x < source.map[y].length; x += 1) {
      if (playerSymbols.has(source.map[y][x])) start = { x, y };
    }
  }
  assert(start, `${source.id}: player is required.`);

  const queue = [start];
  const visited = new Set([`${start.x},${start.y}`]);
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const next = { x: current.x + dx, y: current.y + dy };
      const symbol = source.map[next.y]?.[next.x];
      const key = `${next.x},${next.y}`;
      if (symbol !== undefined && isWalkableSymbol(symbol) && !visited.has(key)) {
        visited.add(key);
        queue.push(next);
      }
    }
  }

  for (let y = 0; y < source.map.length; y += 1) {
    for (let x = 0; x < source.map[y].length; x += 1) {
      if (isWalkableSymbol(source.map[y][x])) {
        assert(visited.has(`${x},${y}`), `${source.id}: contains an unreachable floor area at ${x},${y}.`);
      }
    }
  }
}

export function validateStageSource(source: StageSource): void {
  const label = source.id || 'unknown stage';
  assert(/^t0[1-3]-\d{2}$/.test(source.id), `${label}: id must match t01-01 through t03-10.`);
  assert(Number.isInteger(source.tier) && source.tier >= 1 && source.tier <= 3, `${label}: tier must be 1-3.`);
  assert(Number.isInteger(source.number) && source.number >= 1 && source.number <= 30, `${label}: number must be 1-30.`);
  assert(Number.isInteger(source.difficulty) && source.difficulty >= 1 && source.difficulty <= 10, `${label}: difficulty must be 1-10.`);
  assert(typeof source.name === 'string' && source.name.length > 0, `${label}: name is required.`);
  assert(typeof source.concept === 'string' && source.concept.length > 0, `${label}: concept is required.`);
  assert(Array.isArray(source.map) && source.map.length >= 3 && source.map.length <= 12, `${label}: map height must be 3-12.`);

  const width = source.map[0]?.length ?? 0;
  assert(width >= 3 && width <= 18, `${label}: map width must be 3-18.`);
  assert(source.map.every((row) => row.length === width), `${label}: map rows must have equal width.`);
  assert(source.map[0].split('').every((symbol) => symbol === '#'), `${label}: top border must be closed.`);
  assert(source.map.at(-1)?.split('').every((symbol) => symbol === '#'), `${label}: bottom border must be closed.`);
  assert(source.map.every((row) => row[0] === '#' && row.at(-1) === '#'), `${label}: side borders must be closed.`);
  assert(source.map.every((row) => [...row].every((symbol) => allowedSymbols.has(symbol))), `${label}: map contains an unknown symbol.`);

  const counts = countSymbols(source);
  const players = (counts.get('@') ?? 0) + (counts.get('+') ?? 0);
  const boxes = (counts.get('$') ?? 0) + (counts.get('*') ?? 0);
  const targets = (counts.get('.') ?? 0) + (counts.get('*') ?? 0) + (counts.get('+') ?? 0);
  assert(players === 1, `${label}: map must contain exactly one player.`);
  assert(boxes > 0, `${label}: map must contain at least one box.`);
  assert(boxes === targets, `${label}: boxes and targets must have equal counts.`);
  assert(source.boxCount === boxes, `${label}: boxCount must match the map.`);
  assert(source.minMoves === null || (Number.isInteger(source.minMoves) && source.minMoves > 0), `${label}: minMoves must be null or positive.`);
  assert(source.minPushes === null || (Number.isInteger(source.minPushes) && source.minPushes > 0), `${label}: minPushes must be null or positive.`);
  assert(typeof source.isValidated === 'boolean', `${label}: isValidated is required.`);
  assert(!source.isValidated || /^[UDLR]+$/.test(source.solution), `${label}: validated stages require a UDLR solution.`);
  validateReachableArea(source);
}

function decodeTile(symbol: string): Tile {
  if (symbol === '#') return { kind: 'wall' };
  if (symbol === '.' || symbol === '*' || symbol === '+') return { kind: 'target' };
  return { kind: 'floor' };
}

export function buildStage(source: StageSource): StageDefinition {
  validateStageSource(source);
  let player = { x: -1, y: -1 };
  const boxes: Position[] = [];
  const tiles = source.map.map((row, y) =>
    [...row].map((symbol, x) => {
      if (symbol === '@' || symbol === '+') player = { x, y };
      if (symbol === '$' || symbol === '*') boxes.push({ x, y });
      return decodeTile(symbol);
    })
  );

  return {
    ...source,
    width: source.map[0].length,
    height: source.map.length,
    tiles,
    player,
    boxes,
    solution: [...source.solution].map((code) => directionByCode[code])
  };
}

export function findStageWarnings(source: StageSource): StageWarning[] {
  validateStageSource(source);
  const stage = buildStage(source);
  const warnings: StageWarning[] = [];
  const isWall = (x: number, y: number) => stage.tiles[y]?.[x]?.kind === 'wall';
  const isTargetAt = (x: number, y: number) => stage.tiles[y]?.[x]?.kind === 'target';

  for (const box of stage.boxes) {
    const vertical = isWall(box.x, box.y - 1) || isWall(box.x, box.y + 1);
    const horizontal = isWall(box.x - 1, box.y) || isWall(box.x + 1, box.y);
    if (!isTargetAt(box.x, box.y) && vertical && horizontal) {
      warnings.push({
        stageId: source.id,
        code: 'box-in-corner',
        message: `Box starts in a non-target corner at ${box.x},${box.y}.`,
        position: box
      });
    }

    const wallAlongVertical = isWall(box.x - 1, box.y) || isWall(box.x + 1, box.y);
    const columnHasTarget = stage.tiles.some((row) => row[box.x]?.kind === 'target');
    const wallAlongHorizontal = isWall(box.x, box.y - 1) || isWall(box.x, box.y + 1);
    const rowHasTarget = stage.tiles[box.y].some((tile) => tile.kind === 'target');
    if (!isTargetAt(box.x, box.y) && ((wallAlongVertical && !columnHasTarget) || (wallAlongHorizontal && !rowHasTarget))) {
      warnings.push({
        stageId: source.id,
        code: 'wall-dead-square',
        message: `Box may be trapped along a wall at ${box.x},${box.y}.`,
        position: box
      });
    }
  }

  for (let y = 0; y < stage.height - 1; y += 1) {
    for (let x = 0; x < stage.width - 1; x += 1) {
      const cells = [
        { x, y }, { x: x + 1, y }, { x, y: y + 1 }, { x: x + 1, y: y + 1 }
      ];
      const blocked = cells.every((cell) =>
        isWall(cell.x, cell.y) || stage.boxes.some((box) => box.x === cell.x && box.y === cell.y)
      );
      const hasUnsafeBox = cells.some((cell) =>
        stage.boxes.some((box) => box.x === cell.x && box.y === cell.y) && !isTargetAt(cell.x, cell.y)
      );
      if (blocked && hasUnsafeBox) {
        warnings.push({
          stageId: source.id,
          code: 'blocked-2x2',
          message: `A blocked 2x2 area contains a non-target box at ${x},${y}.`,
          position: { x, y }
        });
      }
    }
  }
  return warnings;
}
