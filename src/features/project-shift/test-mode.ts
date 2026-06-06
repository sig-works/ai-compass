import type { ProjectShiftSave, StageDefinition } from './types.ts';

export const PROJECT_SHIFT_TEST_MODE_KEY = 'project-shift-test-mode';

type SessionStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function readTestMode(store: SessionStore) {
  return store.getItem(PROJECT_SHIFT_TEST_MODE_KEY) === 'true';
}

export function writeTestMode(store: SessionStore, enabled: boolean) {
  if (enabled) {
    store.setItem(PROJECT_SHIFT_TEST_MODE_KEY, 'true');
  } else {
    store.removeItem(PROJECT_SHIFT_TEST_MODE_KEY);
  }
}

export function isStageUnlocked(stage: StageDefinition, save: ProjectShiftSave, testMode: boolean) {
  return testMode || stage.number <= save.unlocked;
}
