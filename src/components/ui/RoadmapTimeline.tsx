import { useState, useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';

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
  description: string;
  milestones: Milestone[];
}

interface RoadmapTimelineProps {
  phases: Phase[];
  className?: string;
}

/* ── Status Badge (phase-level) ──────────────────────────── */

function StatusBadge({ status }: { status: Status }) {
  if (status === 'completed') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Completed
      </span>
    );
  }
  if (status === 'in-progress') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}
      >
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: '#3B82F6', animation: 'pulse-ring 1.5s cubic-bezier(0.4,0,0.6,1) infinite' }}
          />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#3B82F6' }} />
        </span>
        In Progress
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: '#2a2a3a', color: '#6b7280' }}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      Upcoming
    </span>
  );
}

/* ── Milestone Status Dot ────────────────────────────────── */

function MilestoneDot({ status }: { status: Status }) {
  if (status === 'completed') {
    return (
      <span
        className="shrink-0 w-2.5 h-2.5 rounded-full mt-[5px]"
        style={{ background: '#10B981' }}
      />
    );
  }
  if (status === 'in-progress') {
    return (
      <span className="relative shrink-0 w-2.5 h-2.5 mt-[5px]">
        <span
          className="absolute inset-0 rounded-full opacity-40"
          style={{ background: '#3B82F6', animation: 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite' }}
        />
        <span className="relative block w-2.5 h-2.5 rounded-full" style={{ background: '#3B82F6' }} />
      </span>
    );
  }
  return (
    <span
      className="shrink-0 w-2.5 h-2.5 rounded-full mt-[5px]"
      style={{ border: '1.5px solid #6b7280' }}
    />
  );
}

/* ── Chevron Icon ────────────────────────────────────────── */

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="w-4 h-4 shrink-0 transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: '#6b7280' }}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/* ── Phase Node (on timeline line) ───────────────────────── */

function PhaseNode({ status, color }: { status: Status; color: string }) {
  if (status === 'completed') {
    return (
      <div
        className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center"
        style={{ background: color, boxShadow: `0 0 12px ${color}40` }}
      >
        <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === 'in-progress') {
    return (
      <div className="relative flex items-center justify-center">
        <span
          className="absolute w-10 h-10 md:w-11 md:h-11 rounded-full"
          style={{
            border: `2px solid ${color}`,
            opacity: 0.3,
            animation: 'node-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
          }}
        />
        <div
          className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center"
          style={{
            background: `${color}25`,
            border: `2px solid ${color}`,
            boxShadow: `0 0 16px ${color}30`,
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        </div>
      </div>
    );
  }
  return (
    <div
      className="w-7 h-7 md:w-8 md:h-8 rounded-full"
      style={{ border: '2px solid #2a2a3a', background: '#12121A' }}
    />
  );
}

/* ── Milestone List (per phase) ──────────────────────────── */

function MilestoneList({ milestones }: { milestones: Milestone[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="mt-4 space-y-1">
      {milestones.map((m, i) => {
        const isOpen = expanded === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : i)}
              className="w-full flex items-start gap-2.5 py-2 px-2 -mx-2 rounded-lg text-left transition-colors hover:bg-white/[0.03] cursor-pointer"
            >
              <MilestoneDot status={m.status} />
              <span
                className="flex-1 text-sm"
                style={{ color: m.status === 'upcoming' ? '#6b7280' : '#e5e5e5' }}
              >
                {m.title}
              </span>
              <ChevronIcon open={isOpen} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="text-xs pl-5 pr-2 pb-2" style={{ color: '#a1a1aa', lineHeight: 1.6 }}>
                    {m.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */

export default function RoadmapTimeline({ phases, className = '' }: RoadmapTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 0.4', 'end 0.8'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  return (
    <>
      {/* CSS keyframes for pulsing (avoids Framer overhead) */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes node-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>

      <div ref={timelineRef} className={`relative ${className}`}>
        {/* ── Vertical Progress Line ─────────────────────── */}
        <div
          className="absolute top-0 bottom-0 w-[2px] md:w-[3px]"
          style={{
            left: '16px',
            background: '#1a1a24',
          }}
        >
          {/* Filled portion — scroll-linked */}
          {!prefersReduced ? (
            <motion.div
              className="absolute top-0 left-0 w-full origin-top"
              style={{
                scaleY: smoothProgress,
                transformOrigin: 'top',
                height: '100%',
                background: 'linear-gradient(to bottom, #10B981 0%, #3B82F6 35%, #8B5CF6 65%, #F59E0B 100%)',
                boxShadow: '0 0 8px rgba(59,130,246,0.3)',
                borderRadius: '2px',
              }}
            />
          ) : (
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background: 'linear-gradient(to bottom, #10B981 0%, #3B82F6 35%, #8B5CF6 65%, #F59E0B 100%)',
                borderRadius: '2px',
              }}
            />
          )}
        </div>

        {/* ── Phase Cards ────────────────────────────────── */}
        <div className="relative space-y-12 md:space-y-16">
          {phases.map((phase, idx) => (
            <div key={phase.id} id={`phase-${phase.id}`} className="relative">
              {/* Phase node on the timeline line */}
              <div
                className="absolute z-10"
                style={{
                  left: '16px',
                  top: '28px',
                  transform: 'translate(-50%, 0)',
                }}
              >
                <PhaseNode status={phase.status} color={phase.color} />
              </div>

              {/* Phase card */}
              <motion.div
                initial={prefersReduced ? false : { opacity: 0, y: 40, filter: 'blur(4px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="ml-10 md:ml-16 rounded-xl p-6 md:p-8"
                style={{
                  background: '#12121A',
                  border: '1px solid #2a2a3a',
                  borderLeftWidth: '3px',
                  borderLeftColor: phase.color,
                }}
              >
                {/* Phase number watermark */}
                <div
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-5xl font-mono font-bold select-none pointer-events-none"
                  style={{ color: phase.color, opacity: 0.1 }}
                >
                  {String(phase.id).padStart(2, '0')}
                </div>

                {/* Header */}
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <h3 className="text-lg md:text-xl font-semibold" style={{ color: '#e5e5e5' }}>
                    {phase.title}
                  </h3>
                  <StatusBadge status={phase.status} />
                </div>

                {/* Timeframe */}
                <span
                  className="inline-block text-xs font-mono px-2 py-0.5 rounded mb-3"
                  style={{ background: '#1a1a24', color: '#a1a1aa' }}
                >
                  {phase.timeframe}
                </span>

                {/* Description */}
                <p className="text-sm leading-relaxed mb-2" style={{ color: '#a1a1aa' }}>
                  {phase.description}
                </p>

                {/* Milestones */}
                {phase.milestones.length > 0 && (
                  <MilestoneList milestones={phase.milestones} />
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
