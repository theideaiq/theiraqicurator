/*
 * The taped samoon — the Iraqi Curator's mark: the original photograph, cut
 * out onto a transparent background (public/brand/samoon.png, 810×981).
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
  const img = (
    <img
      src="/brand/samoon.webp"
      alt={title}
      width={480}
      height={581}
      draggable={false}
      className={badge ? 'w-[66%] h-auto' : 'w-full h-full object-contain'}
    />
  );

  if (!badge) return <span className={`inline-block ${className}`}>{img}</span>;

  return (
    <span className={`inline-flex aspect-square items-center justify-center rounded-full bg-[#f4f2ee] border-[3px] border-ink ${className}`}>
      {img}
    </span>
  );
}
