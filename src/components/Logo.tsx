import { useId } from 'react';

/**
 * The taped samoon — the Iraqi Curator's mark. A diamond loaf of Iraqi bread
 * with a strip of grey duct tape slapped across it, as on the Instagram avatar.
 *
 * `badge` puts it on a round white sticker (avatar / favicon style).
 */
export function Logo({
  className = '',
  badge = false,
  title = 'The Iraqi Curator',
}: {
  className?: string;
  badge?: boolean;
  title?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const id = (name: string) => `${name}-${uid}`;

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <defs>
        <radialGradient id={id('crust')} cx="46%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#f2c27e" />
          <stop offset="38%" stopColor="#dd9a4f" />
          <stop offset="78%" stopColor="#b8692c" />
          <stop offset="100%" stopColor="#8d4a1c" />
        </radialGradient>
        <linearGradient id={id('tape')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9cccf" />
          <stop offset="45%" stopColor="#a9adb1" />
          <stop offset="100%" stopColor="#868a8f" />
        </linearGradient>
        <pattern id={id('weave')} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 2h4" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="0.8" />
          <path d="M2 0v4" stroke="#000000" strokeOpacity="0.06" strokeWidth="0.6" />
        </pattern>
        <filter id={id('shadow')} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#3b2410" floodOpacity="0.28" />
        </filter>
      </defs>

      {badge && <circle cx="100" cy="100" r="97" fill="#fbfaf7" stroke="#16130f" strokeWidth="4" />}

      <g transform={badge ? 'translate(100 102) scale(0.78) translate(-100 -100)' : undefined}>
        {/* the loaf: a puffed diamond with pinched points, tilted like the avatar */}
        <g transform="rotate(-38 100 100)">
          <path
            filter={`url(#${id('shadow')})`}
            fill={`url(#${id('crust')})`}
            stroke="#7a3f15"
            strokeWidth="1.5"
            d="M4 100 C 28 84, 48 40, 100 36 C 152 40, 172 84, 196 100 C 172 116, 152 160, 100 164 C 48 160, 28 116, 4 100 Z"
          />
          {/* soft top highlight */}
          <ellipse cx="92" cy="64" rx="44" ry="16" fill="#fff3d6" opacity="0.3" />
          {/* sesame seeds */}
          <g fill="#f6e3b4" stroke="#b7803f" strokeWidth="0.5">
            {[
              [84, 56, 20], [98, 52, -30], [112, 58, 60], [126, 64, -10], [70, 66, 40],
              [104, 68, 10], [140, 72, -50], [80, 134, 30], [96, 142, -20], [112, 136, 70],
              [128, 140, 15], [64, 128, -40], [144, 128, 45], [100, 128, 5],
            ].map(([x, y, r], i) => (
              <ellipse key={i} cx={x} cy={y} rx="3" ry="1.6" transform={`rotate(${r} ${x} ${y})`} />
            ))}
          </g>
        </g>

        {/* duct tape, slapped on at an angle with torn ends */}
        <g transform="rotate(28 100 100)">
          <path
            fill="#000"
            opacity="0.18"
            transform="translate(2 4)"
            d="M22 86 l4 3 -3 3 4 3 -3 3 4 3 -3 3 4 3 -3 3 L178 112 l-4 -3 3 -3 -4 -3 3 -3 -4 -3 3 -3 -4 -3 3 -3 Z"
          />
          <path
            fill={`url(#${id('tape')})`}
            d="M22 86 l4 3 -3 3 4 3 -3 3 4 3 -3 3 4 3 -3 3 L178 112 l-4 -3 3 -3 -4 -3 3 -3 -4 -3 3 -3 -4 -3 3 -3 Z"
          />
          <path
            fill={`url(#${id('weave')})`}
            d="M22 86 l4 3 -3 3 4 3 -3 3 4 3 -3 3 4 3 -3 3 L178 112 l-4 -3 3 -3 -4 -3 3 -3 -4 -3 3 -3 -4 -3 3 -3 Z"
          />
          {/* a crease and a glint */}
          <path d="M70 86 L74 112" stroke="#6f7378" strokeOpacity="0.45" strokeWidth="1" />
          <path d="M132 86 L127 112" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.2" />
          <path d="M30 89 H170" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  );
}
