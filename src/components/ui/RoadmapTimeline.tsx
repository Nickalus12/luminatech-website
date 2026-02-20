import { useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useInView,
  useReducedMotion,
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

/* ── AnimatedCheck (SVG draw-on) ──────────────────────────── */

function AnimatedCheck({ animate }: { animate: boolean }) {
  const circleLen = 2 * Math.PI * 10; // ~62.83
  const checkLen = 16;
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <motion.circle
        cx="12" cy="12" r="10"
        stroke="#10B981" strokeWidth="2" fill="none"
        strokeDasharray={circleLen}
        initial={{ strokeDashoffset: circleLen }}
        animate={animate ? { strokeDashoffset: 0 } : { strokeDashoffset: circleLen }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      <motion.polyline
        points="8,12.5 11,15.5 16,9.5"
        stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
        strokeDasharray={checkLen}
        initial={{ strokeDashoffset: checkLen }}
        animate={animate ? { strokeDashoffset: 0 } : { strokeDashoffset: checkLen }}
        transition={{ duration: 0.35, delay: 0.4, ease: 'easeOut' }}
      />
    </svg>
  );
}

/* ── MilestoneCard (glass-morphism) ───────────────────────── */

function MilestoneCard({
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
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const statusIcon =
    milestone.status === 'completed' ? (
      <AnimatedCheck animate={!reduced && inView} />
    ) : milestone.status === 'in-progress' ? (
      <span className="relative flex" style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
        <span
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: phaseColor,
            opacity: 0.3,
            animation: reduced ? 'none' : 'ms-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
          }}
        />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: phaseColor, position: 'relative' }} />
      </span>
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" stroke="#6B6B7B" strokeWidth="1.5" fill="none" />
      </svg>
    );

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 24, filter: 'blur(6px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden"
      style={{
        background: 'rgba(18,18,26,0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(42,42,54,0.6)',
        borderRadius: 12,
        padding: '16px 18px',
        cursor: 'default',
        transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
      }}
      whileHover={
        reduced
          ? undefined
          : {
              y: -2,
              borderColor: `${phaseColor}66`,
              boxShadow: `0 4px 24px ${phaseColor}15, 0 0 0 1px ${phaseColor}20`,
            }
      }
    >
      <div className="flex items-start" style={{ gap: 12 }}>
        <div style={{ marginTop: 1 }}>{statusIcon}</div>
        <div className="min-w-0">
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#E8E8ED',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {milestone.title}
          </p>
          <p
            style={{
              fontSize: 12,
              color: '#A0A0B0',
              margin: '4px 0 0',
              lineHeight: 1.5,
            }}
          >
            {milestone.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── StatusBadge ──────────────────────────────────────────── */

function StatusBadge({ status }: { status: Status }) {
  const config = {
    completed: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: 'Completed' },
    'in-progress': { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: 'In Progress' },
    upcoming: { bg: 'rgba(107,107,123,0.12)', color: '#6B6B7B', label: 'Upcoming' },
  }[status];

  return (
    <span
      className="inline-flex items-center shrink-0"
      style={{
        background: config.bg,
        color: config.color,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.03em',
        padding: '4px 10px',
        borderRadius: 999,
        gap: 6,
        lineHeight: 1,
        textTransform: 'uppercase',
      }}
    >
      {status === 'completed' && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === 'in-progress' && (
        <span className="relative flex" style={{ width: 8, height: 8 }}>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: config.color,
              opacity: 0.6,
              animation: 'ms-pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
            }}
          />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: config.color, position: 'relative' }} />
        </span>
      )}
      {status === 'upcoming' && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )}
      {config.label}
    </span>
  );
}

/* ── PhaseSection ─────────────────────────────────────────── */

function PhaseSection({
  phase,
  reduced,
}: {
  phase: Phase;
  reduced: boolean | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const borderStyle =
    phase.status === 'completed'
      ? { borderLeft: `3px solid ${phase.color}`, boxShadow: `inset 4px 0 16px -4px ${phase.color}25` }
      : phase.status === 'in-progress'
        ? { borderLeft: `3px solid ${phase.color}` }
        : { borderLeft: '3px solid #2A2A36' };

  return (
    <motion.section
      ref={ref}
      id={`phase-${phase.id}`}
      initial={reduced ? false : { opacity: 0, y: 30, filter: 'blur(6px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden"
      style={{
        background: '#12121A',
        borderRadius: 16,
        padding: '32px 28px',
        ...borderStyle,
      }}
    >
      {/* Phase aura */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: '-40%',
          right: '-20%',
          width: '60%',
          height: '80%',
          background: `radial-gradient(ellipse at center, ${phase.color}08 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      {/* Phase number watermark */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: 16,
          right: 20,
          fontSize: 80,
          fontFamily: '"Geist Mono", monospace',
          fontWeight: 700,
          color: phase.color,
          opacity: 0.05,
          lineHeight: 1,
        }}
      >
        {String(phase.id).padStart(2, '0')}
      </div>

      {/* Header row */}
      <div className="relative" style={{ marginBottom: 16 }}>
        <div className="flex flex-wrap items-center" style={{ gap: 10, marginBottom: 8 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: '#E8E8ED',
              fontFamily: '"Inter Variable", Inter, sans-serif',
            }}
          >
            {phase.title}
          </h3>
          <StatusBadge status={phase.status} />
        </div>
        <span
          style={{
            display: 'inline-block',
            fontSize: 12,
            fontFamily: '"Geist Mono", monospace',
            color: '#A0A0B0',
            background: '#1A1A24',
            padding: '3px 10px',
            borderRadius: 6,
          }}
        >
          {phase.timeframe}
        </span>
      </div>

      {/* Description */}
      <p
        className="relative"
        style={{
          fontSize: 14,
          lineHeight: 1.65,
          color: '#A0A0B0',
          margin: '0 0 20px',
          maxWidth: 640,
        }}
      >
        {phase.description}
      </p>

      {/* Milestone grid */}
      <div
        className="relative grid gap-3"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
        }}
      >
        {phase.milestones.map((m, i) => (
          <MilestoneCard
            key={m.title}
            milestone={m}
            phaseColor={phase.color}
            index={i}
            reduced={reduced}
          />
        ))}
      </div>
    </motion.section>
  );
}

/* ── ScrollProgressLine ───────────────────────────────────── */

function ScrollProgressLine({
  scrollRef,
  reduced,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  reduced: boolean | null;
}) {
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start 0.35', 'end 0.85'],
  });
  const smoothY = useSpring(scrollYProgress, { stiffness: 50, damping: 18 });

  return (
    <div
      className="hidden md:block absolute"
      style={{
        top: 0,
        bottom: 0,
        left: 0,
        width: 3,
        background: '#1A1A24',
        borderRadius: 2,
      }}
    >
      {reduced ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 2,
            background: 'linear-gradient(to bottom, #10B981 0%, #3B82F6 33%, #8B5CF6 66%, #F59E0B 100%)',
          }}
        />
      ) : (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 2,
            background: 'linear-gradient(to bottom, #10B981 0%, #3B82F6 33%, #8B5CF6 66%, #F59E0B 100%)',
            transformOrigin: 'top',
            scaleY: smoothY,
            boxShadow: '0 0 10px rgba(59,130,246,0.25)',
          }}
        />
      )}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */

export default function RoadmapTimeline({ phases, className = '' }: RoadmapTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  return (
    <div ref={timelineRef} className={`relative ${className}`}>
      <ScrollProgressLine scrollRef={timelineRef} reduced={reduced} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 48,
          marginLeft: 0,
        }}
        className="md:ml-12"
      >
        {phases.map((phase) => (
          <PhaseSection key={phase.id} phase={phase} reduced={reduced} />
        ))}
      </div>

      <style>{`
        @keyframes ms-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
