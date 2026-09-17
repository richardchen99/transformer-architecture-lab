import { AlertCircle, ArrowRight, Braces, Lightbulb, Sigma } from 'lucide-react';
import type { ExplainMode, LabExample, LabModule } from '../types';

interface ExplanationPanelProps {
  module: LabModule;
  example: LabExample;
  explainMode: ExplainMode;
  onFormulaOpen: () => void;
}

export function ExplanationPanel({ module, example, explainMode, onFormulaOpen }: ExplanationPanelProps) {
  const modeCopy = {
    Beginner: module.beginner,
    Research: module.research,
    Mathematical: module.mathematical,
  }[explainMode];

  return (
    <aside className="explanationPanel" aria-label="Current module explanation">
      <div className="stageLine">
        <span className={`stageBadge ${module.stage.toLowerCase()}`}>{module.stage}</span>
        <span>{example.category}</span>
      </div>
      <h1>{module.title}</h1>
      <p className="leadCopy">{modeCopy}</p>

      <div className="ioStrip">
        <div>
          <span>Input</span>
          <strong>{module.input}</strong>
        </div>
        <ArrowRight size={18} />
        <div>
          <span>Output</span>
          <strong>{module.output}</strong>
        </div>
      </div>

      <div className="explainGrid">
        <section>
          <Lightbulb size={18} />
          <h3>Why it matters</h3>
          <p>{module.why}</p>
        </section>
        <section>
          <Braces size={18} />
          <h3>Where it sits</h3>
          <p>{module.position}</p>
        </section>
        <section>
          <AlertCircle size={18} />
          <h3>Common trap</h3>
          <p>{module.misconception}</p>
        </section>
      </div>

      <div className="exampleBox">
        <span>EXAMPLE WALKTHROUGH</span>
        <p>{module.example}</p>
        <small>{example.story}</small>
      </div>

      <button className="formulaButton" type="button" onClick={onFormulaOpen} disabled={!module.formula}>
        <Sigma size={16} />
        Formula Overlay
      </button>
    </aside>
  );
}
