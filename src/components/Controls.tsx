import { ChevronLeft, ChevronRight, Pause, Play, Sigma } from 'lucide-react';
import type { ExplainMode, LabExample, LabModule } from '../types';

interface ControlsProps {
  modules: LabModule[];
  examples: LabExample[];
  activeModuleId: string;
  exampleId: string;
  isPlaying: boolean;
  speed: number;
  explainMode: ExplainMode;
  matrixView: boolean;
  onStepBack: () => void;
  onStepForward: () => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  onExampleChange: (exampleId: string) => void;
  onModuleChange: (moduleId: string) => void;
  onModeChange: (mode: ExplainMode) => void;
  onMatrixToggle: () => void;
}

const speeds = [0.5, 1, 1.5, 2];
const modes: ExplainMode[] = ['Beginner', 'Research', 'Mathematical'];

export function Controls({
  modules,
  examples,
  activeModuleId,
  exampleId,
  isPlaying,
  speed,
  explainMode,
  matrixView,
  onStepBack,
  onStepForward,
  onTogglePlay,
  onSpeedChange,
  onExampleChange,
  onModuleChange,
  onModeChange,
  onMatrixToggle,
}: ControlsProps) {
  return (
    <div className="controlDock" aria-label="Transformer lab controls">
      <div className="controlCluster transportControls">
        <button className="iconButton" type="button" onClick={onStepBack} aria-label="Step back">
          <ChevronLeft size={18} />
        </button>
        <button className="primaryButton" type="button" onClick={onTogglePlay}>
          {isPlaying ? <Pause size={17} /> : <Play size={17} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button className="iconButton" type="button" onClick={onStepForward} aria-label="Step forward">
          <ChevronRight size={18} />
        </button>
      </div>

      <label className="fieldControl">
        <span>Example</span>
        <select value={exampleId} onChange={(event) => onExampleChange(event.target.value)}>
          {examples.map((example) => (
            <option key={example.id} value={example.id}>
              {example.label}
            </option>
          ))}
        </select>
      </label>

      <label className="fieldControl moduleSelect">
        <span>Module</span>
        <select value={activeModuleId} onChange={(event) => onModuleChange(event.target.value)}>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>
      </label>

      <div className="segmented" aria-label="Explain depth">
        {modes.map((mode) => (
          <button
            key={mode}
            className={mode === explainMode ? 'active' : ''}
            type="button"
            onClick={() => onModeChange(mode)}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="speedRail" aria-label="Animation speed">
        <span>{speed}x</span>
        <input
          aria-label="Speed"
          type="range"
          min="0"
          max="3"
          step="1"
          value={speeds.indexOf(speed)}
          onChange={(event) => onSpeedChange(speeds[Number(event.target.value)])}
        />
      </div>

      <button className={matrixView ? 'ghostButton active' : 'ghostButton'} type="button" onClick={onMatrixToggle}>
        <Sigma size={16} />
        Matrix View
      </button>
    </div>
  );
}
