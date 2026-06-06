import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const FILE_PATTERN = /^t(\d{2})-(\d{2})\.json$/;
const BUILT_IN_SYMBOLS = new Set(['#', '.', 'P', 'C', 'G', 'E', 'I', '>', '<', '^', 'v']);

export function validateProjectShiftStages(root) {
  const errors = [];
  const directory = join(root, 'src', 'features', 'project-shift', 'stages');
  if (!existsSync(directory)) return ['Project SHIFT stage directory is missing.'];

  const files = readdirSync(directory).filter((file) => file.endsWith('.json')).sort();
  if (files.length !== 100) errors.push(`Project SHIFT: expected 100 stage JSON files, found ${files.length}.`);

  const ids = new Set();
  for (const [index, file] of files.entries()) {
    const match = file.match(FILE_PATTERN);
    if (!match) {
      errors.push(`Project SHIFT: invalid stage filename ${file}.`);
      continue;
    }

    let stage;
    try {
      stage = JSON.parse(readFileSync(join(directory, file), 'utf8'));
    } catch {
      errors.push(`Project SHIFT: ${file} is not valid JSON.`);
      continue;
    }

    const expectedTier = Math.floor(index / 10) + 1;
    const expectedLocal = (index % 10) + 1;
    const expectedNumber = index + 1;
    const expectedId = `t${String(expectedTier).padStart(2, '0')}-${String(expectedLocal).padStart(2, '0')}`;
    if (stage.id !== expectedId || file !== `${expectedId}.json`) errors.push(`Project SHIFT: ${file} has an inconsistent id.`);
    if (stage.tier !== expectedTier || stage.number !== expectedNumber) errors.push(`Project SHIFT: ${file} is out of sequence.`);
    if (ids.has(stage.id)) errors.push(`Project SHIFT: duplicate id ${stage.id}.`);
    ids.add(stage.id);

    if (!Array.isArray(stage.map) || stage.map.length < 3 || stage.map.length > 12) {
      errors.push(`Project SHIFT: ${file} has an invalid map height.`);
      continue;
    }
    const width = stage.map[0]?.length ?? 0;
    if (width < 3 || width > 18 || !stage.map.every((row) => typeof row === 'string' && row.length === width)) {
      errors.push(`Project SHIFT: ${file} must be a rectangular map no larger than 18x12.`);
      continue;
    }

    const legend = stage.legend && typeof stage.legend === 'object' ? stage.legend : {};
    const counts = new Map();
    for (const row of stage.map) {
      for (const symbol of row) {
        counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
        if (!BUILT_IN_SYMBOLS.has(symbol) && !Object.hasOwn(legend, symbol)) {
          errors.push(`Project SHIFT: ${file} uses unknown symbol "${symbol}".`);
        }
      }
    }

    if (counts.get('P') !== 1) errors.push(`Project SHIFT: ${file} must contain one player.`);
    if (counts.get('E') !== 1) errors.push(`Project SHIFT: ${file} must contain one exit.`);
    const goals = (counts.get('G') ?? 0) + Object.entries(legend).reduce(
      (total, [symbol, entry]) => total + (entry.kind === 'switch' && entry.goal ? counts.get(symbol) ?? 0 : 0),
      0
    );
    if (!counts.get('C') || counts.get('C') !== goals) errors.push(`Project SHIFT: ${file} must have equal cube and goal counts.`);
    if (!/^[UDLR]+$/.test(stage.solution ?? '')) errors.push(`Project SHIFT: ${file} has an invalid solution.`);

    const switches = new Set();
    const doors = new Set();
    const warps = new Map();
    for (const [symbol, entry] of Object.entries(legend)) {
      if (symbol.length !== 1 || BUILT_IN_SYMBOLS.has(symbol)) errors.push(`Project SHIFT: ${file} has an invalid legend symbol.`);
      if (!entry.channel) errors.push(`Project SHIFT: ${file} has a legend entry without a channel.`);
      if (entry.kind === 'switch') switches.add(entry.channel);
      if (entry.kind === 'door') doors.add(entry.channel);
      if (entry.kind === 'warp') warps.set(entry.channel, (warps.get(entry.channel) ?? 0) + (counts.get(symbol) ?? 0));
    }
    for (const channel of doors) {
      if (!switches.has(channel)) errors.push(`Project SHIFT: ${file} door "${channel}" has no switch.`);
    }
    for (const [channel, count] of warps) {
      if (count !== 2) errors.push(`Project SHIFT: ${file} warp "${channel}" must have two gates.`);
    }
  }

  return errors;
}
