import { useRef, useState, useMemo } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useInView,
  AnimatePresence,
} from 'framer-motion';

/* ── Types ────────────────────────────────────────────────── */

type Status = 'completed' | 'in-progress' | 'upcoming';

interface Milestone {
  title: string;
  status: Status;
  description: string;
}

interface Phase {
  id: number;
  title: string;
  timeframe: string;
  status: Status;
  color: string;
  icon: string;
  description: string;
  milestones: Milestone[];
}

interface RoadmapTimelineProps {
  phases: Phase[];
  className?: string;
}

/* ── Constants ────────────────────────────────────────────── */

const PHASE_ICONS: Record<string, string> = {
  foundation: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  authority: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  community: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  scale: 'M13 2L3 14h9l-1 8 10-12h-9l1-8',
  innovation:
    'M12 2a7 7 0 00-5 11.9V16h10v-2.1A7 7 0 0012 2zM9 18h6M10 22h4',
};

const SPRING_SMOOTH = { stiffness: 100, damping: 22 };
const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 300, damping: 20 };
const SPRING_DRAMATIC = { type: 'spring' as const, stiffness: 120, damping: 22, mass: 2 };

/* ── AnimatedCheckmark ────────────────────────────────────── */

function AnimatedCheckmark({ visible, size = 14 }: { visible: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <motion.path
        d="M5 13l4 4L19 7"
        stroke="#10B981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      />
    </svg>
  );
}

/* ── Atmosphere ─ scroll-driven background color shift ────── */

function Atmosphere({
  scrollRef,
  phases,
  reduced,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  phases: Phase[];
  reduced: boolean | null;
}) {
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'],
  });

  const stops = useMemo(() => {
    const n = phases.length;
    return phases.map((_, i) => i / (n - 1 || 1));
  }, [phases]);

  const glowColor = useTransform(
    scrollYProgress,
    stops,
    phases.map(p => p.color),
  );

  const glowOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.03, 0.07, 0.07, 0.03]),
    SPRING_SMOOTH,
  );

  const glowY = useSpring(
    useTransform(scrollYProgress, [0, 1], ['0%', '60%']),
    SPRING_SMOOTH,
  );

  if (reduced) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute -left-1/4 w-[150%] h-[40%] rounded-full"
        style={{
          top: glowY,
          background: useTransform(glowColor, c => `radial-gradient(ellipse at center, ${c}, transparent 70%)`),
          opacity: glowOpacity,
        }}
      />
    </div>
  );
}

/* ── JourneyProgress ─ scroll-linked top bar ──────────────── */

function JourneyProgress({
  phases,
  scrollRef,
  reduced,
}: {
  phases: Phase[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  reduced: boolean | null;
}) {
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, SPRING_SMOOTH);

  const stops = useMemo(() => {
    const n = phases.length;
    return phases.map((_, i) => i / (n - 1 || 1));
  }, [phases]);

  const bgColor = useTransform(
    smoothProgress,
    stops,
    phases.map(p => p.color),
  );

  return (
    <div className="sticky top-16 z-20 h-0.5 bg-white/[0.03]">
      <motion.div
        className="h-full origin-left"
        style={{
          scaleX: reduced ? 1 : smoothProgress,
          background: reduced
            ? `linear-gradient(to right, ${phases.map(p => p.color).join(', ')})`
            : bgColor,
        }}
      />
    </div>
  );
}

/* ── ScrollBeam ─ vertical SVG beam with draw-on effect ───── */

function ScrollBeam({
  scrollRef,
  phases,
  reduced,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  phases: Phase[];
  reduced: boolean | null;
}) {
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start 0.3', 'end 0.8'],
  });

  const smoothY = useSpring(scrollYProgress, { stiffness: 40, damping: 18 });

  const gradientStops = phases.map(p => p.color).join(', ');

  return (
    <div className="hidden md:block absolute left-[27px] top-0 bottom-0 w-[2px] pointer-events-none">
      {/* Track */}
      <div className="absolute inset-0 bg-white/[0.04] rounded-full" />

      {/* Filled beam */}
      {reduced ? (
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `linear-gradient(to bottom, ${gradientStops})` }}
        />
      ) : (
        <>
          <motion.div
            className="absolute top-0 left-0 right-0 rounded-full origin-top"
            style={{
              height: '100%',
              scaleY: smoothY,
              background: `linear-gradient(to bottom, ${gradientStops})`,
            }}
          />
          {/* Glow tip that travels down the beam */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-2 h-8 rounded-full"
            style={{
              top: useTransform(smoothY, v => `calc(${v * 100}% - 16px)`),
              background: useTransform(
                smoothY,
                phases.map((_, i) => i / (phases.length - 1 || 1)),
                phases.map(p => `radial-gradient(circle, ${p.color}cc, transparent)`),
              ),
              opacity: useTransform(smoothY, [0, 0.02, 0.98, 1], [0, 1, 1, 0]),
            }}
          />
        </>
      )}
    </div>
  );
}

/* ── MilestoneItem ────────────────────────────────────────── */

const milestoneContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.25 },
  },
};

const milestoneItemVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: SPRING_SNAPPY,
  },
};

function MilestoneItem({
  milestone,
  phaseColor,
  reduced,
}: {
  milestone: Milestone;
  phaseColor: string;
  reduced: boolean | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  return (
    <motion.div
      ref={ref}
      variants={reduced ? undefined : milestoneItemVariants}
      className="group relative flex items-start gap-3 py-3"
    >
      {/* Status indicator */}
      <div className="relative shrink-0 mt-0.5">
        {milestone.status === 'completed' ? (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: `${phaseColor}20` }}
          >
            <AnimatedCheckmark visible={!reduced && inView} />
          </div>
        ) : milestone.status === 'in-progress' ? (
          <div className="w-6 h-6 rounded-full flex items-center justify-center relative">
            {!reduced && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: phaseColor }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <div className="w-2.5 h-2.5 rounded-full relative" style={{ background: phaseColor }} />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-white/90 leading-snug mb-0.5">
          {milestone.title}
        </p>
        <p className="text-[12px] text-white/40 leading-relaxed">
          {milestone.description}
        </p>
      </div>
    </motion.div>
  );
}

/* ── PhaseStation ─────────────────────────────────────────── */

function PhaseStation({
  phase,
  index,
  total,
  reduced,
}: {
  phase: Phase;
  index: number;
  total: number;
  reduced: boolean | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [expanded, setExpanded] = useState(phase.status !== 'upcoming');

  const isCompleted = phase.status === 'completed';
  const isActive = phase.status === 'in-progress';
  const iconPath = PHASE_ICONS[phase.icon] || PHASE_ICONS.foundation;

  // Per-phase scroll tracking for entrance transform
  const stationRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stationScroll } = useScroll({
    target: stationRef,
    offset: ['start end', 'start 0.4'],
  });

  const stationY = useSpring(
    useTransform(stationScroll, [0, 1], [120, 0]),
    { stiffness: 100, damping: 30 },
  );
  const stationScale = useSpring(
    useTransform(stationScroll, [0, 1], [0.85, 1]),
    { stiffness: 100, damping: 30 },
  );
  const stationOpacity = useTransform(stationScroll, [0, 0.3], [0, 1]);

  // SVG ring progress for the phase icon
  const ringProgress = useSpring(
    useTransform(stationScroll, [0.2, 0.8], [0, 1]),
    { stiffness: 80, damping: 20 },
  );

  const completedCount = phase.milestones.filter(m => m.status === 'completed').length;
  const progressPct = (completedCount / phase.milestones.length) * 100;

  return (
    <motion.div
      ref={stationRef}
      id={`phase-${phase.id}`}
      className="relative"
      style={reduced ? {} : { y: stationY, scale: stationScale, opacity: stationOpacity }}
    >
      {/* Connection line to next phase */}
      {index < total - 1 && (
        <div
          className="absolute left-[27px] top-[64px] w-[2px] hidden md:block"
          style={{
            bottom: -48,
            background: isCompleted
              ? `linear-gradient(to bottom, ${phase.color}60, ${phase.color}20)`
              : 'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
          }}
        />
      )}

      {/* Phase header row */}
      <div ref={ref} className="flex items-start gap-4 mb-4 md:mb-6">
        {/* Phase node with SVG ring */}
        <motion.div
          className="relative shrink-0 hidden md:flex"
          whileHover={reduced ? {} : { scale: 1.1 }}
          transition={SPRING_SNAPPY}
        >
          {/* Ring that draws on scroll */}
          <svg
            className="absolute -inset-2"
            viewBox="0 0 64 64"
            fill="none"
            style={{ width: 64, height: 64 }}
          >
            <motion.circle
              cx="32"
              cy="32"
              r="29"
              stroke={isCompleted || isActive ? phase.color : 'rgba(255,255,255,0.08)'}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              style={{
                pathLength: reduced ? 1 : ringProgress,
                rotate: -90,
                transformOrigin: 'center',
              }}
              opacity={0.5}
            />
          </svg>

          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
            style={{
              background: isCompleted || isActive
                ? `linear-gradient(135deg, ${phase.color}30, ${phase.color}10)`
                : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${isCompleted || isActive ? phase.color + '40' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isCompleted || isActive ? phase.color : 'rgba(255,255,255,0.25)'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={iconPath} />
            </svg>

            {/* Active glow pulse */}
            {isActive && !reduced && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ border: `1.5px solid ${phase.color}`, boxShadow: `0 0 20px ${phase.color}25` }}
                animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </div>
        </motion.div>

        {/* Phase info */}
        <motion.div
          className="flex-1 min-w-0"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={SPRING_DRAMATIC}
        >
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="text-[11px] font-mono font-bold tracking-wider"
              style={{ color: isCompleted || isActive ? phase.color : 'rgba(255,255,255,0.25)' }}
            >
              PHASE {String(phase.id).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-white/30 font-mono">{phase.timeframe}</span>
            {isCompleted && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${phase.color}15`, color: phase.color }}
              >
                COMPLETE
              </span>
            )}
            {isActive && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: `${phase.color}15`, color: phase.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: phase.color }} />
                IN PROGRESS
              </span>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
            {phase.title}
          </h3>
          <p className="text-sm text-white/45 leading-relaxed max-w-xl">
            {phase.description}
          </p>
        </motion.div>
      </div>

      {/* Milestones area */}
      <motion.div
        className="md:ml-18"
        initial={reduced ? false : { opacity: 0 }}
        animate={inView ? { opacity: 1 } : undefined}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Expand/collapse for upcoming phases */}
        {phase.status === 'upcoming' && (
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="flex items-center gap-2 text-xs text-white/30 hover:text-white/50 transition-colors mb-2 py-1"
          >
            <motion.svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={SPRING_SNAPPY}
            >
              <polyline points="9 18 15 12 9 6" />
            </motion.svg>
            {expanded ? 'Hide' : 'Show'} {phase.milestones.length} milestones
          </button>
        )}

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div
                className="rounded-xl p-4 md:p-5"
                style={{
                  background: isCompleted || isActive
                    ? `linear-gradient(135deg, ${phase.color}06, transparent 60%)`
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isCompleted || isActive ? phase.color + '15' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Progress</span>
                    <span className="text-[10px] font-mono text-white/30">
                      {completedCount}/{phase.milestones.length}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: phase.color }}
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${progressPct}%` } : { width: 0 }}
                      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                {/* Milestones with staggered reveals */}
                <motion.div
                  className="divide-y divide-white/[0.04]"
                  variants={reduced ? undefined : milestoneContainerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  {phase.milestones.map((m) => (
                    <MilestoneItem
                      key={m.title}
                      milestone={m}
                      phaseColor={phase.color}
                      reduced={reduced}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ── PhaseCounter (sticky floating side nav) ──────────────── */

function PhaseCounter({ phases, reduced }: { phases: Phase[]; reduced: boolean | null }) {
  const completed = phases.filter(p => p.status === 'completed').length;

  return (
    <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-3">
      {phases.map((phase) => (
        <motion.a
          key={phase.id}
          href={`#phase-${phase.id}`}
          className="group relative flex items-center"
          title={phase.title}
          whileHover={reduced ? {} : { scale: 1.6 }}
          transition={SPRING_SNAPPY}
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: phase.status === 'completed' || phase.status === 'in-progress'
                ? phase.color
                : 'rgba(255,255,255,0.15)',
              boxShadow: phase.status === 'in-progress' ? `0 0 8px ${phase.color}60` : 'none',
            }}
          />
          {/* Tooltip */}
          <span className="absolute right-6 whitespace-nowrap text-[11px] text-white/60 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm px-2 py-1 rounded pointer-events-none">
            {phase.title}
          </span>
        </motion.a>
      ))}
      <span className="text-[9px] font-mono text-white/20 mt-1">
        {completed}/{phases.length}
      </span>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */

export default function RoadmapTimeline({ phases, className = '' }: RoadmapTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Atmospheric glow that shifts color as you scroll */}
      <Atmosphere scrollRef={containerRef} phases={phases} reduced={reduced} />

      {/* Scroll-linked progress bar */}
      <JourneyProgress phases={phases} scrollRef={containerRef} reduced={reduced} />

      {/* Phase counter dots (right side) */}
      <PhaseCounter phases={phases} reduced={reduced} />

      {/* Main timeline */}
      <div className="relative pt-8 md:pt-12">
        {/* Vertical beam with draw-on effect */}
        <ScrollBeam scrollRef={containerRef} phases={phases} reduced={reduced} />

        {/* Phase stations */}
        <div className="flex flex-col gap-16 md:gap-24">
          {phases.map((phase, i) => (
            <PhaseStation
              key={phase.id}
              phase={phase}
              index={i}
              total={phases.length}
              reduced={reduced}
            />
          ))}
        </div>
      </div>

      {/* Journey completion */}
      <motion.div
        className="text-center mt-16 md:mt-24"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={SPRING_DRAMATIC}
      >
        <div className="inline-flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/[0.05] bg-white/[0.015]">
            <div className="flex -space-x-1">
              {phases.map((p) => (
                <motion.div
                  key={p.id}
                  className="w-2.5 h-2.5 rounded-full ring-1 ring-black/50"
                  style={{ background: p.status === 'completed' ? p.color : `${p.color}30` }}
                  whileHover={reduced ? {} : { scale: 1.5 }}
                  transition={SPRING_SNAPPY}
                />
              ))}
            </div>
            <span className="text-xs text-white/30 font-medium">
              {phases.filter(p => p.status === 'completed').length} of {phases.length} phases complete
            </span>
          </div>
          <span className="text-[11px] text-white/15 font-mono">
            {phases.reduce((sum, p) => sum + p.milestones.filter(m => m.status === 'completed').length, 0)}/
            {phases.reduce((sum, p) => sum + p.milestones.length, 0)} milestones delivered
          </span>
        </div>
      </motion.div>
    </div>
  );
}
