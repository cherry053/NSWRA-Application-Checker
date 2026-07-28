import { GraduationCap } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import { education, experience } from '../data/profile';

export default function ExperienceSection() {
  return (
    <section
      id="experience"
      className="px-5 py-20 sm:px-8 sm:py-24 md:px-10 md:py-32"
      style={{ background: '#0C0C0C' }}
    >
      <FadeIn as="h2" delay={0} y={40}>
        <span
          className="hero-heading mb-16 block text-center font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Experience
        </span>
      </FadeIn>

      <div className="mx-auto max-w-5xl">
        {experience.map((job, index) => (
          <FadeIn
            key={job.company}
            delay={index * 0.1}
            y={30}
            className="border-t py-8 sm:py-10 md:py-12"
            style={{ borderColor: 'rgba(215, 226, 234, 0.18)' }}
          >
            <div className="flex flex-col gap-6 md:flex-row md:gap-10">
              <span
                className="hero-heading shrink-0 font-black leading-none"
                style={{ fontSize: 'clamp(2.5rem, 8vw, 110px)' }}
              >
                {job.number}
              </span>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <h3
                    className="font-medium uppercase leading-tight text-[#D7E2EA]"
                    style={{ fontSize: 'clamp(1rem, 2.2vw, 1.9rem)' }}
                  >
                    {job.role}
                  </h3>
                  <span className="shrink-0 text-xs font-light uppercase tracking-widest text-[#D7E2EA]/50 sm:text-sm">
                    {job.period}
                  </span>
                </div>

                <p className="text-sm font-light uppercase tracking-wider text-[#D7E2EA]/70 sm:text-base">
                  {job.company}
                </p>

                <ul className="mt-2 flex list-none flex-col gap-2.5">
                  {job.points.map((point) => (
                    <li
                      key={point}
                      className="relative pl-5 font-light leading-relaxed text-[#D7E2EA]/60"
                      style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.1rem)' }}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-[0.65em] h-1.5 w-1.5 rounded-full"
                        style={{ background: '#B600A8' }}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="mx-auto mt-20 max-w-5xl sm:mt-24">
        <FadeIn delay={0} y={30}>
          <h3 className="mb-8 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.3em] text-[#D7E2EA]/60">
            <GraduationCap size={20} strokeWidth={1.75} />
            Education
          </h3>
        </FadeIn>

        <div className="grid gap-4 md:grid-cols-2">
          {education.map((item, index) => (
            <FadeIn
              key={item.institution}
              delay={index * 0.1}
              y={30}
              className="rounded-3xl border border-[#D7E2EA]/15 p-6 sm:p-8"
              style={{
                background:
                  'linear-gradient(140deg, rgba(215,226,234,0.07) 0%, rgba(215,226,234,0.02) 100%)',
              }}
            >
              <span className="text-xs font-light uppercase tracking-widest text-[#D7E2EA]/50">
                {item.period}
              </span>
              <h4 className="mt-3 text-lg font-medium leading-snug text-[#D7E2EA] sm:text-xl">
                {item.qualification}
              </h4>
              <p className="mt-1 text-sm font-light uppercase tracking-wider text-[#D7E2EA]/70">
                {item.institution}
              </p>
              <p className="mt-4 text-sm font-light leading-relaxed text-[#D7E2EA]/60">
                {item.detail}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
