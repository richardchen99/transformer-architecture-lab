import { motion } from 'framer-motion';
import { Binary, Map, SplitSquareHorizontal, Waves } from 'lucide-react';
import type { AttentionResult, LabExample, LabModule } from '../types';

interface TokenPipelineProps {
  example: LabExample;
  module: LabModule;
  attention: AttentionResult | null;
}

export function TokenPipeline({ example, module, attention }: TokenPipelineProps) {
  const visible = example.tokens.slice(0, 10);

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
        <div className={module.id === 'tokenization' ? 'pipelineStep active' : 'pipelineStep'}>
          <SplitSquareHorizontal size={20} />
          <span>Raw Text</span>
          <p>{example.input}</p>
        </div>
        <div className={module.id === 'embedding' ? 'pipelineStep active' : 'pipelineStep'}>
          <Binary size={20} />
          <span>Token IDs</span>
          <div className="tokenWrap">
            {visible.map((token, index) => (
              <motion.b
                key={`${token}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.035 }}
              >
                {token}
              </motion.b>
            ))}
          </div>
        </div>
        <div className={module.id === 'positional-encoding' ? 'pipelineStep active' : 'pipelineStep'}>
          <Waves size={20} />
          <span>Position Signal</span>
          <div className="waveStack" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="pipelineStep">
          <Map size={20} />
          <span>Vector Space</span>
          <div className="miniVectors">
            {(attention?.embeddings.slice(0, 5) ?? []).map((vector, row) => (
              <div key={row}>
                {vector.map((value, col) => (
                  <i key={col} style={{ height: `${18 + value * 22}px` }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
