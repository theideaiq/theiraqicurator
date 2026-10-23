import { useId } from 'react';

/*
 * The taped samoon — the Iraqi Curator's mark, redrawn as a vector from the
 * Instagram avatar: an upright samoon with a strip of grey duct tape slapped
 * across it, rising to the right.
 *
 * `badge` puts it on a round white sticker (avatar / favicon style).
 */

// Silhouette of the loaf, traced from the avatar (viewBox 0 0 450 520).
const LOAF =
  'M228 34 C248 40 262 80 272 115 C284 160 318 215 332 265 C345 315 322 360 292 400 ' +
  'C268 432 240 470 218 492 C200 480 180 450 165 420 C145 385 112 340 102 300 ' +
  'C92 260 112 225 140 200 C168 175 185 140 198 95 C208 60 214 36 228 34 Z';

// Torn-ended tape strip, drawn horizontally then rotated into place.
const TAPE =
  'M30 248 L428 248 L435 256 L427 266 L436 276 L426 286 L435 296 L427 306 L434 316 L428 322 ' +
  'L30 322 L22 313 L31 302 L21 292 L31 282 L21 272 L30 262 L22 254 Z';

// Browned blisters on the crust: [cx, cy, rx, ry, rotate]
const BLISTERS: [number, number, number, number, number][] = [
  [228, 70, 9, 20, 10],
  [214, 130, 14, 8, -20],
  [246, 150, 18, 7, 30],
  [176, 190, 20, 9, -35],
  [150, 236, 14, 7, 20],
  [290, 330, 22, 8, -30],
  [160, 340, 16, 7, 40],
  [246, 372, 20, 8, 25],
  [200, 420, 14, 7, -40],
  [230, 450, 12, 6, 10],
  [300, 270, 10, 6, 0],
];

export function Logo({
  className = '',
  badge = false,
  title = 'The Iraqi Curator',
}: {
  className?: string;
  badge?: boolean;
  title?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  const mark = (
    <>
      {/* soft shadow on the table */}
      <path d={LOAF} fill="#3a2410" opacity="0.18" transform="translate(10 12)" filter={url('blur')} />

      {/* the loaf */}
      <path d={LOAF} fill={url('crust')} />
      <g clipPath={url('loaf-clip')}>
        <rect width="450" height="520" filter={url('crumb')} opacity="0.7" />
        {/* pale flour streaks between the browned bits */}
        <g stroke="#fbe6bd" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" fill="none" filter={url('soft')}>
          <path d="M236 52 C246 90 236 120 252 150" />
          <path d="M150 260 C180 250 196 228 230 230" />
          <path d="M170 380 C200 372 214 392 250 400" />
          <path d="M260 300 C280 296 300 304 318 290" />
        </g>
        <g fill="#8f4512" opacity="0.55" filter={url('bake')}>
          {BLISTERS.map(([cx, cy, rx, ry, r], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx * 1.8} ry={ry * 2.2} transform={`rotate(${r} ${cx} ${cy})`} />
          ))}
        </g>
        {/* pale flour along the left edge, toasted edge on the right */}
        <path d={LOAF} fill="none" stroke="#f6e2b8" strokeWidth="18" opacity="0.35" transform="translate(-6 0)" filter={url('soft')} />
        <path d={LOAF} fill="none" stroke="#9a551f" strokeWidth="14" opacity="0.35" transform="translate(8 4)" filter={url('soft')} />
      </g>
      <path d={LOAF} fill="none" stroke="#9a5a26" strokeOpacity="0.55" strokeWidth="2" />

      {/* the duct tape */}
      <g transform="rotate(-34 228 285)">
        <path d={TAPE} fill="#2b2b2b" opacity="0.22" transform="translate(4 9)" filter={url('soft')} />
        <path d={TAPE} fill={url('tape')} />
        <path d={TAPE} fill={url('ribs')} />
        {/* the crinkle where the tape bends over the loaf */}
        <path d="M198 248 L214 322 L234 322 L212 248 Z" fill="#ffffff" opacity="0.3" />
        <path d="M212 248 L234 322 L244 322 L222 248 Z" fill="#3c3f43" opacity="0.28" />
        <path d="M262 248 C256 280 268 300 262 322" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="4" fill="none" />
        <path d="M120 248 L128 322" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="3" />
        <path d="M30 251 H428" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" />
        <path d="M30 319 H432" stroke="#2f3236" strokeOpacity="0.3" strokeWidth="2" />
      </g>
    </>
  );

  return (
    <svg viewBox={badge ? '-35 -15 520 550' : '0 0 450 520'} className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <defs>
        <radialGradient id={id('crust')} cx="42%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#f6d08a" />
          <stop offset="40%" stopColor="#e7a957" />
          <stop offset="78%" stopColor="#cf8434" />
          <stop offset="100%" stopColor="#a85d20" />
        </radialGradient>
        <linearGradient id={id('tape')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b4b7bb" />
          <stop offset="50%" stopColor="#9a9ea3" />
          <stop offset="100%" stopColor="#7f8388" />
        </linearGradient>
        <pattern id={id('ribs')} width="5" height="80" patternUnits="userSpaceOnUse">
          <path d="M1 0 V80" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.2" />
          <path d="M3.5 0 V80" stroke="#000000" strokeOpacity="0.08" strokeWidth="1" />
        </pattern>
        <clipPath id={id('loaf-clip')}>
          <path d={LOAF} />
        </clipPath>
        <filter id={id('crumb')}>
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="7" />
          <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.3  0 0 0 0 0.1  0 0 0 1.1 -0.45" />
        </filter>
        <filter id={id('soft')} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id={id('bake')} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={id('blur')} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {badge && <circle cx="225" cy="260" r="258" fill="#f4f2ee" stroke="#16130f" strokeWidth="10" />}
      {badge ? <g transform="translate(225 262) scale(0.82) translate(-225 -262)">{mark}</g> : mark}
    </svg>
  );
}
