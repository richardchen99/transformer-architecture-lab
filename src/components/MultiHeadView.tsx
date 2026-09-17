import { GitMerge, ToggleLeft, ToggleRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { LabExample, LabModule } from '../types';

interface MultiHeadViewProps {
  example: LabExample;
  module: LabModule;
  enabledHeads: Record<string, boolean>;
  onToggleHead: (headId: string) => void;
}

export function MultiHeadView({ example, module, enabledHeads, onToggleHead }: MultiHeadViewProps) {
  return (
    <section className="sectionBand" id="multi-head">
      <div className="sectionIntro">
        <span className="eyebrow">MULTI-HEAD OBSERVATORY</span>
        <h2>同一句话，被多个子空间同时阅读</h2>
        <p>
          多头机制让模型不必把所有关系挤进同一个注意力分布。每个 head 拿到不同投影，形成互补观察。
        </p>
      </div>

      <div className="headGrid">
        {example.heads.map((head, index) => {
          const enabled = enabledHeads[head.id];
          return (
            <button
              type="button"
              key={head.id}
              className={enabled ? 'headLane active' : 'headLane'}
              onClick={() => onToggleHead(head.id)}
              style={{ '--head-color': head.color } as CSSProperties}
            >
              <span className="headTopline">
                <b>{head.label}</b>
                {enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              </span>
              <strong>{head.focus}</strong>
              <p>{head.description}</p>
              <span className="laneViz" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((item) => (
                  <i key={item} style={{ '--i': index + item } as CSSProperties} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="concatBar">
        <GitMerge size={20} />
        <div>
          <strong>Concat + Linear Projection</strong>
          <p>
            开启的 head 会被拼接成一个更宽的表示，再通过 W_O 投影回模型维度。这里对应当前模块：
            <span>{module.title}</span>。
          </p>
        </div>
      </div>
    </section>
  );
}
