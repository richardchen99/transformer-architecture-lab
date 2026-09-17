import { motion } from 'framer-motion';
import { Binary, Map, SplitSquareHorizontal, Waves } from 'lucide-react';
import type { AttentionResult, LabExample, LabModule } from '../types';

interface TokenPipelineProps {
  example: LabExample;
  module: LabModule;
  attention: AttentionResult | null;
}

const pipelineOrder = ['tokenization', 'embedding', 'positional-encoding', 'qkv'];

export function TokenPipeline({ example, module, attention }: TokenPipelineProps) {
  const visible = example.tokens.slice(0, 10);
  const currentStage = pipelineOrder.includes(module.id) ? pipelineOrder.indexOf(module.id) : pipelineOrder.length;

  function stepClass(stepId: string, index: number) {
    if (module.id === stepId) return 'pipelineStep active';
    if (currentStage > index) return 'pipelineStep past';
    return 'pipelineStep';
  }

  return (
    <section className="sectionBand" id="token-flow">
      <div className="sectionIntro">
        <span className="eyebrow">TOKEN FLOW</span>
        <h2>从一句话到可计算的向量</h2>
        <p>
          Transformer 的入口不是“理解一句话”，而是先把文本变成 token id，再通过 embedding 和 position signal
          形成可以进入注意力层的表示。
        </p>
      </div>

      <div className="pipelineGrid">
        <motion.div className={stepClass('tokenization', 0)} layout whileHover={{ y: -3 }}>
          <i className="pipelinePulse" />
          <SplitSquareHorizontal size={20} />
          <span className="stepIndex">01</span>
          <span className="stepTitle">Raw Text</span>
          <p>{example.input}</p>
        </motion.div>
        <motion.div className={stepClass('embedding', 1)} layout whileHover={{ y: -3 }}>
          <i className="pipelinePulse" />
          <Binary size={20} />
          <span className="stepIndex">02</span>
          <span className="stepTitle">Token IDs</span>
          <div className="tokenWrap">
            {visible.map((token, index) => (
              <motion.b
                key={`${token}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.035 }}
                className={module.id === 'embedding' ? 'tokenChip active' : 'tokenChip'}
              >
                {token}
              </motion.b>
            ))}
          </div>
        </motion.div>
        <motion.div className={stepClass('positional-encoding', 2)} layout whileHover={{ y: -3 }}>
          <i className="pipelinePulse" />
          <Waves size={20} />
          <span className="stepIndex">03</span>
          <span className="stepTitle">Position Signal</span>
          <div className="waveStack" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </motion.div>
        <motion.div className={stepClass('qkv', 3)} layout whileHover={{ y: -3 }}>
          <i className="pipelinePulse" />
          <Map size={20} />
          <span className="stepIndex">04</span>
          <span className="stepTitle">Vector Space</span>
          <div className="miniVectors">
            {(attention?.embeddings.slice(0, 5) ?? []).map((vector, row) => (
              <div key={row}>
                {vector.map((value, col) => (
                  <motion.i
                    key={col}
                    animate={{ height: `${18 + value * 22}px` }}
                    transition={{ delay: row * 0.04 + col * 0.03, type: 'spring', stiffness: 180, damping: 22 }}
                  />
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
