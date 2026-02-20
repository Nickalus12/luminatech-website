import { useRef, useState } from 'react';
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
};

/* ── AnimatedCheckmark ────────────────────────────────────── */

function AnimatedCheckmark({ visible, size = 18 }: { visible: boolean; size?: number }) {
  const len = 20;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <motion.path
        d="M5 13l4 4L19 7"
        stroke="#10B981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        initial={{ strokeDashoffset: len }}
        animate={{ strokeDashoffset: visible ? 0 : len }}
        transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

/* ── MilestoneItem ────────────────────────────────────────── */

function MilestoneItem({
  milestone,
  phaseColor,
  index,
  reduced,
}: {
  milestone: Milestone;
  phaseColor: string;
  index: number;
  reduced: boolean | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : undefined}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group relative flex items-start gap-3 py-3"
    >
      {/* Status indicator */}
      <div className="relative shrink-0 mt-0.5">
        {milestone.status === 'completed' ? (
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${phaseColor}20` }}>
            <AnimatedCheckmark visible={!reduced && inView} size={14} />
          </div>
        ) : milestone.status === 'in-progress' ? (
          <div className="w-6 h-6 rounded-full flex items-center justify-center relative">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: phaseColor }}
              animate={reduced ? {} : { scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
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

  return (
    <div ref={ref} id={`phase-${phase.id}`} className="relative">
      {/* Connection line to next phase */}
      {index < total - 1 && (
        <div
          className="absolute left-[23px] top-[56px] w-[2px] hidden md:block"
          style={{
            bottom: -48,
            background: isCompleted
              ? `linear-gradient(to bottom, ${phase.color}60, ${phase.color}20)`
              : 'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
          }}
        />
      )}

      {/* Phase header row */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-start gap-4 mb-4 md:mb-6"
      >
        {/* Phase node on the beam */}
        <motion.div
          className="relative shrink-0 hidden md:flex"
          whileHover={reduced ? {} : { scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
            style={{
              background: isCompleted || isActive
                ? `linear-gradient(135deg, ${phase.color}30, ${phase.color}10)`
                : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${isCompleted || isActive ? phase.color + '40' : 'rgba(255,255,255,0.08)'}`,
              boxShadow: isActive ? `0 0 20px ${phase.color}20` : 'none',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isCompleted || isActive ? phase.color : 'rgba(255,255,255,0.25)'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={iconPath} />
            </svg>

            {/* Active pulse ring */}
            {isActive && !reduced && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ border: `1.5px solid ${phase.color}` }}
                animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </div>
        </motion.div>

        {/* Phase info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="text-[11px] font-mono font-bold tracking-wider"
              style={{ color: isCompleted || isActive ? phase.color : 'rgba(255,255,255,0.25)' }}
            >
              PHASE {String(phase.id).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-white/30 font-mono">{phase.timeframe}</span>
            {isCompleted && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${phase.color}15`, color: phase.color }}>
                COMPLETE
              </span>
            )}
            {isActive && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: `${phase.color}15`, color: phase.color }}>
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
        </div>
      </motion.div>

      {/* Milestones area */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={inView ? { opacity: 1 } : undefined}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="md:ml-16"
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
              transition={{ duration: 0.2 }}
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
                      {phase.milestones.filter(m => m.status === 'completed').length}/{phase.milestones.length}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: phase.color }}
                      initial={{ width: 0 }}
                      animate={inView ? {
                        width: `${(phase.milestones.filter(m => m.status === 'completed').length / phase.milestones.length) * 100}%`,
                      } : { width: 0 }}
                      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div className="divide-y divide-white/[0.04]">
                  {phase.milestones.map((m, i) => (
                    <MilestoneItem
                      key={m.title}
                      milestone={m}
                      phaseColor={phase.color}
                      index={i}
                      reduced={reduced}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ── JourneyProgress (scroll-linked top bar) ──────────────── */

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

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  // Map scroll progress to a gradient that shifts through phase colors
  const bgColor = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 0.75, 1],
    phases.map(p => p.color).concat(phases[phases.length - 1]?.color || '#F59E0B'),
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

/* ── ScrollBeam (vertical beam on desktop) ────────────────── */

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

  return (
    <div className="hidden md:block absolute left-[23px] top-0 bottom-0 w-[2px] pointer-events-none">
      {/* Track */}
      <div className="absolute inset-0 bg-white/[0.04] rounded-full" />

      {/* Filled portion */}
      {reduced ? (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(to bottom, ${phases.map(p => p.color).join(', ')})`,
          }}
        />
      ) : (
        <motion.div
          className="absolute top-0 left-0 right-0 rounded-full origin-top"
          style={{
            height: '100%',
            scaleY: smoothY,
            background: `linear-gradient(to bottom, ${phases.map(p => p.color).join(', ')})`,
            boxShadow: '0 0 8px rgba(99, 102, 241, 0.3)',
          }}
        />
      )}

      {/* Glow tip */}
      {!reduced && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
          style={{
            top: useTransform(smoothY, v => `calc(${v * 100}% - 6px)`),
            background: 'radial-gradient(circle, rgba(99,102,241,0.8), transparent)',
            boxShadow: '0 0 12px rgba(99,102,241,0.5)',
          }}
        />
      )}
    </div>
  );
}

/* ── PhaseCounter (sticky floating) ───────────────────────── */

function PhaseCounter({ phases }: { phases: Phase[] }) {
  const completed = phases.filter(p => p.status === 'completed').length;
  const total = phases.length;

  return (
    <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-3">
      {phases.map((phase, i) => (
        <a
          key={phase.id}
          href={`#phase-${phase.id}`}
          className="group relative flex items-center"
          title={phase.title}
        >
          <div
            className="w-2.5 h-2.5 rounded-full transition-all duration-300 group-hover:scale-150"
            style={{
              background: phase.status === 'completed'
                ? phase.color
                : phase.status === 'in-progress'
                  ? phase.color
                  : 'rgba(255,255,255,0.15)',
              boxShadow: phase.status === 'in-progress'
                ? `0 0 8px ${phase.color}60`
                : 'none',
            }}
          />
          {/* Tooltip */}
          <span className="absolute right-6 whitespace-nowrap text-[11px] text-white/60 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur px-2 py-1 rounded pointer-events-none">
            {phase.title}
          </span>
        </a>
      ))}
      <span className="text-[9px] font-mono text-white/20 mt-1">
        {completed}/{total}
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
      {/* Scroll-linked progress bar */}
      <JourneyProgress phases={phases} scrollRef={containerRef} reduced={reduced} />

      {/* Phase counter dots (right side) */}
      <PhaseCounter phases={phases} />

      {/* Main timeline */}
      <div className="relative pt-8 md:pt-12">
        {/* Vertical beam */}
        <ScrollBeam scrollRef={containerRef} phases={phases} reduced={reduced} />

        {/* Phase stations */}
        <div className="flex flex-col gap-16 md:gap-20">
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

      {/* Journey completion message */}
      <motion.div
        className="text-center mt-16 md:mt-20"
        initial={reduced ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
          <div className="flex -space-x-1">
            {phases.map((p) => (
              <div
                key={p.id}
                className="w-2 h-2 rounded-full ring-1 ring-black/50"
                style={{
                  background: p.status === 'completed' ? p.color : `${p.color}40`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-white/35 font-medium">
            {phases.filter(p => p.status === 'completed').length} of {phases.length} phases complete
          </span>
        </div>
      </motion.div>
    </div>
  );
}
