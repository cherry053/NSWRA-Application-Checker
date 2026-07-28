import FadeIn from '../components/FadeIn';
import { capabilities } from '../data/profile';

export default function CapabilitiesSection() {
  return (
    <section
      className="rounded-t-[40px] px-5 py-20 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
      style={{ background: '#FFFFFF' }}
    >
      <FadeIn as="h2" delay={0} y={40}>
        <span
          className="mb-16 block text-center font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28"
          style={{ color: '#0C0C0C', fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          What I Do
        </span>
      </FadeIn>

      <div className="mx-auto max-w-5xl">
        {capabilities.map((item, index) => (
          <FadeIn
            key={item.number}
            delay={index * 0.1}
            y={30}
            className="flex flex-col gap-4 border-t py-8 sm:py-10 md:flex-row md:gap-10 md:py-12"
            style={{ borderColor: 'rgba(12, 12, 12, 0.15)' }}
          >
            <span
              className="shrink-0 font-black leading-none"
              style={{ color: '#0C0C0C', fontSize: 'clamp(3rem, 10vw, 140px)' }}
            >
              {item.number}
            </span>

            <div className="flex flex-col gap-3">
              <h3
                className="font-medium uppercase leading-tight"
                style={{ color: '#0C0C0C', fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
              >
                {item.name}
              </h3>
              <p
                className="max-w-2xl font-light leading-relaxed"
                style={{
                  color: '#0C0C0C',
                  opacity: 0.6,
                  fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)',
                }}
              >
                {item.description}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
