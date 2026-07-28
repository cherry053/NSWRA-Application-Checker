import { useState } from 'react';

type PortraitProps = {
  src: string;
  alt: string;
  initials: string;
  className?: string;
};

/**
 * The hero portrait, given a "digitised" treatment: a magenta/violet glow
 * behind the subject, a soft gradient scrim at the base so the cut-out melts
 * into the page, and a faint scanline grid over the top.
 *
 * If the image file is missing the component falls back to a monogram card, so
 * the hero never renders a broken image.
 */
export default function Portrait({ src, alt, initials, className = '' }: PortraitProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[115%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(182, 0, 168, 0.32) 0%, rgba(118, 33, 176, 0.22) 38%, rgba(12, 12, 12, 0) 70%)',
        }}
      />

      <div className="relative overflow-hidden rounded-[36px]">
        {failed ? (
          <div
            className="flex aspect-[4/5] w-full items-center justify-center"
            style={{
              background:
                'linear-gradient(160deg, #1A0A24 0%, #2A0F3A 40%, #12121A 100%)',
              boxShadow: 'inset 0 0 80px rgba(182, 0, 168, 0.25)',
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <span
                className="hero-heading font-black uppercase tracking-tight"
                style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}
              >
                {initials}
              </span>
              <span className="px-6 text-center text-[0.6rem] font-light uppercase tracking-[0.25em] text-[#D7E2EA]/45 sm:text-xs">
                {alt}
              </span>
            </div>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            className="w-full select-none object-cover"
            draggable={false}
          />
        )}

        {/* Scanline grid — reads as a light "digitised" overlay. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(215, 226, 234, 0.5) 0px, rgba(215, 226, 234, 0.5) 1px, transparent 1px, transparent 4px)',
          }}
        />

        {/* Base scrim so the portrait fades into the page background. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4"
          style={{
            background: 'linear-gradient(180deg, rgba(12,12,12,0) 0%, #0C0C0C 100%)',
          }}
        />
      </div>
    </div>
  );
}
