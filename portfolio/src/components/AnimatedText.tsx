import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';

type AnimatedTextProps = {
  text: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Reveals a paragraph character-by-character as it scrolls through the
 * viewport. Each character rides its own slice of the scroll progress, so the
 * reveal sweeps left to right rather than fading the block as a whole.
 *
 * Characters are grouped into non-breaking word spans — laying every character
 * out independently would let the browser wrap in the middle of a word.
 */
export default function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  const words = text.split(' ');
  const total = text.length;
  let cursor = 0;

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((word, wordIndex) => {
        const start = cursor;
        cursor += word.length + 1; // + the space that follows

        return (
          <span key={wordIndex}>
            <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
              {Array.from(word).map((char, charIndex) => (
                <Character
                  key={charIndex}
                  char={char}
                  progress={scrollYProgress}
                  range={[(start + charIndex) / total, (start + charIndex + 1) / total]}
                />
              ))}
            </span>
            {wordIndex < words.length - 1 ? ' ' : null}
          </span>
        );
      })}
    </p>
  );
}

function Character({
  char,
  progress,
  range,
}: {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {/* Invisible copy holds the layout so the animated copy can sit on top. */}
      <span style={{ opacity: 0 }}>{char}</span>
      <motion.span aria-hidden="true" style={{ opacity, position: 'absolute', left: 0, top: 0 }}>
        {char}
      </motion.span>
    </span>
  );
}
