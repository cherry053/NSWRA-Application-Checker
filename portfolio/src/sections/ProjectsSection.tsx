import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import LiveProjectButton from '../components/LiveProjectButton';
import { projects } from '../data/profile';
import type { Project } from '../data/profile';

export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 rounded-t-[40px] px-5 py-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:py-32"
      style={{ background: '#0C0C0C' }}
    >
      <FadeIn as="h2" delay={0} y={40}>
        <span
          className="hero-heading mb-16 block text-center font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Projects
        </span>
      </FadeIn>

      <div ref={containerRef} className="mx-auto max-w-6xl">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.number}
            project={project}
            index={index}
            progress={scrollYProgress}
            range={[index * (1 / projects.length), 1]}
            targetScale={1 - (projects.length - 1 - index) * 0.03}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
  progress,
  range,
  targetScale,
}: {
  project: Project;
  index: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}) {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div className="mb-8 md:sticky md:top-32 md:mb-0 md:h-[85vh]">
      <motion.article
        style={{ scale, top: `${index * 28}px` }}
        className="relative rounded-[40px] border-2 border-[#D7E2EA] p-4 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8"
      >
        {/* Solid fill so a card stacking above fully covers the one beneath. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
          style={{ background: '#0C0C0C' }}
        />

        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-5 md:gap-8">
            <span
              className="hero-heading shrink-0 font-black leading-none"
              style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
            >
              {project.number}
            </span>

            <div className="flex flex-col gap-2 pt-1 md:pt-3">
              <span className="text-[0.65rem] font-light uppercase tracking-[0.25em] text-[#D7E2EA]/50 sm:text-xs">
                {project.category} · {project.period}
              </span>
              <h3
                className="font-medium uppercase leading-tight text-[#D7E2EA]"
                style={{ fontSize: 'clamp(1.15rem, 2.6vw, 2.4rem)' }}
              >
                {project.name}
              </h3>
            </div>
          </div>

          <LiveProjectButton
            label={project.linkLabel ?? 'Live Project'}
            href={project.link}
            className="self-start lg:mt-4"
          />
        </header>

        <div className="mt-6 flex flex-col gap-3 md:mt-8 md:flex-row">
          <div
            className="flex flex-col justify-between gap-6 rounded-[40px] p-6 sm:rounded-[50px] sm:p-8 md:w-[40%] md:rounded-[60px]"
            style={{
              background:
                'linear-gradient(150deg, rgba(182,0,168,0.16) 0%, rgba(118,33,176,0.12) 45%, rgba(215,226,234,0.03) 100%)',
            }}
          >
            <p
              className="font-light leading-relaxed text-[#D7E2EA]"
              style={{ fontSize: 'clamp(0.9rem, 1.7vw, 1.2rem)' }}
            >
              {project.summary}
            </p>

            <ul className="flex list-none flex-wrap gap-2">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-[#D7E2EA]/25 px-3 py-1.5 text-[0.65rem] font-light uppercase tracking-widest text-[#D7E2EA]/80 sm:text-xs"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-[40px] border border-[#D7E2EA]/12 p-6 sm:rounded-[50px] sm:p-8 md:w-[60%] md:rounded-[60px]"
            style={{ background: 'rgba(215, 226, 234, 0.04)' }}
          >
            <h4 className="mb-4 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-[#D7E2EA]/45 sm:text-xs">
              What I built
            </h4>
            <ul className="flex list-none flex-col gap-3">
              {project.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="relative pl-5 font-light leading-relaxed text-[#D7E2EA]/70"
                  style={{ fontSize: 'clamp(0.82rem, 1.5vw, 1.05rem)' }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[0.65em] h-1.5 w-1.5 rounded-full"
                    style={{ background: '#B600A8' }}
                  />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
