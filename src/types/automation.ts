export interface AutomationSession {
  startedAt: number;
  status: string;
  step: string;
  fieldsDetected: number;
  fieldsMapped: number;
  fieldsFilled: number;
  fieldsRequiringAttention: number;
}
