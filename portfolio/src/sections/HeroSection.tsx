import ContactButton from '../components/ContactButton';
import FadeIn from '../components/FadeIn';
import FitText from '../components/FitText';
import Magnet from '../components/Magnet';
import Portrait from '../components/Portrait';
import { navLinks, profile } from '../data/profile';

export default function HeroSection() {
  return (
    <section
      className="relative flex h-screen flex-col"
      style={{ background: '#0C0C0C', overflowX: 'clip' }}
    >
      <FadeIn as="nav" delay={0} y={-20} className="relative z-20">
        <ul className="flex list-none justify-between px-6 pt-6 md:px-10 md:pt-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-sm font-medium uppercase tracking-wider text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 md:text-lg lg:text-[1.4rem]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </FadeIn>

      <div className="relative z-20 overflow-hidden px-2 md:px-4">
        <FadeIn as="h1" delay={0.15} y={40} className="mt-6 sm:mt-4 md:-mt-5">
          <FitText className="hero-heading font-black uppercase leading-none tracking-tight">
            {`Hi, i’m ${profile.firstName}`}
          </FitText>
        </FadeIn>
      </div>

      <div className="relative z-20 mt-auto flex items-end justify-between px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
        <FadeIn delay={0.35} y={20}>
          <p
            className="max-w-[160px] font-light uppercase leading-snug tracking-wide text-[#D7E2EA] sm:max-w-[220px] md:max-w-[260px]"
            style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          >
            {profile.tagline}
          </p>
        </FadeIn>

        <FadeIn delay={0.5} y={20}>
          <ContactButton />
        </FadeIn>
      </div>

      {/* Positioning lives on this plain wrapper: Framer Motion writes an
          inline `transform`, which would override Tailwind's translate
          utilities if they shared an element. */}
      <div className="absolute left-1/2 top-1/2 z-10 w-[280px] -translate-x-1/2 -translate-y-1/2 sm:top-auto sm:bottom-0 sm:w-[360px] sm:translate-y-0 md:w-[440px] lg:w-[520px]">
        <FadeIn delay={0.6} y={30}>
          <Magnet
            padding={150}
            strength={3}
            activeTransition="transform 0.3s ease-out"
            inactiveTransition="transform 0.6s ease-in-out"
          >
            <Portrait
              src={profile.portrait}
              alt={`${profile.fullName}, ${profile.role}`}
              initials="CS"
            />
          </Magnet>
        </FadeIn>
      </div>
    </section>
  );
}
