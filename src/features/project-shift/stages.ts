import { STAGE_SOURCES } from './stage-data.generated.ts';
import { buildStage, findStageWarnings, type StageSource } from './stage-source.ts';

export const PROJECT_SHIFT_STAGES = (STAGE_SOURCES as readonly StageSource[]).map(buildStage);

if (import.meta.env?.DEV) {
  for (const source of STAGE_SOURCES as readonly StageSource[]) {
    for (const warning of findStageWarnings(source)) {
      console.warn(`[Project SHIFT: ${warning.code}] ${warning.stageId}: ${warning.message}`);
    }
  }
}

export function getStage(stageId: string) {
  return PROJECT_SHIFT_STAGES.find((stage) => stage.id === stageId);
}
