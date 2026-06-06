import { isSnapshotValid } from './engine.ts';
import { getStage, PROJECT_SHIFT_STAGES } from './stages.ts';
import type { GameSnapshot, ProjectShiftSave } from './types.ts';

export const PROJECT_SHIFT_STORAGE_KEY = 'project-shift-save';
export const PROJECT_SHIFT_SAVE_VERSION = 4;

export function createDefaultSave(): ProjectShiftSave {
  return {
    version: PROJECT_SHIFT_SAVE_VERSION,
    unlocked: 1,
    currentStageId: PROJECT_SHIFT_STAGES[0].id,
    bestMoves: {},
    bestPushes: {},
    run: null
  };
}

function validBestValues(value: unknown) {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([stageId, count]) => Boolean(getStage(stageId)) && Number.isInteger(count) && Number(count) > 0
    )
  );
}

export function parseSave(raw: string | null): ProjectShiftSave {
  if (!raw) return createDefaultSave();
  try {
    const value = JSON.parse(raw) as Partial<ProjectShiftSave>;
    if (value.version !== PROJECT_SHIFT_SAVE_VERSION) return createDefaultSave();
    const currentStage = typeof value.currentStageId === 'string' ? getStage(value.currentStageId) : undefined;
    const unlocked = Math.min(
      PROJECT_SHIFT_STAGES.length,
      Math.max(1, Number.isInteger(value.unlocked) ? Number(value.unlocked) : 1)
    );
    let run: ProjectShiftSave['run'] = null;
    if (value.run && typeof value.run.stageId === 'string') {
      const runStage = getStage(value.run.stageId);
      if (runStage && isSnapshotValid(runStage, value.run.snapshot as GameSnapshot)) {
        run = { stageId: runStage.id, snapshot: value.run.snapshot as GameSnapshot };
      }
    }
    return {
      version: PROJECT_SHIFT_SAVE_VERSION,
      unlocked,
      currentStageId: currentStage?.id ?? PROJECT_SHIFT_STAGES[0].id,
      bestMoves: validBestValues(value.bestMoves),
      bestPushes: validBestValues(value.bestPushes),
      run
    };
  } catch {
    return createDefaultSave();
  }
}

export function completeStage(
  save: ProjectShiftSave,
  stageId: string,
  moves: number,
  pushes: number
): ProjectShiftSave {
  const stage = getStage(stageId);
  if (!stage) return save;
  const previousMoves = save.bestMoves[stageId];
  const previousPushes = save.bestPushes[stageId];
  return {
    ...save,
    unlocked: Math.min(PROJECT_SHIFT_STAGES.length, Math.max(save.unlocked, stage.number + 1)),
    bestMoves: { ...save.bestMoves, [stageId]: previousMoves ? Math.min(previousMoves, moves) : moves },
    bestPushes: { ...save.bestPushes, [stageId]: previousPushes ? Math.min(previousPushes, pushes) : pushes },
    run: null
  };
}

export function saveRun(save: ProjectShiftSave, snapshot: GameSnapshot): ProjectShiftSave {
  return {
    ...save,
    currentStageId: snapshot.stageId,
    run: snapshot.completed ? null : { stageId: snapshot.stageId, snapshot }
  };
}
