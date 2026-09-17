import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BrainCircuit,
  ExternalLink,
  Github,
  GraduationCap,
  Layers3,
  Network,
  Orbit,
  ScanLine,
  Sigma,
  SplitSquareHorizontal,
  Workflow,
  X,
} from 'lucide-react';
import { runAttentionDemo, fetchExamples, fetchModules } from './api/labApi';
import { ArchitectureCanvas } from './components/ArchitectureCanvas';
import { AttentionMicroscope } from './components/AttentionMicroscope';
import { Controls } from './components/Controls';
import { EncoderDecoderView } from './components/EncoderDecoderView';
import { ExampleWalkthrough } from './components/ExampleWalkthrough';
import { ExplanationPanel } from './components/ExplanationPanel';
import { Formula } from './components/Formula';
import { MathConsole } from './components/MathConsole';
import { MultiHeadView } from './components/MultiHeadView';
import { TokenPipeline } from './components/TokenPipeline';
import type { AttentionResult, ExplainMode, LabExample, LabModule } from './types';

const navItems = [
  { id: 'overview', label: 'Overview', Icon: Network },
  { id: 'token-flow', label: 'Token Flow', Icon: SplitSquareHorizontal },
  { id: 'attention', label: 'Self-Attention', Icon: Orbit },
  { id: 'multi-head', label: 'Multi-Head', Icon: Workflow },
  { id: 'encoder', label: 'Encoder', Icon: Layers3 },
  { id: 'decoder', label: 'Decoder', Icon: ScanLine },
  { id: 'math-console', label: 'Math Console', Icon: Sigma },
];

function App() {
  const [examples, setExamples] = useState<LabExample[]>([]);
  const [modules, setModules] = useState<LabModule[]>([]);
  const [exampleId, setExampleId] = useState('');
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');
  const [enabledHeads, setEnabledHeads] = useState<Record<string, boolean>>({});
  const [attention, setAttention] = useState<AttentionResult | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [attentionLoading, setAttentionLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [explainMode, setExplainMode] = useState<ExplainMode>('Beginner');
  const [matrixView, setMatrixView] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchExamples(), fetchModules()]).then(([exampleResponse, moduleResponse]) => {
      if (!mounted) return;
      setExamples(exampleResponse.examples);
      setModules(moduleResponse.modules);
      setExampleId(exampleResponse.examples[0]?.id ?? '');
      setIsHydrating(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const currentExample = useMemo(
    () => examples.find((example) => example.id === exampleId) ?? examples[0],
    [exampleId, examples],
  );
  const currentModule = modules[activeModuleIndex];
  const causalMask = currentModule?.id === 'decoder' || currentExample?.id === 'next-token';

  useEffect(() => {
    if (!currentExample) return;
    setEnabledHeads(
      Object.fromEntries(currentExample.heads.map((head) => [head.id, head.enabledDefault])),
    );
  }, [currentExample]);

  useEffect(() => {
    if (!currentExample) return;
    let mounted = true;
    setAttentionLoading(true);
    runAttentionDemo({ exampleId: currentExample.id, causalMask }).then((result) => {
      if (!mounted) return;
      setAttention(result);
      setAttentionLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [currentExample, causalMask]);

  useEffect(() => {
    if (!isPlaying || modules.length === 0) return;
    const timer = window.setInterval(() => {
      setActiveModuleIndex((index) => (index + 1) % modules.length);
    }, 3200 / speed);
    return () => window.clearInterval(timer);
  }, [isPlaying, modules.length, speed]);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { threshold: [0.35, 0.6], rootMargin: '-10% 0px -60% 0px' },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHydrating]);

  function stepForward() {
    if (modules.length === 0) return;
    setActiveModuleIndex((index) => (index + 1) % modules.length);
  }

  function stepBack() {
    if (modules.length === 0) return;
    setActiveModuleIndex((index) => (index - 1 + modules.length) % modules.length);
  }

  function selectModule(moduleId: string) {
    const nextIndex = modules.findIndex((module) => module.id === moduleId);
    if (nextIndex >= 0) setActiveModuleIndex(nextIndex);
  }

  function scrollToSection(sectionId: string) {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggleHead(headId: string) {
    setEnabledHeads((current) => ({ ...current, [headId]: !current[headId] }));
  }

  if (isHydrating || !currentExample || !currentModule) {
    return (
      <main className="bootScreen">
        <span className="statusPill loading">
          <span />
          THINKING
        </span>
        <h1>Loading Transformer Lab</h1>
      </main>
    );
  }

  return (
    <div className="appShell">
      <header className="topNav">
        <button className="brandMark" type="button" onClick={() => scrollToSection('overview')} aria-label="Transformer Lab">
          <BrainCircuit size={22} />
          <span>
            Transformer
            <b>Architecture Lab</b>
          </span>
        </button>
        <nav aria-label="Primary sections">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={activeSection === id ? 'active' : ''}
              onClick={() => scrollToSection(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <a
          className="repoLink"
          href="https://github.com/richardchen99/transformer-architecture-lab"
          target="_blank"
          rel="noreferrer"
        >
          <Github size={17} />
          GitHub
        </a>
      </header>

      <main>
        <section className="heroLab" id="overview">
          <motion.div
            className="heroIntro"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow">AI RESEARCH COCKPIT</span>
            <h1>Transformer Architecture Lab</h1>
            <p>
              用一个可操控的例子，把 token、embedding、Q/K/V、scaled dot-product attention、多头机制、
              encoder/decoder 和 next-token generation 串成一条完整证据链。
            </p>
            <div className="researchSignature">
              <GraduationCap size={16} />
              <span>
                Research author · <strong>中国人民大学 Richard Chen</strong>
              </span>
              <a href="https://richardchen99.github.io" target="_blank" rel="noreferrer">
                richardchen99.github.io
                <ExternalLink size={13} />
              </a>
            </div>
          </motion.div>

          <div className="labGrid">
            <ArchitectureCanvas
              module={currentModule}
              example={currentExample}
              attention={attention}
              enabledHeads={enabledHeads}
              speed={speed}
              matrixView={matrixView}
              loading={attentionLoading}
            />
            <ExplanationPanel
              module={currentModule}
              example={currentExample}
              explainMode={explainMode}
              onFormulaOpen={() => setFormulaOpen(true)}
            />
          </div>

          <Controls
            modules={modules}
            examples={examples}
            activeModuleId={currentModule.id}
            exampleId={currentExample.id}
            isPlaying={isPlaying}
            speed={speed}
            explainMode={explainMode}
            matrixView={matrixView}
            onStepBack={stepBack}
            onStepForward={stepForward}
            onTogglePlay={() => setIsPlaying((value) => !value)}
            onSpeedChange={setSpeed}
            onExampleChange={setExampleId}
            onModuleChange={selectModule}
            onModeChange={setExplainMode}
            onMatrixToggle={() => setMatrixView((value) => !value)}
          />
        </section>

        <TokenPipeline example={currentExample} module={currentModule} attention={attention} />
        <AttentionMicroscope
          example={currentExample}
          module={currentModule}
          attention={attention}
          matrixView={matrixView}
        />
        <MultiHeadView
          example={currentExample}
          module={currentModule}
          enabledHeads={enabledHeads}
          onToggleHead={toggleHead}
        />
        <EncoderDecoderView example={currentExample} module={currentModule} />
        <MathConsole example={currentExample} attention={attention} causalMask={causalMask} />
        <ExampleWalkthrough
          example={currentExample}
          modules={modules}
          activeModuleId={currentModule.id}
          onModuleSelect={selectModule}
        />
      </main>

      <AnimatePresence>
        {formulaOpen && (
          <motion.div
            className="formulaOverlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="formula-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="formulaSheet"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
            >
              <button className="iconButton closeButton" type="button" onClick={() => setFormulaOpen(false)} aria-label="Close formula">
                <X size={18} />
              </button>
              <span className="eyebrow">FORMULA LENS</span>
              <h2 id="formula-title">{currentModule.title}</h2>
              {currentModule.formulaLatex && (
                <div className="formulaDisplayCard">
                  <Formula latex={currentModule.formulaLatex} displayMode ariaLabel={currentModule.formula} />
                </div>
              )}
              <p>{currentModule.mathematical}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
