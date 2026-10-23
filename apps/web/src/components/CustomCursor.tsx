'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * A soft follower that sits on top of the native cursor (which stays visible
 * for accessibility). Elements can set `data-cursor="label"` to make it
 * swell up and show a word.
 */
export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [label, setLabel] = useState<string | null>(null);
  const [interactive, setInteractive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || calm) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const labelled = target.closest<HTMLElement>('[data-cursor]');
      setLabel(labelled?.dataset.cursor ?? null);
      setInteractive(!!target.closest('a, button, input, textarea, select, [role="button"]'));
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
    };
  }, [x, y]);

  if (!enabled) return null;

  const size = label ? 88 : interactive ? 44 : 14;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center rounded-full bg-saffron text-ink mix-blend-multiply"
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
      animate={{ width: size, height: size, opacity: interactive || label ? 0.9 : 0.6 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {label && (
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-center leading-tight px-2">
          {label}
        </span>
      )}
    </motion.div>
  );
}
