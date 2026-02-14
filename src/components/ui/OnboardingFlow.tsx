import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

/* ── Step data ─────────────────────────────────────────────── */

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
}

const steps: Step[] = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.6 11.6 22 7v10l-6.4-4.5v-1Z" /><rect width="14" height="12" x="2" y="6" rx="2" />
      </svg>
    ),
    title: 'Discovery Call',
    description:
      'A free 30-minute video call to understand your P21 setup, pain points, and goals. We ask the right questions so you get honest, actionable feedback -- not a sales pitch.',
    accent: '#3B82F6',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title: 'Assessment',
    description:
      'We review your system, document findings, and deliver a clear scope with fixed pricing. You know exactly what you are getting and what it costs before any work begins.',
    accent: '#8B5CF6',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: 'Implementation',
    description:
      'We execute with regular check-ins and transparent progress updates. No hand-offs to junior staff -- you work directly with our lead consultant throughout.',
    accent: '#06B6D4',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m7 14 4-4 4 4 6-6" />
      </svg>
    ),
    title: 'Optimization',
    description:
      'After delivery, we stick around to ensure everything works in production. We tune, test, and document so your team can maintain it long-term.',
    accent: '#10B981',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: 'Ongoing Support',
    description:
      'Optional retainer plans keep a P21 expert on call. Monthly check-ins, proactive monitoring, and priority response when your system needs attention.',
    accent: '#F59E0B',
  },
];

/* ── Component ─────────────────────────────────────────────── */

export default function OnboardingFlow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const active = steps[activeIndex];

  return (
    <div ref={sectionRef}>
      {/* Section heading */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-text-tertiary)] mb-3">
          Our Process
        </p>
        <h2 className="text-[length:var(--font-size-h2)] font-bold text-[var(--color-text-primary)]">
          From First Call to Ongoing Results
        </h2>
      </motion.div>

      {/* ── Desktop: Horizontal timeline ── */}
      <div className="hidden md:block">
        {/* Step pills row */}
        <motion.div
          className="flex items-center justify-center gap-0 mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {steps.map((step, i) => {
            const isActive = activeIndex === i;
            const isPast = i < activeIndex;
            return (
              <div key={step.title} className="flex items-center">
                <button
                  onClick={() => setActiveIndex(i)}
                  className="relative flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer"
                  style={{
                    background: isActive ? `${step.accent}15` : 'transparent',
                    color: isActive
                      ? step.accent
                      : isPast
                        ? 'var(--color-text-secondary)'
                        : 'var(--color-text-tertiary)',
                    border: isActive
                      ? `1.5px solid ${step.accent}40`
                      : '1.5px solid transparent',
                  }}
                >
                  {/* Step number */}
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300"
                    style={{
                      background: isActive
                        ? step.accent
                        : isPast
                          ? 'var(--color-text-tertiary)'
                          : 'rgba(255,255,255,0.08)',
                      color: isActive || isPast ? '#fff' : 'var(--color-text-tertiary)',
                      boxShadow: isActive ? `0 0 10px ${step.accent}40` : 'none',
                    }}
                  >
                    {isPast ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  {step.title}
                </button>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="w-8 h-[2px] mx-1">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        background:
                          i < activeIndex
                            ? 'var(--color-text-tertiary)'
                            : 'rgba(255, 255, 255, 0.08)',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Active step detail card */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              className="rounded-xl p-6 md:p-8"
              style={{
                background: 'var(--color-bg-surface-1)',
                border: `1px solid ${active.accent}20`,
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
                  style={{
                    background: `${active.accent}15`,
                    color: active.accent,
                  }}
                >
                  {active.icon}
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {active.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {active.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Mobile: Vertical accordion ── */}
      <div className="md:hidden space-y-3">
        {steps.map((step, i) => {
          const isActive = activeIndex === i;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: 0.1 + i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <button
                onClick={() => setActiveIndex(i)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer"
                style={{
                  background: isActive
                    ? `${step.accent}10`
                    : 'var(--color-bg-surface-1)',
                  border: isActive
                    ? `1px solid ${step.accent}30`
                    : '1px solid var(--color-border)',
                }}
              >
                {/* Number badge */}
                <span
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: isActive ? step.accent : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#fff' : 'var(--color-text-tertiary)',
                  }}
                >
                  {i + 1}
                </span>

                <span
                  className="text-sm font-medium flex-1"
                  style={{
                    color: isActive
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-secondary)',
                  }}
                >
                  {step.title}
                </span>

                {/* Expand indicator */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 transition-transform duration-200"
                  style={{
                    color: isActive ? step.accent : 'var(--color-text-tertiary)',
                    transform: isActive ? 'rotate(180deg)' : 'rotate(0)',
                  }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pt-2 pb-4 pl-14">
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
