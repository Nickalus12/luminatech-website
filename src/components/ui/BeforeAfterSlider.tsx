import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';

interface SliderSide {
  label: string;
  value: string;
  description?: string;
}

interface BeforeAfterSliderProps {
  before: SliderSide;
  after: SliderSide;
  className?: string;
}

export default function BeforeAfterSlider({
  before,
  after,
  className = '',
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Raw position 0-100
  const rawPosition = useMotionValue(50);
  // Smoothed position for visual elements
  const smoothPosition = useSpring(rawPosition, {
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  });
  // Percentage string for CSS
  const beforeClip = useTransform(smoothPosition, (v) => `${v}%`);
  const afterClip = useTransform(smoothPosition, (v) => `${100 - v}%`);

  // Handle glow intensity based on drag state
  const handleScale = useSpring(1, { stiffness: 400, damping: 25 });
  const handleGlow = useSpring(0, { stiffness: 200, damping: 20 });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const getPositionFromEvent = useCallback(
    (clientX: number): number => {
      if (!containerRef.current) return 50;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = (x / rect.width) * 100;
      return Math.max(2, Math.min(98, pct));
    },
    [],
  );

  const startDrag = useCallback(
    (clientX: number) => {
      setIsDragging(true);
      setHasDragged(true);
      handleScale.set(1.2);
      handleGlow.set(1);
      const pos = getPositionFromEvent(clientX);
      rawPosition.set(pos);
    },
    [getPositionFromEvent, rawPosition, handleScale, handleGlow],
  );

  const moveDrag = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      const pos = getPositionFromEvent(clientX);
      rawPosition.set(pos);
    },
    [isDragging, getPositionFromEvent, rawPosition],
  );

  const endDrag = useCallback(() => {
    setIsDragging(false);
    handleScale.set(1);
    handleGlow.set(0);
  }, [handleScale, handleGlow]);

  // Pointer events for unified mouse + touch
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      startDrag(e.clientX);
    },
    [startDrag],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      moveDrag(e.clientX);
    },
    [moveDrag],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      endDrag();
    },
    [endDrag],
  );

  // Keyboard accessibility
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 2;
      const current = rawPosition.get();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        rawPosition.set(Math.max(2, current - step));
        setHasDragged(true);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        rawPosition.set(Math.min(98, current + step));
        setHasDragged(true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        rawPosition.set(2);
        setHasDragged(true);
      } else if (e.key === 'End') {
        e.preventDefault();
        rawPosition.set(98);
        setHasDragged(true);
      }
    },
    [rawPosition],
  );

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* Main comparison container */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border border-[var(--border)]"
        style={{
          background: 'var(--bg-surface-1)',
          boxShadow: '0 0 40px rgba(59,130,246,0.06), 0 8px 32px rgba(0,0,0,0.3)',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={endDrag}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          if (!isDragging) {
            handleScale.set(1);
            handleGlow.set(0);
          }
        }}
      >
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative h-72 md:h-80 lg:h-96">
          {/* ── BEFORE panel ── */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: useTransform(beforeClip, (v) => `inset(0 ${100 - parseFloat(v)}% 0 0)`) }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-error)]/[0.08] via-transparent to-[var(--accent-error)]/[0.04]" />
            {/* Diagonal lines pattern for "before" */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(-45deg, var(--accent-error), var(--accent-error) 1px, transparent 1px, transparent 16px)',
              }}
            />
            <div className="relative h-full flex flex-col items-center justify-center px-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-[var(--accent-error)]/10 text-[var(--accent-error)] border border-[var(--accent-error)]/20">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="8" cy="8" r="4" />
                  </svg>
                  {before.label}
                </span>
              </div>
              <div
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-3"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-error)',
                  textShadow: '0 0 30px rgba(248,113,113,0.2)',
                }}
              >
                {before.value}
              </div>
              {before.description && (
                <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-xs text-center leading-relaxed">
                  {before.description}
                </p>
              )}
            </div>
          </motion.div>

          {/* ── AFTER panel ── */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: useTransform(afterClip, (v) => `inset(0 0 0 ${100 - parseFloat(v)}%)`) }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-success)]/[0.08] via-transparent to-[var(--accent-success)]/[0.04]" />
            {/* Dot pattern for "after" - cleaner feel */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(var(--accent-success) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <div className="relative h-full flex flex-col items-center justify-center px-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-[var(--accent-success)]/10 text-[var(--accent-success)] border border-[var(--accent-success)]/20">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                  </svg>
                  {after.label}
                </span>
              </div>
              <div
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-3"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-success)',
                  textShadow: '0 0 30px rgba(16,185,129,0.2)',
                }}
              >
                {after.value}
              </div>
              {after.description && (
                <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-xs text-center leading-relaxed">
                  {after.description}
                </p>
              )}
            </div>
          </motion.div>

          {/* ── Divider line ── */}
          <motion.div
            className="absolute top-0 bottom-0 z-10 pointer-events-none"
            style={{ left: beforeClip }}
          >
            {/* Vertical line */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px]">
              <div className="h-full w-full bg-gradient-to-b from-transparent via-white/60 to-transparent" />
            </div>

            {/* Glow effect on line when active */}
            <motion.div
              className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px]"
              style={{
                opacity: handleGlow,
                boxShadow: '0 0 12px 4px rgba(59,130,246,0.4)',
                background: 'var(--accent-primary)',
              }}
            />

            {/* Handle */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              role="slider"
              aria-label="Before and after comparison slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(rawPosition.get())}
              tabIndex={0}
              onKeyDown={onKeyDown}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <motion.div
                className="relative"
                style={{ scale: handleScale }}
              >
                {/* Outer glow ring */}
                <motion.div
                  className="absolute -inset-2 rounded-full"
                  style={{
                    opacity: handleGlow,
                    background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
                  }}
                />

                {/* Handle body */}
                <div
                  className="relative w-11 h-11 rounded-full flex items-center justify-center border-2"
                  style={{
                    background: 'linear-gradient(135deg, var(--bg-surface-2) 0%, var(--bg-surface-1) 100%)',
                    borderColor: isDragging
                      ? 'var(--accent-primary)'
                      : isHovering
                        ? 'rgba(59,130,246,0.6)'
                        : 'rgba(255,255,255,0.25)',
                    boxShadow: isDragging
                      ? '0 0 20px rgba(59,130,246,0.4), 0 4px 12px rgba(0,0,0,0.4)'
                      : '0 2px 8px rgba(0,0,0,0.4)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                >
                  {/* Arrow icons */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke={isDragging ? 'var(--accent-primary)' : 'var(--text-secondary)'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transition: 'stroke 0.2s' }}
                  >
                    <path d="M6 7L3 10L6 13" />
                    <path d="M14 7L17 10L14 13" />
                  </svg>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Drag hint overlay */}
        <AnimatePresence>
          {!hasDragged && !prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="px-4 py-2 rounded-full text-xs font-medium border backdrop-blur-sm"
                style={{
                  background: 'rgba(18,18,26,0.85)',
                  borderColor: 'rgba(59,130,246,0.3)',
                  color: 'var(--text-secondary)',
                }}
                animate={{ x: [0, 8, -8, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: 'easeInOut',
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 7L3 10L6 13" />
                    <path d="M14 7L17 10L14 13" />
                  </svg>
                  Drag to compare
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom labels */}
      <div className="flex justify-between mt-3 px-1">
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--accent-error)', opacity: 0.7 }}
        >
          {before.label}
        </span>
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--accent-success)', opacity: 0.7 }}
        >
          {after.label}
        </span>
      </div>
    </div>
  );
}
