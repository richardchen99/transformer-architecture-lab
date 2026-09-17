import { motion } from 'framer-motion';
import type { AttentionResult, LabExample, LabModule } from '../types';

interface ArchitectureCanvasProps {
  module: LabModule;
  example: LabExample;
  attention: AttentionResult | null;
  enabledHeads: Record<string, boolean>;
  speed: number;
  matrixView: boolean;
  loading: boolean;
}

const stageOrder = [
  'tokenization',
  'embedding',
  'positional-encoding',
  'qkv',
  'scaled-attention',
  'multi-head',
  'add-norm',
  'ffn',
  'encoder',
  'decoder',
  'cross-attention',
];

function isPast(currentId: string, targetId: string) {
  return stageOrder.indexOf(currentId) >= stageOrder.indexOf(targetId);
}

export function ArchitectureCanvas({
  module,
  example,
  attention,
  enabledHeads,
  speed,
  matrixView,
  loading,
}: ArchitectureCanvasProps) {
  const visibleTokens = example.tokens.slice(0, 8);
  const focusIndex = Math.max(0, visibleTokens.findIndex((token) => token === example.focusToken));
  const weights = attention?.attentionWeights?.[focusIndex] ?? [];
  const enabledHeadCount = example.heads.filter((head) => enabledHeads[head.id]).length;
  const duration = 1.8 / speed;

  return (
    <div className="architecturePanel" aria-label="Animated Transformer architecture">
      <div className="panelHeader">
        <div>
          <span className="eyebrow">LIVE ARCHITECTURE</span>
          <h2>{module.title}</h2>
        </div>
        <span className={loading ? 'statusPill loading' : 'statusPill'}>
          <span />
          {loading ? 'THINKING' : 'INFERENCE'}
        </span>
      </div>

      <svg className="architectureSvg" viewBox="0 0 980 540" role="img" aria-labelledby="architecture-title">
        <title id="architecture-title">Transformer architecture flow animation</title>
        <defs>
          <linearGradient id="goldFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C8A96A" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#C8A96A" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#6FA8DC" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="blueGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#EAF3F8" stopOpacity="0.74" />
          </linearGradient>
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="18" y="18" width="944" height="504" rx="26" fill="rgba(255,255,255,.38)" stroke="rgba(200,169,106,.2)" />

        <g className="tokenRow">
          {visibleTokens.map((token, index) => {
            const x = 72 + index * 104;
            const active = index === focusIndex;
            return (
              <motion.g
                key={`${token}-${index}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.42 }}
              >
                <rect
                  x={x}
                  y="72"
                  width="86"
                  height="38"
                  rx="12"
                  fill={active ? 'rgba(200,169,106,.26)' : 'rgba(255,255,255,.82)'}
                  stroke={active ? '#C8A96A' : 'rgba(29,39,51,.13)'}
                />
                <text x={x + 43} y="96" textAnchor="middle" className="svgToken">
                  {token}
                </text>
                {isPast(module.id, 'embedding') && (
                  <motion.path
                    d={`M ${x + 43} 112 C ${x + 45} 138, ${x + 36} 150, ${x + 43} 174`}
                    stroke="url(#goldFlow)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration, repeat: Infinity, repeatType: 'reverse' }}
                  />
                )}
              </motion.g>
            );
          })}
        </g>

        <g className="embeddingRow">
          {visibleTokens.map((token, index) => {
            const x = 74 + index * 104;
            const vector = attention?.embeddings?.[index] ?? [0.2, 0.4, 0.6, 0.8];
            return (
              <motion.g
                key={`vector-${token}-${index}`}
                animate={{ opacity: isPast(module.id, 'embedding') ? 1 : 0.18 }}
                transition={{ duration: 0.25 }}
              >
                {vector.map((value, axis) => (
                  <rect
                    key={axis}
                    x={x + axis * 18}
                    y={196 - value * 34}
                    width="12"
                    height={18 + value * 34}
                    rx="5"
                    fill={axis % 2 ? '#6FA8DC' : '#C8A96A'}
                    opacity={0.55 + value * 0.35}
                  />
                ))}
              </motion.g>
            );
          })}
        </g>

        <motion.g animate={{ opacity: isPast(module.id, 'positional-encoding') ? 1 : 0.16 }}>
          <path d="M 82 230 C 170 195, 250 265, 338 230 S 520 195, 608 230 S 790 265, 878 230" fill="none" stroke="#80B59B" strokeWidth="3" strokeLinecap="round" />
          <path d="M 82 252 C 170 287, 250 217, 338 252 S 520 287, 608 252 S 790 217, 878 252" fill="none" stroke="#6FA8DC" strokeWidth="2" strokeLinecap="round" opacity=".72" />
          <text x="80" y="286" className="svgLabel">
            position vectors added to token embeddings
          </text>
        </motion.g>

        <motion.g animate={{ opacity: isPast(module.id, 'qkv') ? 1 : 0.12 }}>
          {['Q', 'K', 'V'].map((label, row) => (
            <g key={label}>
              <rect x={116 + row * 94} y={320} width="72" height="42" rx="14" fill="url(#blueGlass)" stroke="rgba(111,168,220,.28)" />
              <text x={152 + row * 94} y="347" textAnchor="middle" className="svgBlockText">
                {label}
              </text>
            </g>
          ))}
          <motion.path
            d="M 358 340 C 438 284, 532 284, 612 340"
            fill="none"
            stroke="url(#goldFlow)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isPast(module.id, 'scaled-attention') ? 1 : 0.22 }}
            transition={{ duration, repeat: Infinity, repeatType: 'mirror' }}
          />
          <rect x="620" y="300" width="178" height="84" rx="18" fill="rgba(255,255,255,.82)" stroke="rgba(200,169,106,.24)" />
          <text x="709" y="330" textAnchor="middle" className="svgBlockText">
            softmax(QK^T/sqrt(dk))
          </text>
          <text x="709" y="358" textAnchor="middle" className="svgLabel">
            normalized routing weights
          </text>
        </motion.g>

        <motion.g animate={{ opacity: isPast(module.id, 'scaled-attention') ? 1 : 0.1 }}>
          {visibleTokens.map((token, index) => {
            const x1 = 72 + focusIndex * 104 + 43;
            const x2 = 72 + index * 104 + 43;
            const weight = weights[index] ?? (index === focusIndex ? 0.24 : 0.08);
            return (
              <motion.path
                key={`link-${token}-${index}`}
                d={`M ${x1} 116 C ${x1} ${150 + index * 3}, ${x2} ${150 - index * 3}, ${x2} 116`}
                fill="none"
                stroke={index === focusIndex ? '#C8A96A' : '#6FA8DC'}
                strokeWidth={Math.max(1, weight * 16)}
                strokeOpacity={0.18 + weight * 1.3}
                strokeLinecap="round"
                filter={index === focusIndex ? 'url(#softGlow)' : undefined}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: duration * 1.1, repeat: Infinity, repeatType: 'reverse' }}
              />
            );
          })}
        </motion.g>

        <motion.g animate={{ opacity: isPast(module.id, 'multi-head') ? 1 : 0.12 }}>
          {example.heads.map((head, index) => {
            const enabled = enabledHeads[head.id];
            return (
              <g key={head.id}>
                <rect
                  x={118 + index * 192}
                  y="410"
                  width="150"
                  height="48"
                  rx="16"
                  fill={enabled ? `${head.color}33` : 'rgba(255,255,255,.42)'}
                  stroke={enabled ? head.color : 'rgba(29,39,51,.12)'}
                />
                <text x={193 + index * 192} y="431" textAnchor="middle" className="svgBlockText">
                  {head.label}
                </text>
                <text x={193 + index * 192} y="449" textAnchor="middle" className="svgLabel">
                  {head.focus}
                </text>
              </g>
            );
          })}
          <text x="490" y="492" textAnchor="middle" className="svgLabel">
            {enabledHeadCount} heads active {'->'} concat {'->'} linear projection
          </text>
        </motion.g>

        <motion.g animate={{ opacity: isPast(module.id, 'encoder') ? 1 : 0.1 }}>
          {[0, 1, 2].map((layer) => (
            <rect
              key={layer}
              x={802 + layer * 20}
              y={176 - layer * 14}
              width="92"
              height="142"
              rx="16"
              fill="rgba(255,255,255,.58)"
              stroke="rgba(128,181,155,.38)"
            />
          ))}
          <text x="862" y="250" textAnchor="middle" className="svgBlockText">
            Encoder Stack
          </text>
        </motion.g>

        <motion.g animate={{ opacity: isPast(module.id, 'decoder') || module.id === 'cross-attention' ? 1 : 0.08 }}>
          <rect x="804" y="338" width="112" height="92" rx="18" fill="rgba(255,255,255,.72)" stroke="rgba(200,169,106,.28)" />
          <path d="M 822 414 L 898 414 L 898 356" fill="rgba(200,169,106,.16)" stroke="#C8A96A" strokeWidth="2" />
          <text x="860" y="374" textAnchor="middle" className="svgBlockText">
            Causal
          </text>
          <text x="860" y="398" textAnchor="middle" className="svgLabel">
            Mask
          </text>
        </motion.g>
      </svg>

      <div className="canvasFooter">
        <span>Active example: {example.label}</span>
        <span>{matrixView ? 'Matrix View linked' : 'Concept View linked'}</span>
      </div>
    </div>
  );
}
