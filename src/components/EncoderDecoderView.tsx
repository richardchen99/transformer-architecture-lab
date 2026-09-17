import { useEffect, useRef, useState } from 'react';
import { ArrowRightLeft, BrainCircuit, Play, ScanLine } from 'lucide-react';
import type { LabExample, LabModule } from '../types';

interface EncoderDecoderViewProps {
  example: LabExample;
  module: LabModule;
}

type InferenceStatus = 'idle' | 'thinking' | 'inference';

export function EncoderDecoderView({ example, module }: EncoderDecoderViewProps) {
  const [status, setStatus] = useState<InferenceStatus>('idle');
  const [generatedCount, setGeneratedCount] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setGeneratedCount(0);
    setStatus('idle');
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [example.id]);

  function runInference() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setGeneratedCount(0);
    setStatus('thinking');
    const thinkingDelay = 2000 + Math.round(Math.random() * 2000);
    timeoutRef.current = window.setTimeout(() => {
      setStatus('inference');
      intervalRef.current = window.setInterval(() => {
        setGeneratedCount((count) => {
          if (count >= example.generated.length) {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            return count;
          }
          return count + 1;
        });
      }, 520);
    }, thinkingDelay);
  }

  const generatedTokens = example.generated.slice(0, generatedCount);
  const activeStatus = status === 'idle' ? 'READY' : status === 'thinking' ? 'THINKING' : 'INFERENCE';

  return (
    <section className="sectionBand" id="encoder">
      <div className="sectionIntro">
        <span className="eyebrow">ENCODER / DECODER</span>
        <h2>理解输入与生成输出，是两种不同的信息流</h2>
        <p>
          Encoder 负责把输入序列读深，Decoder 负责在 causal mask 约束下逐步生成。翻译任务还会用
          cross-attention 把两侧连接起来。
        </p>
      </div>

      <div className="splitSystem">
        <div className={module.id === 'encoder' ? 'systemPanel active' : 'systemPanel'}>
          <div className="systemTitle">
            <BrainCircuit size={20} />
            <strong>Encoder Stack</strong>
          </div>
          <div className="layerStack" aria-label="Encoder layers">
            {[1, 2, 3, 4].map((layer) => (
              <div key={layer}>
                <span>Layer {layer}</span>
                <b>Self-Attention + AddNorm + FFN</b>
              </div>
            ))}
          </div>
          <p>
            输入 token 在每层都会重新读取上下文。浅层更像语法扫描，深层会把 evidence 汇总成更抽象的语义表示。
          </p>
        </div>

        <div className="crossAttentionBridge">
          <ArrowRightLeft size={24} />
          <span>Cross-Attention</span>
        </div>

        <div
          id="decoder"
          className={module.id === 'decoder' || module.id === 'cross-attention' ? 'systemPanel active' : 'systemPanel'}
        >
          <div className="systemTitle">
            <ScanLine size={20} />
            <strong>Decoder Generation</strong>
          </div>
          <div className="maskMatrix" aria-label="Causal mask matrix">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row}>
                {[0, 1, 2, 3, 4].map((col) => (
                  <i key={col} className={col > row ? 'masked' : ''} />
                ))}
              </div>
            ))}
          </div>
          <div className="generationRow">
            {generatedTokens.length === 0 ? <span className="placeholderToken">waiting for next token</span> : null}
            {generatedTokens.map((token) => (
              <b key={token}>{token}</b>
            ))}
          </div>
          <div className="inferenceFooter">
            <span className={`statusPill ${status === 'thinking' ? 'loading' : ''}`}>
              <span />
              {activeStatus}
            </span>
            <button className="primaryButton" type="button" onClick={runInference}>
              <Play size={16} />
              Run Inference
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
