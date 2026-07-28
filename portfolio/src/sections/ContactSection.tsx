import { Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import ContactButton from '../components/ContactButton';
import FadeIn from '../components/FadeIn';
import { profile } from '../data/profile';

const links = [
  {
    icon: Mail,
    label: profile.email,
    href: `mailto:${profile.email}`,
  },
  {
    icon: Phone,
    label: profile.phone,
    href: `tel:${profile.phone.replace(/\s/g, '')}`,
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: profile.linkedin,
  },
  {
    icon: Github,
    label: 'GitHub',
    href: profile.github,
  },
];

export default function ContactSection() {
  return (
    <footer
      id="contact"
      className="px-5 pb-12 pt-20 sm:px-8 sm:pt-24 md:px-10 md:pt-32"
      style={{ background: '#0C0C0C' }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 text-center sm:gap-14">
        <FadeIn as="h2" delay={0} y={40}>
          <span
            className="hero-heading block font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            Let&apos;s talk
          </span>
        </FadeIn>

        <FadeIn delay={0.1} y={30}>
          <p
            className="max-w-[560px] font-light leading-relaxed text-[#D7E2EA]/70"
            style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.25rem)' }}
          >
            Graduating 2027 and open to graduate roles and internships in cloud, AI/ML
            and full-stack engineering. If you are building something that has to work
            for real people, I would like to hear about it.
          </p>
        </FadeIn>

        <FadeIn delay={0.2} y={20}>
          <ContactButton label="Email Me" href={`mailto:${profile.email}`} />
        </FadeIn>

        <FadeIn delay={0.3} y={20} className="w-full">
          <ul className="flex list-none flex-wrap items-center justify-center gap-3">
            {links.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noreferrer noopener' : undefined}
                  className="inline-flex items-center gap-2.5 rounded-full border border-[#D7E2EA]/20 px-5 py-3 text-xs font-light uppercase tracking-widest text-[#D7E2EA]/75 transition-colors duration-200 hover:bg-[#D7E2EA]/10 sm:text-sm"
                >
                  <Icon size={16} strokeWidth={1.75} />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </FadeIn>

        <div className="mt-8 flex w-full flex-col items-center gap-3 border-t border-[#D7E2EA]/10 pt-8 sm:flex-row sm:justify-between">
          <span className="inline-flex items-center gap-2 text-xs font-light uppercase tracking-widest text-[#D7E2EA]/40">
            <MapPin size={14} strokeWidth={1.75} />
            {profile.location}
          </span>
          <span className="text-xs font-light uppercase tracking-widest text-[#D7E2EA]/40">
            © {new Date().getFullYear()} {profile.fullName}
          </span>
        </div>
      </div>
    </footer>
  );
}
