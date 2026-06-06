import assert from 'node:assert/strict';
import test from 'node:test';

import {
  commitMove,
  createHistory,
  createInitialState,
  move,
  redo,
  undo
} from './engine.ts';
import { PROJECT_SHIFT_STAGES } from './stages.ts';
import { completeStage, createDefaultSave, parseSave, saveRun } from './storage.ts';
import type { Direction } from './types.ts';

function play(stageIndex: number, directions: Direction[]) {
  const stage = PROJECT_SHIFT_STAGES[stageIndex];
  let state = createInitialState(stage);
  const events = [];

  for (const direction of directions) {
    const result = move(stage, state, direction);
    events.push(result);
    state = result.state;
  }

  return { stage, state, events };
}

test('all 100 stages are ordered, valid, and solved by their verified route', () => {
  assert.equal(PROJECT_SHIFT_STAGES.length, 100);

  for (const [index, stage] of PROJECT_SHIFT_STAGES.entries()) {
    assert.equal(stage.number, index + 1);
    assert.equal(stage.tier, Math.floor(index / 10) + 1);
    assert.equal(stage.tiles.length, stage.height);
    assert.ok(stage.tiles.every((row) => row.length === stage.width));
    assert.ok(stage.width <= 18);
    assert.ok(stage.height <= 12);
    assert.ok(stage.solution.length > 0);

    let state = createInitialState(stage);
    for (const direction of stage.solution) {
      const result = move(stage, state, direction);
      assert.equal(result.changed, true, `${stage.id} contains an invalid solution input`);
      state = result.state;
    }

    assert.equal(state.completed, true, `${stage.id} should be completed`);
    assert.equal(state.moves, stage.par, `${stage.id} solution should match par`);
  }
});

test('blocked input does not change state or consume a move', () => {
  const stage = PROJECT_SHIFT_STAGES.find((candidate) => {
    const initial = createInitialState(candidate);
    return (['up', 'down', 'left', 'right'] as Direction[])
      .some((direction) => !move(candidate, initial, direction).changed);
  });
  assert.ok(stage);
  const state = createInitialState(stage);
  const blockedDirection = (['up', 'down', 'left', 'right'] as Direction[])
    .find((direction) => !move(stage, state, direction).changed);
  assert.ok(blockedDirection);
  const result = move(stage, state, blockedDirection);

  assert.equal(result.changed, false);
  assert.equal(result.state.moves, 0);
  assert.deepEqual(result.state.player, state.player);
});

test('undo, redo, and a divergent move maintain history correctly', () => {
  const stage = PROJECT_SHIFT_STAGES[0];
  const initial = createInitialState(stage);
  const first = move(stage, initial, 'right');
  let history = commitMove(createHistory(initial), first.state);

  history = undo(history);
  assert.deepEqual(history.present.player, initial.player);
  assert.equal(history.future.length, 1);

  history = redo(history);
  assert.deepEqual(history.present.player, first.state.player);

  history = undo(history);
  const divergent = move(stage, history.present, 'down');
  history = commitMove(history, divergent.state);
  assert.equal(history.future.length, 0);
});

test('pressure doors, one-way fields, warp gates, and ice are exercised', () => {
  const pressureStage = PROJECT_SHIFT_STAGES.find((stage) => stage.mechanics.includes('switch'));
  const vectorStage = PROJECT_SHIFT_STAGES.find((stage) => stage.mechanics.includes('oneWay'));
  const warpStage = PROJECT_SHIFT_STAGES.find((stage) => stage.mechanics.includes('warp'));
  const iceStage = PROJECT_SHIFT_STAGES.find((stage) => stage.mechanics.includes('ice'));
  const convergenceStage = PROJECT_SHIFT_STAGES.find((stage) => stage.mechanics.length === 5);
  assert.ok(pressureStage && vectorStage && warpStage && iceStage && convergenceStage);

  const pressure = play(pressureStage.number - 1, pressureStage.solution);
  const vector = play(vectorStage.number - 1, vectorStage.solution);
  const warp = play(warpStage.number - 1, warpStage.solution);
  const ice = play(iceStage.number - 1, iceStage.solution);
  const convergence = play(convergenceStage.number - 1, convergenceStage.solution);

  assert.equal(pressure.state.completed, true);
  assert.equal(vector.state.completed, true);
  assert.equal(warp.events.some((event) => event.teleported), true);
  assert.equal(ice.events.some((event) => event.slid), true);
  assert.equal(convergence.events.some((event) => event.teleported && event.slid), true);
});

test('save parsing rejects corrupt data and preserves valid progress', () => {
  assert.deepEqual(parseSave('{broken'), createDefaultSave());
  assert.deepEqual(parseSave(JSON.stringify({ version: 2 })), createDefaultSave());
  assert.deepEqual(parseSave(JSON.stringify({ version: 99 })), createDefaultSave());

  const stage = PROJECT_SHIFT_STAGES[0];
  const moved = move(stage, createInitialState(stage), 'right').state;
  const running = saveRun(createDefaultSave(), moved);
  const restored = parseSave(JSON.stringify(running));

  assert.deepEqual(restored.run?.snapshot, moved);
  assert.equal(restored.currentStageId, stage.id);

  const completed = completeStage(restored, stage.id, 7);
  const improved = completeStage(completed, stage.id, 5);
  assert.equal(improved.unlocked, 2);
  assert.equal(improved.bestMoves[stage.id], 5);
  assert.equal(improved.run, null);
});
