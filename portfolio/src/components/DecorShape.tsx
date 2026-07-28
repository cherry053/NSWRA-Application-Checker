type ShapeName = 'sphere' | 'torus' | 'stack' | 'grid';

/**
 * Self-contained decorative "3D" objects for the About section. Drawn as inline
 * SVG with radial gradients rather than loaded as images, so the page has no
 * third-party asset dependency.
 */
export default function DecorShape({
  name,
  className = '',
}: {
  name: ShapeName;
  className?: string;
}) {
  const id = `decor-${name}`;

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <defs>
        <radialGradient id={`${id}-lit`} cx="35%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#E9F1F7" />
          <stop offset="45%" stopColor="#8E97A5" />
          <stop offset="100%" stopColor="#1B1B22" />
        </radialGradient>
        <linearGradient id={`${id}-neon`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B600A8" />
          <stop offset="55%" stopColor="#7621B0" />
          <stop offset="100%" stopColor="#BE4C00" />
        </linearGradient>
        <linearGradient id={`${id}-steel`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#BBCCD7" />
          <stop offset="100%" stopColor="#4A4F59" />
        </linearGradient>
      </defs>

      {name === 'sphere' && (
        <>
          <circle cx="100" cy="100" r="72" fill={`url(#${id}-lit)`} />
          <circle cx="74" cy="78" r="13" fill="#0C0C0C" opacity="0.28" />
          <circle cx="126" cy="118" r="20" fill="#0C0C0C" opacity="0.22" />
          <circle cx="96" cy="132" r="9" fill="#0C0C0C" opacity="0.25" />
          <circle
            cx="100"
            cy="100"
            r="86"
            fill="none"
            stroke={`url(#${id}-neon)`}
            strokeWidth="2"
            opacity="0.55"
          />
        </>
      )}

      {name === 'torus' && (
        <>
          <ellipse
            cx="100"
            cy="100"
            rx="76"
            ry="76"
            fill="none"
            stroke={`url(#${id}-steel)`}
            strokeWidth="30"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="76"
            ry="76"
            fill="none"
            stroke={`url(#${id}-neon)`}
            strokeWidth="6"
            opacity="0.85"
            strokeDasharray="120 360"
            transform="rotate(-38 100 100)"
          />
          <ellipse cx="100" cy="100" rx="46" ry="46" fill="#0C0C0C" />
        </>
      )}

      {name === 'stack' && (
        <>
          <polygon points="100,26 168,64 100,102 32,64" fill={`url(#${id}-steel)`} />
          <polygon points="32,64 100,102 100,168 32,130" fill="#3A3F49" />
          <polygon points="168,64 100,102 100,168 168,130" fill="#22262E" />
          <polygon
            points="100,26 168,64 100,102 32,64"
            fill="none"
            stroke={`url(#${id}-neon)`}
            strokeWidth="2.5"
          />
        </>
      )}

      {name === 'grid' && (
        <>
          <rect x="30" y="30" width="60" height="60" rx="14" fill={`url(#${id}-steel)`} />
          <rect x="110" y="30" width="60" height="60" rx="30" fill={`url(#${id}-neon)`} />
          <rect x="30" y="110" width="60" height="60" rx="30" fill="#2A2E36" />
          <rect
            x="110"
            y="110"
            width="60"
            height="60"
            rx="14"
            fill="none"
            stroke={`url(#${id}-steel)`}
            strokeWidth="4"
          />
        </>
      )}
    </svg>
  );
}
