import type { AttentionResult } from '../types';

type Matrix = number[][];

const WQ: Matrix = [
  [0.72, 0.18, -0.24, 0.31],
  [0.08, 0.63, 0.21, -0.12],
  [-0.18, 0.26, 0.68, 0.16],
  [0.24, -0.14, 0.2, 0.75],
];

const WK: Matrix = [
  [0.66, 0.12, -0.12, 0.27],
  [0.17, 0.7, 0.12, -0.1],
  [-0.2, 0.18, 0.73, 0.24],
  [0.18, -0.09, 0.23, 0.72],
];

const WV: Matrix = [
  [0.58, -0.18, 0.2, 0.34],
  [0.1, 0.64, 0.16, 0.08],
  [0.2, 0.12, 0.62, -0.18],
  [-0.12, 0.22, 0.18, 0.7],
];

const semanticProfiles: Record<string, number[]> = {
  animal: [0.92, 0.14, 0.28, 0.76],
  it: [0.86, 0.18, 0.24, 0.72],
  tired: [0.78, 0.12, 0.36, 0.82],
  street: [0.14, 0.84, 0.25, 0.18],
  cat: [0.88, 0.18, 0.34, 0.74],
  mat: [0.2, 0.76, 0.32, 0.26],
  report: [0.32, 0.62, 0.78, 0.18],
  researcher: [0.78, 0.36, 0.54, 0.48],
  transformer: [0.42, 0.5, 0.92, 0.62],
  because: [0.34, 0.28, 0.66, 0.82],
  '决策': [0.7, 0.32, 0.86, 0.48],
  '智能': [0.62, 0.38, 0.94, 0.52],
  '金融': [0.24, 0.78, 0.72, 0.3],
  '研究': [0.42, 0.58, 0.9, 0.38],
};

function round(value: number) {
  return Number(value.toFixed(3));
}

function normalizeToken(token: string) {
  return token.toLowerCase().replace(/[^\p{L}\p{N}\u4e00-\u9fa5-]+/gu, '');
}

export function makeEmbedding(token: string, index: number, dim = 4) {
  const normalized = normalizeToken(token);
  const known = semanticProfiles[normalized];
  if (known) {
    return known.map((value, axis) => round(value + Math.sin(index + axis) * 0.025));
  }

  const codeSum = Array.from(token).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: dim }, (_, axis) => {
    const signal = Math.sin((codeSum + 17 * axis) * 0.013) + Math.cos((index + 1) * (axis + 2) * 0.37);
    return round(0.5 + signal * 0.22);
  });
}

function project(vector: number[], matrix: Matrix) {
  return matrix[0].map((_, col) => round(vector.reduce((sum, value, row) => sum + value * matrix[row][col], 0)));
}

function dot(left: number[], right: number[]) {
  return round(left.reduce((sum, value, index) => sum + value * right[index], 0));
}

function softmax(row: number[]) {
  const finiteValues = row.filter(Number.isFinite);
  const max = finiteValues.length ? Math.max(...finiteValues) : 0;
  const exps = row.map((value) => (Number.isFinite(value) ? Math.exp(value - max) : 0));
  const total = exps.reduce((sum, value) => sum + value, 0) || 1;
  return exps.map((value) => round(value / total));
}

function weightedSum(weights: number[], values: Matrix) {
  return values[0].map((_, col) => round(weights.reduce((sum, weight, row) => sum + weight * values[row][col], 0)));
}

export function runAttention(tokens: string[], options: { causalMask?: boolean } = {}): AttentionResult {
  const embeddings = tokens.map((token, index) => makeEmbedding(token, index));
  const queries = embeddings.map((vector) => project(vector, WQ));
  const keys = embeddings.map((vector) => project(vector, WK));
  const values = embeddings.map((vector) => project(vector, WV));
  const scale = Math.sqrt(keys[0]?.length || 1);

  const scores = queries.map((query) => keys.map((key) => dot(query, key)));
  const scaledScores = scores.map((row, rowIndex) =>
    row.map((score, colIndex) => {
      if (options.causalMask && colIndex > rowIndex) {
        return Number.NEGATIVE_INFINITY;
      }
      return round(score / scale);
    }),
  );
  const attentionWeights = scaledScores.map(softmax);
  const contextVectors = attentionWeights.map((weights) => weightedSum(weights, values));

  return {
    tokens,
    embeddings,
    queries,
    keys,
    values,
    scores,
    scaledScores,
    attentionWeights,
    contextVectors,
  };
}

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return '-inf';
  }
  return value.toFixed(2);
}

export function rowSum(row: number[]) {
  return round(row.reduce((sum, value) => sum + value, 0));
}
