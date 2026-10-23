/** Big notebook-style title used at the top of inner pages. */
export function PageHeader({
  eyebrow,
  title,
  sub,
  accent = 'bg-saffron',
  children,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative paper-lines px-4 md:px-8 ps-[5.5rem] md:ps-[6.5rem] pt-32 pb-16 border-b-2 border-ink mb-16 overflow-hidden">
      <span className={`inline-block ${accent} border-2 border-ink px-3 py-1 font-mono text-xs uppercase -rotate-2`}>
        {eyebrow}
      </span>
      <h1 className="mt-6 font-display italic text-[16vw] md:text-[9vw] leading-[0.85]">{title}</h1>
      {sub && <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-ink/75">{sub}</p>}
      {children}
    </header>
  );
}
