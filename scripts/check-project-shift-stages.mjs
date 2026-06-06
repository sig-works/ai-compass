import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { findStageWarnings, validateStageSource } from '../src/features/project-shift/stage-source.ts';

const FILE_PATTERN = /^t(0[1-3])-(\d{2})\.json$/;

export function validateProjectShiftStages(root) {
  const errors = [];
  const warnings = [];
  const directory = join(root, 'src', 'features', 'project-shift', 'stages');
  if (!existsSync(directory)) return ['Project SHIFT stage directory is missing.'];

  const files = readdirSync(directory).filter((file) => file.endsWith('.json')).sort();
  if (files.length !== 30) errors.push(`Project SHIFT: expected 30 stage JSON files, found ${files.length}.`);

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

    try {
      validateStageSource(stage);
      warnings.push(...findStageWarnings(stage));
    } catch (error) {
      errors.push(`Project SHIFT: ${file}: ${error instanceof Error ? error.message : 'invalid stage'}`);
    }
  }

  for (const warning of warnings) {
    console.warn(`Project SHIFT warning [${warning.code}] ${warning.stageId}: ${warning.message}`);
  }
  return errors;
}

if (import.meta.url === `file:///${process.argv[1]?.replaceAll('\\', '/')}`) {
  const errors = validateProjectShiftStages(process.cwd());
  if (errors.length > 0) {
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('Project SHIFT stage check passed.');
}
