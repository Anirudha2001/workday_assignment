import { heuristicMapField } from './heuristicMapper';
import { aiMapField } from './aiMapper';
import type { ResumeData, WorkdayField } from '../types/resume';
import type { MappingResult } from '../types/resume';

export const mapField = async (
  field: WorkdayField,
  resume: ResumeData,
  aiService?: (payload: unknown) => Promise<unknown>
): Promise<MappingResult> => {
  const heuristic = heuristicMapField(field, resume);

  if (heuristic.matchedField && heuristic.confidence >= 0.7 && heuristic.value) {
    return heuristic;
  }

  if (!aiService) {
    return heuristic;
  }

  const aiResult = await aiMapField(field, resume, { threshold: 0.68, aiService: aiService });
  if (aiResult.confidence > heuristic.confidence) {
    return aiResult;
  }

  return heuristic;
};
