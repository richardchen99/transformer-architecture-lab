import { Activity, ArrowRight, FunctionSquare, ScanSearch } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { AttentionResult, LabExample, LabModule } from '../types';
import { formatNumber, rowSum } from '../lib/attention';
import { Formula } from './Formula';

interface AttentionMicroscopeProps {
  example: LabExample;
  module: LabModule;
  attention: AttentionResult | null;
  matrixView: boolean;
}

const formulaSteps = [
  { label: 'Score', latex: String.raw`S=QK^\top`, copy: '每个 Query 与所有 Key 做点积，得到原始相关性分数。' },
  {
    label: 'Scale',
    latex: String.raw`\tilde{S}=S/\sqrt{d_k}`,
    copy: '高维点积容易过大，缩放让 softmax 不至于变得过尖。',
  },
  {
    label: 'Normalize',
    latex: String.raw`A=\operatorname{softmax}(\tilde{S})`,
    copy: '把每一行分数变成概率分布，权重总和为 1。',
  },
  { label: 'Readout', latex: String.raw`Z=AV`, copy: '按权重混合 Value，得到新的上下文化向量。' },
];

export function AttentionMicroscope({ example, module, attention, matrixView }: AttentionMicroscopeProps) {
  const visibleTokens = example.tokens.slice(0, 8);
  const focusIndex = Math.max(0, visibleTokens.findIndex((token) => token === example.focusToken));
  const weights = attention?.attentionWeights?.[focusIndex]?.slice(0, 8) ?? [];

  return (
    <section className="sectionBand" id="attention">
      <div className="sectionIntro">
        <span className="eyebrow">SELF-ATTENTION</span>
        <h2>把“相关性”变成可计算的信息路由</h2>
        <p>
          Attention 的核心不是一句“关注上下文”就结束，而是完整的四步：打分、缩放、归一化、读取 Value。
        </p>
      </div>

      <div className="attentionLayout">
        <div className="formulaTrack">
          {formulaSteps.map(({ label, latex, copy }, index) => (
            <div className={module.id === 'scaled-attention' ? 'formulaStep active' : 'formulaStep'} key={label}>
              <FunctionSquare size={18} />
              <strong>{label}</strong>
              <Formula latex={latex} ariaLabel={label} />
              <p>{copy}</p>
              {index < 3 && <ArrowRight size={16} className="formulaArrow" />}
            </div>
          ))}
        </div>

        <div className="heatmapPanel">
          <div className="panelHeader compact">
            <div>
              <span className="eyebrow">ATTENTION HEATMAP</span>
              <h3>{example.focusToken} reads from context</h3>
            </div>
            <ScanSearch size={20} />
          </div>
          <div className={matrixView ? 'heatmap matrixMode' : 'heatmap'} role="table" aria-label="Attention weights">
            <div className="heatmapHead" role="row">
              <span />
              {visibleTokens.map((token, index) => (
                <b key={`${token}-head-${index}`}>{token}</b>
              ))}
            </div>
            {visibleTokens.map((rowToken, rowIndex) => (
              <div className="heatmapRow" role="row" key={`${rowToken}-row-${rowIndex}`}>
                <b>{rowToken}</b>
                {visibleTokens.map((colToken, colIndex) => {
                  const value = attention?.attentionWeights?.[rowIndex]?.[colIndex] ?? 0;
                  return (
                    <span
                      role="cell"
                      key={`${rowToken}-${colToken}-${colIndex}`}
                      style={{ '--heat': String(value) } as CSSProperties}
                      title={`${rowToken} -> ${colToken}: ${formatNumber(value)}`}
                    >
                      {matrixView ? formatNumber(value) : ''}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="weightNarrative">
            <Activity size={18} />
            <p>
              当前焦点 token <strong>{example.focusToken}</strong> 的 softmax 权重行求和为{' '}
              <strong>{formatNumber(rowSum(weights))}</strong>。权重越高，连线越粗，说明该 token 的 Value
              被更多写入当前表示。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
