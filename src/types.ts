export type ExplainMode = 'Beginner' | 'Research' | 'Mathematical';

export interface LabModule {
  id: string;
  title: string;
  stage: 'DATA' | 'MODEL' | 'DECISION';
  solves: string;
  input: string;
  output: string;
  why: string;
  position: string;
  example: string;
  misconception: string;
  beginner: string;
  research: string;
  mathematical: string;
  formula?: string;
  formulaLatex?: string;
}

export interface AttentionHead {
  id: string;
  label: string;
  focus: string;
  color: string;
  enabledDefault: boolean;
  description: string;
}

export interface LabExample {
  id: string;
  label: string;
  category: string;
  input: string;
  output: string;
  tokens: string[];
  focusToken: string;
  generated: string[];
  story: string;
  heads: AttentionHead[];
}

export interface AttentionResult {
  tokens: string[];
  embeddings: number[][];
  queries: number[][];
  keys: number[][];
  values: number[][];
  scores: number[][];
  scaledScores: number[][];
  attentionWeights: number[][];
  contextVectors: number[][];
}
