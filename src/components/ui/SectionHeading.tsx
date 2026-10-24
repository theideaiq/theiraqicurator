/** Numbered section header, like a chapter in a school textbook. */
export function SectionHeading({
  index,
  title,
  sub,
  tone = 'ink',
}: {
  index: string;
  title: string;
  sub?: string;
  tone?: 'ink' | 'paper';
}) {
  const muted = tone === 'paper' ? 'opacity-70' : 'text-ink/60';
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
      <h2 className="flex items-start gap-3 font-display text-6xl md:text-8xl leading-[0.9]">
        <span className="font-mono text-xs md:text-sm mt-2 px-2 py-0.5 border-2 border-current rounded-full not-italic">
          §{index}
        </span>
        <span className="italic">{title}</span>
      </h2>
      {sub && <p className={`max-w-sm text-sm leading-relaxed ${muted}`}>{sub}</p>}
    </div>
  );
}
