import { motion } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';

type FadeInProps = {
  children: ReactNode;
  /** Element type to render — 'div' by default, but any tag works. */
  as?: ElementType;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
};

export default function FadeIn({
  children,
  as = 'div',
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className,
  style,
  id,
}: FadeInProps) {
  const MotionTag = motion.create(as);

  return (
    <MotionTag
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </MotionTag>
  );
}
