import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRightLeft,
  BrainCircuit,
  Database,
  Gauge,
  Play,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { LabExample, LabModule } from '../types';

interface EncoderDecoderViewProps {
  example: LabExample;
  module: LabModule;
}

type InferenceStatus = 'idle' | 'thinking' | 'inference' | 'complete';

const decoderPhases = [
  {
    label: 'Mask',
    copy: 'future cells blocked',
    Icon: ShieldCheck,
  },
  {
    label: 'Logits',
    copy: 'candidate scores scanned',
    Icon: Gauge,
  },
  {
    label: 'Sample',
    copy: 'next token committed',
    Icon: Sparkles,
  },
  {
    label: 'Cache',
    copy: 'K/V state retained',
    Icon: Database,
  },
];

function uniqueTokens(tokens: string[]) {
  return tokens.filter((token, index) => token && tokens.indexOf(token) === index);
}

export function EncoderDecoderView({ example, module }: EncoderDecoderViewProps) {
  const [status, setStatus] = useState<InferenceStatus>('idle');
  const [generatedCount, setGeneratedCount] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const phaseIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setGeneratedCount(0);
    setPhaseIndex(0);
    setStatus('idle');
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (phaseIntervalRef.current) window.clearInterval(phaseIntervalRef.current);
    };
  }, [example.id]);

  function clearTimers() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (phaseIntervalRef.current) window.clearInterval(phaseIntervalRef.current);
  }

  function resetInference() {
    clearTimers();
    setGeneratedCount(0);
    setPhaseIndex(0);
    setStatus('idle');
  }

  function runInference() {
    clearTimers();
    setGeneratedCount(0);
    setPhaseIndex(0);
    setStatus('thinking');
    phaseIntervalRef.current = window.setInterval(() => {
      setPhaseIndex((index) => (index + 1) % decoderPhases.length);
    }, 680);

    const thinkingDelay = 2000 + Math.round(Math.random() * 2000);
    timeoutRef.current = window.setTimeout(() => {
      setStatus('inference');
      intervalRef.current = window.setInterval(() => {
        setGeneratedCount((count) => {
          const nextCount = count + 1;
          if (nextCount >= example.generated.length) {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            if (phaseIntervalRef.current) window.clearInterval(phaseIntervalRef.current);
            setPhaseIndex(decoderPhases.length - 1);
            setStatus('complete');
            return example.generated.length;
          }
          return nextCount;
        });
      }, 520);
    }, thinkingDelay);
  }

  const generatedTokens = example.generated.slice(0, generatedCount);
  const activeStatus =
    status === 'idle' ? 'READY' : status === 'thinking' ? 'THINKING' : status === 'complete' ? 'COMPLETE' : 'INFERENCE';
  const activePhase = status === 'idle' ? -1 : phaseIndex;
  const progress = example.generated.length > 0 ? Math.round((generatedCount / example.generated.length) * 100) : 0;
  const currentTarget = example.generated[Math.min(generatedCount, Math.max(0, example.generated.length - 1))] ?? 'token';
  const contextTokens = [...example.tokens.slice(-5), ...generatedTokens].slice(-8);
  const candidateTokens = uniqueTokens([
    currentTarget,
    example.generated[generatedCount + 1],
    example.focusToken,
    example.tokens[Math.max(0, example.tokens.length - 2)],
    'EOS',
  ]).slice(0, 4);
  const candidates = candidateTokens.map((token, index) => ({
    token,
    score: Math.min(0.92, Math.max(0.12, 0.78 - index * 0.16 + (activePhase === 2 && index === 0 ? 0.08 : 0))),
  }));

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
        <motion.div
          className={module.id === 'encoder' ? 'systemPanel active' : 'systemPanel'}
          layout
          transition={{ type: 'spring', stiffness: 220, damping: 28 }}
        >
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
        </motion.div>

        <div className="crossAttentionBridge">
          <ArrowRightLeft size={24} />
          <span>Cross-Attention</span>
        </div>

        <motion.div
          id="decoder"
          className={
            module.id === 'decoder' || module.id === 'cross-attention'
              ? `systemPanel decoderPanel active status-${status}`
              : `systemPanel decoderPanel status-${status}`
          }
          layout
          transition={{ type: 'spring', stiffness: 220, damping: 28 }}
        >
          <div className="systemTitle">
            <ScanLine size={20} />
            <strong>Decoder Generation</strong>
          </div>

          <div className="decoderProgress" aria-label={`Generation progress ${progress}%`}>
            <motion.span animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 160, damping: 24 }} />
          </div>

          <div className="decoderWorkbench">
            <div className="decoderContext">
              <span className="microLabel">Context Window</span>
              <div className="contextTokenRail">
                {contextTokens.map((token, index) => (
                  <motion.b
                    key={`${token}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.035 }}
                    className={index >= contextTokens.length - generatedTokens.length ? 'generatedContext' : ''}
                  >
                    {token}
                  </motion.b>
                ))}
              </div>
            </div>

            <div className="decoderPhaseRail" aria-label="Decoder inference phases">
              {decoderPhases.map(({ label, copy, Icon }, index) => (
                <motion.div
                  key={label}
                  className={activePhase === index ? 'decoderPhase active' : activePhase > index ? 'decoderPhase done' : 'decoderPhase'}
                  animate={{ y: activePhase === index ? -2 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                >
                  <Icon size={16} />
                  <strong>{label}</strong>
                  <small>{copy}</small>
                </motion.div>
              ))}
            </div>

            <div className="decoderSignalGrid">
              <div className="decoderMaskBlock">
                <span className="microLabel">Causal Mask</span>
                <div className="maskMatrix decoderMask" aria-label="Causal mask matrix">
                  {[0, 1, 2, 3, 4, 5].map((row) => (
                    <div key={row}>
                      {[0, 1, 2, 3, 4, 5].map((col) => (
                        <motion.i
                          key={col}
                          className={[
                            col > row ? 'masked' : 'visible',
                            activePhase === 0 && row === Math.min(5, generatedCount) ? 'activeCell' : '',
                          ].join(' ')}
                          animate={{ scale: activePhase === 0 && row === Math.min(5, generatedCount) ? 1.08 : 1 }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="logitPanel">
                <span className="microLabel">Next Token Distribution</span>
                {candidates.map((candidate, index) => (
                  <div className={index === 0 ? 'candidateBar primary' : 'candidateBar'} key={`${candidate.token}-${index}`}>
                    <span>{candidate.token}</span>
                    <i>
                      <motion.b
                        animate={{ width: `${Math.round(candidate.score * 100)}%` }}
                        transition={{ type: 'spring', stiffness: 130, damping: 20 }}
                      />
                    </i>
                    <em>{Math.round(candidate.score * 100)}%</em>
                  </div>
                ))}
              </div>
            </div>

            <div className="kvCachePanel">
              <span className="microLabel">KV Cache Update</span>
              <div>
                {contextTokens.slice(-6).map((token, index) => (
                  <motion.span
                    key={`${token}-cache-${index}`}
                    className={activePhase === 3 && index === contextTokens.slice(-6).length - 1 ? 'cacheSlot active' : 'cacheSlot'}
                    initial={{ opacity: 0.35 }}
                    animate={{ opacity: 1 }}
                  >
                    K{index + 1}/V{index + 1}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="generationTimeline">
              <span className="microLabel">Generated Trace</span>
              <div className="generationRow">
                <AnimatePresence initial={false}>
                  {generatedTokens.length === 0 ? (
                    <motion.span
                      className="placeholderToken"
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -6 }}
                    >
                      waiting for next token
                    </motion.span>
                  ) : (
                    generatedTokens.map((token, index) => (
                      <motion.b
                        key={`${token}-${index}`}
                        initial={{ opacity: 0, y: 12, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                      >
                        {token}
                      </motion.b>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="inferenceFooter">
            <span className={`statusPill ${status === 'thinking' ? 'loading' : ''}`}>
              <span />
              {activeStatus}
            </span>
            <div className="inferenceActions">
              <button className="ghostButton" type="button" onClick={resetInference}>
                <RotateCcw size={15} />
                Reset
              </button>
              <button className="primaryButton runButton" type="button" onClick={runInference}>
                <Play size={16} />
                Run Inference
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
