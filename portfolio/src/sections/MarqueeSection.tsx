import { useEffect, useRef, useState } from 'react';
import { skills } from '../data/profile';

const SPLIT = Math.ceil(skills.length / 2);
const ROW_ONE = skills.slice(0, SPLIT);
const ROW_TWO = skills.slice(SPLIT);

/** Tripled so the row still reads as continuous at either scroll extreme. */
const tripled = (items: string[]) => [...items, ...items, ...items];

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const node = sectionRef.current;
      if (!node) return;
      const sectionTop = node.offsetTop;
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const shift = offset - 200;

  return (
    <section
      ref={sectionRef}
      aria-label="Skills and technologies"
      className="overflow-hidden pb-10 pt-24 sm:pt-32 md:pt-40"
      style={{ background: '#0C0C0C' }}
    >
      <div className="flex flex-col gap-3">
        <MarqueeRow items={tripled(ROW_ONE)} translate={shift} />
        <MarqueeRow items={tripled(ROW_TWO)} translate={-shift} />
      </div>
    </section>
  );
}

function MarqueeRow({ items, translate }: { items: string[]; translate: number }) {
  return (
    <div className="flex w-max gap-3" style={{ transform: `translateX(${translate}px)`, willChange: 'transform' }}>
      {items.map((label, index) => (
        <div
          key={`${label}-${index}`}
          className="flex shrink-0 items-center rounded-2xl border border-[#D7E2EA]/15 px-8 py-6 md:px-12 md:py-8"
          style={{
            background: 'linear-gradient(140deg, rgba(215,226,234,0.08) 0%, rgba(215,226,234,0.02) 100%)',
          }}
        >
          <span
            className="whitespace-nowrap font-medium uppercase tracking-wide text-[#D7E2EA]"
            style={{ fontSize: 'clamp(1rem, 2.6vw, 2.25rem)' }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
