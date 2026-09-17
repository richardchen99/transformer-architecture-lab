import { examples } from '../data/examples';
import { modules } from '../data/modules';
import { runAttention } from '../lib/attention';

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function fetchExamples() {
  // TODO replace with GET /api/examples -> { examples: LabExample[] }
  await delay(320);
  return { examples };
}

export async function fetchModules() {
  // TODO replace with GET /api/modules -> { modules: LabModule[] }
  await delay(280);
  return { modules };
}

export async function runAttentionDemo(params: { exampleId: string; causalMask?: boolean }) {
  // TODO replace with POST /api/attention/run { exampleId, causalMask } -> AttentionResult
  await delay(360);
  const example = examples.find((item) => item.id === params.exampleId) ?? examples[0];
  return runAttention(example.tokens, { causalMask: params.causalMask });
}
