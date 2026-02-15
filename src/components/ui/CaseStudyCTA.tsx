import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface CaseStudyCTAProps {
  heading: string;
  subheading: string;
  emphasis?: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  variant?: 'full' | 'inline';
}

export default function CaseStudyCTA({
  heading,
  subheading,
  emphasis,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  variant = 'full',
}: CaseStudyCTAProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  if (variant === 'inline') {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-xl border p-6 md:p-8 text-center"
        style={{
          background: 'var(--color-bg-surface-1)',
          borderColor: 'rgba(59, 130, 246, 0.15)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.04) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {subheading}
          </p>
          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white no-underline transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'var(--color-accent-primary)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.25)',
            }}
          >
            {ctaLabel}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border"
      style={{
        background: 'var(--color-bg-surface-1)',
        borderColor: 'rgba(59, 130, 246, 0.12)',
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(139,92,246,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 p-8 md:p-12 lg:p-16 max-w-3xl mx-auto text-center">
        <motion.h3
          className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {heading}
        </motion.h3>

        <motion.p
          className="text-[var(--color-text-secondary)] leading-relaxed mb-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {subheading}
        </motion.p>

        {emphasis && (
          <motion.p
            className="text-[var(--color-text-primary)] font-medium mb-8 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {emphasis}
          </motion.p>
        )}

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-white no-underline transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'var(--color-accent-primary)',
              boxShadow: '0 0 24px rgba(59, 130, 246, 0.3)',
            }}
          >
            {ctaLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </a>

          {secondaryLabel && secondaryHref && (
            <a
              href={secondaryHref}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors no-underline"
            >
              {secondaryLabel}
            </a>
          )}
        </motion.div>

        <p className="text-xs text-[var(--color-text-tertiary)] mt-6">
          Free 30-minute call. No obligations. No sales pitch.
        </p>
      </div>
    </motion.div>
  );
}
