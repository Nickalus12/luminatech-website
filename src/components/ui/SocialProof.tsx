import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import SpotlightCard from './SpotlightCard';

/* ── Types ─────────────────────────────────────────────────── */

interface StoryMetric {
  value: number;
  suffix: string;
  label: string;
}

interface Story {
  readonly metric: StoryMetric;
  readonly title: string;
  readonly problem: string;
  readonly solution: string;
  readonly result: string;
  readonly tech: readonly string[];
  readonly link?: { readonly label: string; readonly href: string };
  readonly accent: 'primary' | 'violet' | 'success';
}

interface SocialProofProps {
  heading: string;
  subheading: string;
  stories: readonly Story[];
}

/* ── Accent color map ──────────────────────────────────────── */

const accentMap = {
  primary: {
    text: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.08)',
    border: 'rgba(59, 130, 246, 0.20)',
    glow: 'rgba(59, 130, 246, 0.15)',
    stripe: 'linear-gradient(180deg, #3B82F6, #60A5FA)',
  },
  violet: {
    text: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.08)',
    border: 'rgba(139, 92, 246, 0.20)',
    glow: 'rgba(139, 92, 246, 0.15)',
    stripe: 'linear-gradient(180deg, #8B5CF6, #A78BFA)',
  },
  success: {
    text: '#10B981',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.20)',
    glow: 'rgba(16, 185, 129, 0.15)',
    stripe: 'linear-gradient(180deg, #10B981, #34D399)',
  },
};

/* ── Animated counter (scroll-triggered) ───────────────────── */

function AnimatedMetric({
  value,
  suffix,
  color,
  inView,
}: {
  value: number;
  suffix: string;
  color: string;
  inView: boolean;
}) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;

    const duration = 1800;
    const steps = 50;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      current += increment;
      step++;
      if (step >= steps) {
        setDisplay(String(value));
        clearInterval(timer);
      } else {
        setDisplay(String(Math.floor(current)));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span
      className="font-mono font-bold text-4xl md:text-5xl tracking-tight"
      style={{ color, textShadow: `0 0 30px ${color}33` }}
    >
      {display}
      {suffix}
    </span>
  );
}

/* ── Story card using SpotlightCard ────────────────────────── */

function StoryCard({
  story,
  index,
  inView,
}: {
  story: Story;
  index: number;
  inView: boolean;
}) {
  const colors = accentMap[story.accent];
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.5,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <SpotlightCard
        glowColor={colors.glow}
        borderColor={colors.border}
      >
        {/* Left accent stripe */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] z-20"
          style={{ background: colors.stripe }}
        />

        <div className="p-6 md:p-7">
        {/* Metric */}
        <div className="mb-1">
          <AnimatedMetric
            value={story.metric.value}
            suffix={story.metric.suffix}
            color={colors.text}
            inView={inView}
          />
        </div>
        <p
          className="text-xs font-medium uppercase tracking-widest mb-5"
          style={{ color: colors.text, opacity: 0.8 }}
        >
          {story.metric.label}
        </p>

        {/* Title */}
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-3">
          {story.title}
        </h3>

        {/* Problem */}
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
          <span className="font-medium text-[var(--text-primary)]">The challenge: </span>
          {story.problem}
        </p>

        {/* Solution (expandable on mobile) */}
        <div className="hidden sm:block">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            <span className="font-medium text-[var(--text-primary)]">Our approach: </span>
            {story.solution}
          </p>
        </div>

        {/* Mobile: show/hide solution */}
        <div className="sm:hidden">
          {expanded && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              <span className="font-medium text-[var(--text-primary)]">Our approach: </span>
              {story.solution}
            </p>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium mb-3 cursor-pointer"
            style={{ color: colors.text }}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        </div>

        {/* Result highlight */}
        <div
          className="rounded-lg px-4 py-3 mb-4 text-sm leading-relaxed"
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            color: 'var(--text-primary)',
          }}
        >
          <span className="font-medium" style={{ color: colors.text }}>
            Result:{' '}
          </span>
          {story.result}
        </div>

        {/* Tech pills + CTA */}
        <div className="flex flex-wrap items-center gap-2">
          {story.tech.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium"
              style={{
                background: colors.bg,
                color: colors.text,
              }}
            >
              {t}
            </span>
          ))}

          {story.link && (
            <a
              href={story.link.href}
              className="ml-auto inline-flex items-center gap-1 text-xs font-medium transition-all no-underline group/link"
              style={{ color: colors.text }}
            >
              {story.link.label}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover/link:translate-x-0.5"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      </div>
      </SpotlightCard>
    </motion.div>
  );
}

/* ── Main component ────────────────────────────────────────── */

export default function SocialProof({
  heading,
  subheading,
  stories,
}: SocialProofProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <div ref={sectionRef}>
      {/* Heading */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <motion.h2
          className="text-[length:var(--font-size-h2)] font-bold text-[var(--text-primary)] mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {heading}
        </motion.h2>
        <motion.p
          className="text-[length:var(--font-size-body-lg)] text-[var(--text-secondary)] leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {subheading}
        </motion.p>
      </div>

      {/* Story cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {stories.map((story, i) => (
          <StoryCard key={i} story={story} index={i} inView={isInView} />
        ))}
      </div>
    </div>
  );
}
