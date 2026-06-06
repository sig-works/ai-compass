import type { Direction, StageDefinition, Tile } from './types.ts';

export type StageMechanic = StageDefinition['mechanics'][number];

export type StageLegendEntry =
  | { kind: 'switch'; channel: string; goal?: boolean }
  | { kind: 'door'; channel: string }
  | { kind: 'warp'; channel: string };

export interface StageSource {
  id: string;
  tier: number;
  number: number;
  name: string;
  briefing: string;
  difficulty: number;
  mechanics: StageMechanic[];
  map: string[];
  legend: Record<string, StageLegendEntry>;
  solution: string;
}

const directionByCode: Record<string, Direction> = {
  U: 'up',
  D: 'down',
  L: 'left',
  R: 'right'
};

const builtInTiles: Record<string, Tile> = {
  '.': { kind: 'floor' },
  '#': { kind: 'wall' },
  G: { kind: 'goal' },
  E: { kind: 'exit' },
  I: { kind: 'ice' },
  '>': { kind: 'oneWay', direction: 'right' },
  '<': { kind: 'oneWay', direction: 'left' },
  '^': { kind: 'oneWay', direction: 'up' },
  v: { kind: 'oneWay', direction: 'down' }
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function validateStageSource(source: StageSource): void {
  const label = source.id || 'unknown stage';
  assert(/^t\d{2}-\d{2}$/.test(source.id), `${label}: id must match t01-01.`);
  assert(Number.isInteger(source.tier) && source.tier >= 1 && source.tier <= 10, `${label}: tier must be 1-10.`);
  assert(Number.isInteger(source.number) && source.number >= 1 && source.number <= 100, `${label}: number must be 1-100.`);
  assert(Number.isInteger(source.difficulty) && source.difficulty >= 1 && source.difficulty <= 10, `${label}: difficulty must be 1-10.`);
  assert(typeof source.name === 'string' && source.name.length > 0, `${label}: name is required.`);
  assert(typeof source.briefing === 'string' && source.briefing.length > 0, `${label}: briefing is required.`);
  assert(Array.isArray(source.map) && source.map.length >= 3 && source.map.length <= 12, `${label}: map height must be 3-12.`);

  const width = source.map[0]?.length ?? 0;
  assert(width >= 3 && width <= 18, `${label}: map width must be 3-18.`);
  assert(source.map.every((row) => row.length === width), `${label}: map rows must have equal width.`);
  assert(/^[UDLR]+$/.test(source.solution), `${label}: solution must use UDLR.`);

  const allowedMechanics = new Set<StageMechanic>(['push', 'switch', 'oneWay', 'warp', 'ice']);
  assert(source.mechanics.length > 0 && source.mechanics.every((item) => allowedMechanics.has(item)), `${label}: unknown mechanic.`);

  const legendSymbols = new Set(Object.keys(source.legend ?? {}));
  const counts = new Map<string, number>();
  for (const row of source.map) {
    for (const symbol of row) counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
  }

  const knownSymbols = new Set([...Object.keys(builtInTiles), 'P', 'C', ...legendSymbols]);
  for (const symbol of counts.keys()) {
    assert(knownSymbols.has(symbol), `${label}: unknown map symbol "${symbol}".`);
  }

  assert(counts.get('P') === 1, `${label}: map must contain exactly one player.`);
  assert(counts.get('E') === 1, `${label}: map must contain exactly one exit.`);
  assert((counts.get('C') ?? 0) > 0, `${label}: map must contain at least one cube.`);
  const switches = new Set<string>();
  const doors = new Set<string>();
  const warpCounts = new Map<string, number>();
  for (const [symbol, entry] of Object.entries(source.legend ?? {})) {
    assert(symbol.length === 1, `${label}: legend symbols must be one character.`);
    assert(!Object.hasOwn(builtInTiles, symbol) && symbol !== 'P' && symbol !== 'C', `${label}: legend symbol "${symbol}" is reserved.`);
    assert(typeof entry.channel === 'string' && entry.channel.length > 0, `${label}: legend channel is required.`);
    const count = counts.get(symbol) ?? 0;
    if (entry.kind === 'switch') switches.add(entry.channel);
    if (entry.kind === 'door') doors.add(entry.channel);
    if (entry.kind === 'warp') warpCounts.set(entry.channel, (warpCounts.get(entry.channel) ?? 0) + count);
  }

  const goalCount = (counts.get('G') ?? 0) + Object.entries(source.legend ?? {}).reduce(
    (total, [symbol, entry]) => total + (entry.kind === 'switch' && entry.goal ? counts.get(symbol) ?? 0 : 0),
    0
  );
  assert(counts.get('C') === goalCount, `${label}: cubes and goals must have equal counts.`);

  for (const channel of doors) assert(switches.has(channel), `${label}: door channel "${channel}" has no switch.`);
  for (const [channel, count] of warpCounts) assert(count === 2, `${label}: warp channel "${channel}" must have two gates.`);
}

function decodeTile(symbol: string, legend: Record<string, StageLegendEntry>): Tile {
  if (symbol === 'P' || symbol === 'C') return { kind: 'floor' };
  if (builtInTiles[symbol]) return builtInTiles[symbol];
  const entry = legend[symbol];
  if (!entry) throw new Error(`Unknown stage symbol: ${symbol}`);
  return { ...entry };
}

export function buildStage(source: StageSource): StageDefinition {
  validateStageSource(source);

  let player = { x: -1, y: -1 };
  const cubes: Array<{ x: number; y: number }> = [];
  const tiles = source.map.map((row, y) =>
    [...row].map((symbol, x) => {
      if (symbol === 'P') player = { x, y };
      if (symbol === 'C') cubes.push({ x, y });
      return decodeTile(symbol, source.legend);
    })
  );

  return {
    id: source.id,
    tier: source.tier,
    number: source.number,
    name: source.name,
    briefing: source.briefing,
    difficulty: source.difficulty,
    width: source.map[0].length,
    height: source.map.length,
    tiles,
    player,
    cubes,
    par: source.solution.length,
    mechanics: [...source.mechanics],
    solution: [...source.solution].map((code) => directionByCode[code])
  };
}
