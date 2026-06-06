import { STAGE_SOURCES } from './stage-data.generated.ts';
import { buildStage, type StageSource } from './stage-source.ts';

export const PROJECT_SHIFT_STAGES = (STAGE_SOURCES as readonly StageSource[]).map(buildStage);

export function getStage(stageId: string) {
  return PROJECT_SHIFT_STAGES.find((stage) => stage.id === stageId);
}
