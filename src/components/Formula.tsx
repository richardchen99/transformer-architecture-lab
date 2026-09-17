import { useMemo } from 'react';
import katex from 'katex';

interface FormulaProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function Formula({ latex, displayMode = false, className = '', ariaLabel }: FormulaProps) {
  const html = useMemo(
    () =>
      katex.renderToString(latex, {
        displayMode,
        output: 'htmlAndMathml',
        strict: 'ignore',
        throwOnError: false,
      }),
    [displayMode, latex],
  );

  const classes = ['formula', displayMode ? 'formulaDisplay' : 'formulaInline', className]
    .filter(Boolean)
    .join(' ');

  if (displayMode) {
    return <div className={classes} aria-label={ariaLabel ?? latex} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return <span className={classes} aria-label={ariaLabel ?? latex} dangerouslySetInnerHTML={{ __html: html }} />;
}
