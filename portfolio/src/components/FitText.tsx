import { useCallback, useLayoutEffect, useRef, useState } from 'react';

type FitTextProps = {
  children: string;
  className?: string;
  /** Fraction of the container width the text should occupy. */
  fill?: number;
  /** Font size used before measurement completes, as a vw value. */
  fallbackVw?: number;
};

/**
 * Scales a single line of text so it spans its container exactly. Measuring
 * beats a hand-tuned `vw` size here: the hero line has to stay edge-to-edge for
 * any name length, and it must not overflow in the window between first paint
 * and the webfont loading.
 */
export default function FitText({
  children,
  className,
  fill = 1,
  fallbackVw = 12,
}: FitTextProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);

  const fit = useCallback(() => {
    const wrap = wrapRef.current;
    const node = textRef.current;
    if (!wrap || !node) return;

    const previous = node.style.fontSize;
    node.style.fontSize = '100px';
    // offsetWidth of the shrink-to-fit box is the true line width, and unlike
    // getBoundingClientRect it ignores any transform an ancestor is animating.
    const measured = node.offsetWidth;
    node.style.fontSize = previous;

    if (!measured || !wrap.clientWidth) return;
    setFontSize((wrap.clientWidth * fill * 100) / measured);
  }, [fill]);

  useLayoutEffect(() => {
    fit();
    window.addEventListener('resize', fit);
    // Re-fit once the webfont swaps in — metrics change with it.
    document.fonts?.ready.then(fit).catch(() => undefined);
    return () => window.removeEventListener('resize', fit);
  }, [fit, children]);

  return (
    <div ref={wrapRef} className="w-full text-center">
      <span
        ref={textRef}
        className={className}
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          fontSize: fontSize ? `${fontSize}px` : `${fallbackVw}vw`,
        }}
      >
        {children}
      </span>
    </div>
  );
}
