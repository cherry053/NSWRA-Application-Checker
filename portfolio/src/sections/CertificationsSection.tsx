import { BadgeCheck } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import { certifications } from '../data/profile';

export default function CertificationsSection() {
  return (
    <section
      className="px-5 py-20 sm:px-8 sm:py-24 md:px-10 md:py-32"
      style={{ background: '#0C0C0C' }}
    >
      <FadeIn as="h2" delay={0} y={40}>
        <span
          className="hero-heading mb-16 block text-center font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-24"
          style={{ fontSize: 'clamp(2.5rem, 10vw, 130px)' }}
        >
          Certifications
        </span>
      </FadeIn>

      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((cert, index) => (
          <FadeIn
            key={`${cert.issuer}-${cert.name}`}
            delay={(index % 3) * 0.1}
            y={30}
            className="flex flex-col gap-3 rounded-3xl border border-[#D7E2EA]/15 p-6 sm:p-7"
            style={{
              background:
                'linear-gradient(140deg, rgba(215,226,234,0.07) 0%, rgba(215,226,234,0.02) 100%)',
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="text-[0.65rem] font-light uppercase tracking-[0.25em] text-[#D7E2EA]/50">
                {cert.issuer}
              </span>
              <BadgeCheck size={20} strokeWidth={1.75} className="shrink-0 text-[#B600A8]" />
            </div>

            <h3 className="text-base font-medium leading-snug text-[#D7E2EA] sm:text-lg">
              {cert.name}
            </h3>

            {cert.detail && (
              <p className="text-sm font-light leading-relaxed text-[#D7E2EA]/55">
                {cert.detail}
              </p>
            )}

            <span className="mt-auto pt-2 text-xs font-light uppercase tracking-widest text-[#D7E2EA]/40">
              {cert.date}
            </span>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
