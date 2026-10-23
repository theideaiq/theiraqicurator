'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Image as DreiImage, Text, Float } from '@react-three/drei';
import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Howl } from 'howler';
import { useTranslations } from 'next-intl';
import type { Tables } from '@repo/supabase/types';
import { getSupabase } from '@/lib/supabase';

type Art = Tables<'artworks'>;

const hasPosition = (art: Art) => art.position_x != null && art.position_y != null && art.position_z != null;

/** Works without saved coordinates get hung on a ring around the visitor. */
function placement(art: Art, index: number, total: number): [number, number, number] {
  if (hasPosition(art)) return [art.position_x!, art.position_y!, art.position_z!];
  const angle = (index / Math.max(total, 1)) * Math.PI * 2;
  const radius = Math.max(6, total * 1.2);
  return [Math.sin(angle) * radius, (index % 2) * 0.6 - 0.3, -Math.cos(angle) * radius];
}

function Artwork({
  art,
  position,
  facing,
  selected,
  onSelect,
}: {
  art: Art;
  position: [number, number, number];
  facing: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHover] = useState(false);
  const lit = hovered || selected;
  return (
    <group
      position={position}
      rotation={[0, facing, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = '';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <Float speed={lit ? 0 : 1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        <DreiImage url={art.image_url} scale={lit ? [3.2, 3.2] : [3, 3]} transparent opacity={lit ? 1 : 0.92} />
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[3.4, 3.4, 0.1]} />
          <meshStandardMaterial color={lit ? '#f5b700' : '#f3ecdf'} />
        </mesh>
        <Text position={[0, -2.05, 0.1]} fontSize={0.18} color={lit ? '#f5b700' : '#f3ecdf'} anchorX="center" anchorY="middle" maxWidth={3.2}>
          {art.title.toUpperCase()}
        </Text>
      </Float>
    </group>
  );
}

export default function Museum() {
  const t = useTranslations('Museum');
  const [artworks, setArtworks] = useState<Art[] | null>(null);
  const [selected, setSelected] = useState<Art | null>(null);
  const [view, setView] = useState<'room' | 'index'>('room');
  const [playing, setPlaying] = useState(false);
  const sound = useRef<Howl | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setArtworks([]);
      return;
    }
    supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => setArtworks(data ?? []));
  }, []);

  const stopAudio = useCallback(() => {
    sound.current?.unload();
    sound.current = null;
    setPlaying(false);
  }, []);

  // one sound at a time, and silence when leaving the page
  useEffect(() => stopAudio, [stopAudio]);
  useEffect(() => {
    stopAudio();
    if (selected?.audio_url) {
      sound.current = new Howl({
        src: [selected.audio_url],
        html5: true,
        volume: 0.6,
        onend: () => setPlaying(false),
      });
      sound.current.play();
      setPlaying(true);
    }
  }, [selected, stopAudio]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleAudio = () => {
    if (!selected?.audio_url) return;
    if (playing) {
      sound.current?.pause();
      setPlaying(false);
    } else {
      sound.current?.play();
      setPlaying(true);
    }
  };

  const works = artworks ?? [];
  // Layouts saved from the dashboard are composed for a viewer standing back
  // at z=15; otherwise the visitor stands in the middle of a ring of works.
  const curated = works.length > 0 && works.every(hasPosition);

  return (
    <div className="relative w-full h-[100svh] pt-14 bg-[#0d1640] text-paper overflow-hidden">
      {/* top overlay */}
      <div className="absolute top-14 inset-x-0 z-20 flex items-start justify-between p-4 md:p-8 pointer-events-none">
        <div>
          <p className="font-mono text-xs uppercase text-saffron">{t('exhibition')}</p>
          <h1 className="font-display italic text-4xl md:text-6xl leading-none">{t('archive')}</h1>
        </div>
        <div role="tablist" className="pointer-events-auto flex rounded-full border-2 border-paper overflow-hidden font-mono text-xs uppercase">
          {(['room', 'index'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`px-4 py-2 ${view === v ? 'bg-paper text-ink' : 'hover:bg-paper/10'}`}
            >
              {t(v)}
            </button>
          ))}
        </div>
      </div>

      {artworks === null && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase text-saffron">{t('loading')}</div>
      )}

      {artworks !== null && works.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
          <img src="/logo-samoon.png" alt="" className="w-28 animate-wiggle" />
          <p className="font-display italic text-3xl md:text-4xl max-w-lg">{t('empty')}</p>
        </div>
      )}

      {view === 'room' && works.length > 0 && (
        <>
          <Suspense
            fallback={<div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase text-saffron">{t('loading')}</div>}
          >
            <Canvas camera={{ position: curated ? [0, 0, 15] : [0, 0, 0.1], fov: curated ? 45 : 60 }} onPointerMissed={() => setSelected(null)}>
              <color attach="background" args={['#0d1640']} />
              <fog attach="fog" args={['#0d1640', 12, 40]} />
              <ambientLight intensity={0.5} />
              <spotLight position={[0, 12, 0]} angle={0.9} penumbra={1} intensity={60} color="#f5b700" />
              {works.map((art, i) => (
                <Artwork
                  key={art.id}
                  art={art}
                  position={placement(art, i, works.length)}
                  facing={curated ? 0 : (() => {
                    const [x, , z] = placement(art, i, works.length);
                    return Math.atan2(x, z) + Math.PI;
                  })()}
                  selected={selected?.id === art.id}
                  onSelect={() => setSelected(art)}
                />
              ))}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
                <circleGeometry args={[60, 64]} />
                <meshStandardMaterial color="#09102e" />
              </mesh>
              {curated ? (
                <OrbitControls enablePan={false} maxDistance={25} minDistance={5} enableDamping dampingFactor={0.08} />
              ) : (
                <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={-0.35} enableDamping dampingFactor={0.08} />
              )}
              <Environment preset="night" />
            </Canvas>
          </Suspense>
          <p className="absolute bottom-6 inset-x-0 text-center font-mono text-[11px] uppercase text-paper/60 pointer-events-none">
            {t('hint')}
          </p>
        </>
      )}

      {view === 'index' && works.length > 0 && (
        <div className="absolute inset-0 top-40 overflow-y-auto px-4 md:px-8 pb-24">
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {works.map((art) => (
              <li key={art.id}>
                <button type="button" onClick={() => setSelected(art)} className="group block w-full text-start">
                  <span className="block aspect-square overflow-hidden border-2 border-paper bg-paper/5">
                    <img src={art.image_url} alt={art.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </span>
                  <span className="mt-2 block font-display text-xl leading-tight">{art.title}</span>
                  <span className="block font-mono text-[11px] uppercase text-paper/60">{art.artist}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* wall label */}
      <AnimatePresence>
        {selected && (
          <motion.aside
            key={selected.id}
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="absolute z-30 bottom-4 inset-x-4 md:inset-x-auto md:end-8 md:bottom-8 md:w-96 bg-paper text-ink border-2 border-ink hard-shadow p-6"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                {selected.is_featured && (
                  <span className="inline-block mb-2 px-2 py-0.5 bg-saffron border border-ink font-mono text-[10px] uppercase">★ {t('featured')}</span>
                )}
                <h2 className="font-display text-3xl leading-none">{selected.title}</h2>
                <p className="mt-1 font-mono text-xs uppercase text-ink/60">
                  {t('by')} {selected.artist}
                </p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="shrink-0 w-8 h-8 rounded-full border-2 border-ink hover:bg-saffron" aria-label={t('close')}>
                ✕
              </button>
            </div>
            {selected.description && <p dir="auto" className="mt-4 text-sm leading-relaxed max-h-40 overflow-y-auto">{selected.description}</p>}
            {selected.audio_url && (
              <button
                type="button"
                onClick={toggleAudio}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-ink text-paper rounded-full font-mono text-xs uppercase hover:bg-lapis"
              >
                <span className={playing ? 'animate-pulse' : ''}>{playing ? '❚❚' : '▶'}</span>
                {playing ? t('stop') : t('play')}
              </button>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
