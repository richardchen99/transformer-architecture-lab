import { Calculator, CheckCircle2, Table2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { AttentionResult, LabExample } from '../types';
import { formatNumber, rowSum } from '../lib/attention';

interface MathConsoleProps {
  example: LabExample;
  attention: AttentionResult | null;
  causalMask: boolean;
}

function MatrixTable({
  title,
  rows,
  tokens,
  compact = false,
}: {
  title: string;
  rows: number[][];
  tokens: string[];
  compact?: boolean;
}) {
  return (
    <div className="matrixBlock">
      <h3>{title}</h3>
      <div className={compact ? 'matrixTable compactMatrix' : 'matrixTable'}>
        <div className="matrixRow head">
          <span>token</span>
          {(rows[0] ?? []).map((_, index) => (
            <b key={index}>d{index + 1}</b>
          ))}
        </div>
        {rows.slice(0, 6).map((row, rowIndex) => (
          <div className="matrixRow" key={`${title}-${tokens[rowIndex]}-${rowIndex}`}>
            <span>{tokens[rowIndex]}</span>
            {row.map((value, colIndex) => (
              <b key={colIndex}>{formatNumber(value)}</b>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MathConsole({ example, attention, causalMask }: MathConsoleProps) {
  if (!attention) {
    return (
      <section className="sectionBand" id="math-console">
        <div className="sectionIntro">
          <span className="eyebrow">MATH CONSOLE</span>
          <h2>Matrix trace loading</h2>
        </div>
      </section>
    );
  }

  const visibleTokens = example.tokens.slice(0, 6);
  const visibleWeights = attention.attentionWeights.slice(0, 6).map((row) => row.slice(0, 6));

  return (
    <section className="sectionBand" id="math-console">
      <div className="sectionIntro">
        <span className="eyebrow">MATH CONSOLE</span>
        <h2>把公式拆成可检查的中间结果</h2>
        <p>
          这里的矩阵来自前端计算工具。它不训练真实模型，但保留了 Transformer attention 的核心计算形状：
          QK^T、缩放、softmax、乘以 V。
        </p>
      </div>

      <div className="mathSummary">
        <div>
          <Calculator size={20} />
          <strong>Attention(Q,K,V)</strong>
          <span>softmax(QK^T / sqrt(d_k))V</span>
        </div>
        <div>
          <CheckCircle2 size={20} />
          <strong>Row sum check</strong>
          <span>{attention.attentionWeights.slice(0, 4).map((row) => rowSum(row).toFixed(2)).join(' / ')}</span>
        </div>
        <div>
          <Table2 size={20} />
          <strong>Mask</strong>
          <span>{causalMask ? 'future tokens are zeroed' : 'full bidirectional attention'}</span>
        </div>
      </div>

      <div className="matrixGrid">
        <MatrixTable title="Embeddings X" rows={attention.embeddings} tokens={visibleTokens} />
        <MatrixTable title="Queries Q" rows={attention.queries} tokens={visibleTokens} />
        <MatrixTable title="Keys K" rows={attention.keys} tokens={visibleTokens} />
        <MatrixTable title="Context V*" rows={attention.contextVectors} tokens={visibleTokens} />
      </div>

      <div className="matrixBlock wide">
        <h3>Attention Weights</h3>
        <div className="weightMatrixTable">
          <div className="weightRow head">
            <span>from / to</span>
            {visibleTokens.map((token, index) => (
              <b key={`${token}-${index}`}>{token}</b>
            ))}
          </div>
          {visibleWeights.map((row, rowIndex) => (
            <div className="weightRow" key={`${visibleTokens[rowIndex]}-${rowIndex}`}>
              <span>{visibleTokens[rowIndex]}</span>
              {row.map((value, colIndex) => (
                <b
                  key={colIndex}
                  className={causalMask && colIndex > rowIndex ? 'maskedWeight' : ''}
                  style={{ '--heat': String(value) } as CSSProperties}
                >
                  {formatNumber(value)}
                </b>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
