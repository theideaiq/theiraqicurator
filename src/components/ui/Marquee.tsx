/** Endless ticker. The track is forced LTR so the animation is identical in Arabic. */
export function Marquee({ items, className = '' }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6">{item}</span>
          <span className="text-brick">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`overflow-hidden font-mono text-sm uppercase ${className}`} dir="ltr">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
