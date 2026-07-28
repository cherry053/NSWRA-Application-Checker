import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type MagnetProps = {
  children: ReactNode;
  /** How far outside the element's bounds the magnet starts pulling, in px. */
  padding?: number;
  /** Higher strength = subtler movement (the offset is divided by it). */
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
  wrapperClassName?: string;
};

export default function Magnet({
  children,
  padding = 150,
  strength = 3,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
  className,
  wrapperClassName,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const node = ref.current;
      if (!node) return;

      const { left, top, width, height } = node.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const distX = Math.abs(centerX - event.clientX);
      const distY = Math.abs(centerY - event.clientY);

      const inRange = distX < width / 2 + padding && distY < height / 2 + padding;

      if (inRange) {
        setActive(true);
        setOffset({
          x: (event.clientX - centerX) / strength,
          y: (event.clientY - centerY) / strength,
        });
      } else {
        setActive(false);
        setOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [padding, strength]);

  return (
    <div ref={ref} className={wrapperClassName} style={{ position: 'relative' }}>
      <div
        className={className}
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: active ? activeTransition : inactiveTransition,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
}
