import assert from 'node:assert/strict';
import test from 'node:test';

import {
  commitMove,
  createHistory,
  createInitialState,
  isTarget,
  move,
  redo,
  undo
} from './engine.ts';
import { buildStage, findStageWarnings, validateStageSource, type StageSource } from './stage-source.ts';
import { PROJECT_SHIFT_STAGES } from './stages.ts';
import { completeStage, createDefaultSave, parseSave, saveRun } from './storage.ts';
import { isStageUnlocked, readTestMode, writeTestMode } from './test-mode.ts';
import type { Direction } from './types.ts';

function source(map: string[], solution = 'R'): StageSource {
  const boxes = map.join('').split('').filter((symbol) => symbol === '$' || symbol === '*').length;
  return {
    id: 't01-01',
    tier: 1,
    number: 1,
    name: 'Test',
    difficulty: 1,
    map,
    boxCount: boxes,
    minMoves: null,
    minPushes: null,
    concept: 'Test concept',
    solution,
    isValidated: true
  };
}

test('all 30 stages are ordered and solved by their validated routes', () => {
  assert.equal(PROJECT_SHIFT_STAGES.length, 30);
  let previousBoxCount = 0;
  let previousPushes = 0;
  for (const [index, stage] of PROJECT_SHIFT_STAGES.entries()) {
    assert.equal(stage.number, index + 1);
    assert.equal(stage.tier, Math.floor(index / 10) + 1);
    assert.equal(stage.boxes.length, stage.boxCount);
    assert.equal(stage.isValidated, true);
    assert.ok(stage.solution.length > 0);
    if (stage.minMoves !== null) assert.equal(stage.minMoves, stage.solution.length);
    assert.ok(
      stage.tiles.slice(1, -1).some((row) => row.slice(1, -1).some((tile) => tile.kind === 'wall')),
      `${stage.id} should contain meaningful internal walls`
    );
    if (stage.boxCount === previousBoxCount && stage.minPushes !== null) {
      assert.ok(stage.minPushes >= previousPushes, `${stage.id} should not reduce push complexity within the same box count`);
    }

    let state = createInitialState(stage);
    for (const direction of stage.solution) {
      const result = move(stage, state, direction);
      assert.equal(result.changed, true, `${stage.id} contains an invalid solution input`);
      state = result.state;
    }
    assert.equal(state.completed, true, `${stage.id} should complete`);
    assert.ok(state.boxes.every((box) => isTarget(stage, box)), `${stage.id} boxes should be on targets`);
    if (stage.minPushes !== null) assert.equal(state.pushes, stage.minPushes);
    previousBoxCount = stage.boxCount;
    previousPushes = stage.minPushes ?? previousPushes;
  }
});

test('movement follows classic Sokoban rules', () => {
  const stage = buildStage(source([
    '#######',
    '# @$ .#',
    '#  $ .#',
    '#######'
  ]));
  const initial = createInitialState(stage);

  assert.equal(move(stage, initial, 'up').changed, false, 'walls block the player');
  const push = move(stage, initial, 'right');
  assert.equal(push.changed, true);
  assert.equal(push.pushed, true);
  assert.equal(push.state.moves, 1);
  assert.equal(push.state.pushes, 1);

  const blocked = move(stage, push.state, 'right');
  assert.equal(blocked.changed, true, 'the first box can continue into free floor');

  const stackedStage = buildStage(source([
    '#######',
    '# @$$.#',
    '#   . #',
    '#######'
  ]));
  const stacked = move(stackedStage, createInitialState(stackedStage), 'right');
  assert.equal(stacked.changed, false, 'two boxes cannot be pushed together');
  assert.equal(stacked.state.moves, 0);
  assert.equal(stacked.state.pushes, 0);
});

test('boxes can leave targets and completion happens immediately when all boxes are placed', () => {
  const stage = buildStage(source([
    '#######',
    '# @* .#',
    '#  $  #',
    '#######'
  ], 'R'));
  const initial = createInitialState(stage);
  const movedOffTarget = move(stage, initial, 'right');
  assert.equal(movedOffTarget.pushed, true);
  assert.equal(movedOffTarget.state.completed, false);
  assert.equal(isTarget(stage, movedOffTarget.state.boxes[0]), false);

  const completionStage = buildStage(source([
    '#####',
    '#@$.#',
    '#####'
  ]));
  const completed = move(completionStage, createInitialState(completionStage), 'right');
  assert.equal(completed.completedNow, true);
  assert.equal(completed.state.completed, true);
  assert.equal(completed.state.moves, 1);
  assert.equal(completed.state.pushes, 1);
});

test('undo and redo restore player, boxes, moves, and pushes', () => {
  const stage = buildStage(source([
    '#####',
    '#@$.#',
    '#####'
  ]));
  const initial = createInitialState(stage);
  const pushed = move(stage, initial, 'right');
  let history = commitMove(createHistory(initial), pushed.state);
  history = undo(history);
  assert.deepEqual(history.present, initial);
  history = redo(history);
  assert.deepEqual(history.present, pushed.state);
});

test('ASCII parsing separates targets from player and box objects', () => {
  const stage = buildStage(source([
    '#######',
    '# +*  #',
    '#  $  #',
    '#######'
  ]));
  assert.equal(stage.boxes.length, 2);
  assert.equal(isTarget(stage, stage.player), true);
  assert.equal(stage.boxes.filter((box) => isTarget(stage, box)).length, 1);
});

test('validation rejects malformed stages', () => {
  assert.throws(() => validateStageSource(source(['#####', '#@@.#', '#####'])), /one player/);
  assert.throws(() => validateStageSource(source(['#####', '#@$ #', '#####'])), /equal counts/);
  assert.throws(() => validateStageSource(source(['#####', '#@x.#', '#####'])), /unknown symbol/);
  assert.throws(() => validateStageSource(source(['#####', '#@$ #', '#### '])), /border/);
});

test('development warnings detect obvious deadlocks', () => {
  const corner = source([
    '######',
    '#$ @.#',
    '#    #',
    '######'
  ]);
  assert.ok(findStageWarnings(corner).some((warning) => warning.code === 'box-in-corner'));

  const blocked = source([
    '#######',
    '#@ $$ #',
    '#  ##.#',
    '#   . #',
    '#######'
  ]);
  assert.ok(findStageWarnings(blocked).some((warning) => warning.code === 'blocked-2x2'));
});

test('save version migration resets old progress and tracks both best values', () => {
  assert.deepEqual(parseSave(JSON.stringify({ version: 3, unlocked: 30 })), createDefaultSave());
  const stage = PROJECT_SHIFT_STAGES[0];
  const moved = move(stage, createInitialState(stage), stage.solution[0]).state;
  const running = saveRun(createDefaultSave(), moved);
  assert.deepEqual(parseSave(JSON.stringify(running)).run?.snapshot, moved);

  const completed = completeStage(running, stage.id, 20, 8);
  const improved = completeStage(completed, stage.id, 18, 9);
  assert.equal(improved.unlocked, 2);
  assert.equal(improved.bestMoves[stage.id], 18);
  assert.equal(improved.bestPushes[stage.id], 8);
});

test('test mode unlocks stages without mutating normal progress', () => {
  const values = new Map<string, string>();
  const sessionStore = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key)
  };
  const save = createDefaultSave();
  const before = JSON.stringify(save);
  const lockedStage = PROJECT_SHIFT_STAGES[29];
  assert.equal(isStageUnlocked(lockedStage, save, false), false);
  writeTestMode(sessionStore, true);
  assert.equal(readTestMode(sessionStore), true);
  assert.equal(isStageUnlocked(lockedStage, save, true), true);
  assert.equal(JSON.stringify(save), before);
});
