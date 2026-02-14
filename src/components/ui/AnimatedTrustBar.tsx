import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * Animated trust bar metrics with scroll-triggered counting.
 * Reuses the AnimatedMetric pattern from SocialProof.tsx.
 */

interface Metric {
  value: string; // e.g. "150x", "280K", "140x"
  label: string;
}

function parseMetric(raw: string): { num: number; suffix: string } {
  const match = raw.match(/^([\d.]+)(.*)$/);
  if (!match) return { num: 0, suffix: raw };
  return { num: parseFloat(match[1]), suffix: match[2] };
}

function AnimatedValue({ raw, inView }: { raw: string; inView: boolean }) {
  const { num, suffix } = parseMetric(raw);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(String(num));
      return;
    }

    const duration = 1600;
    const steps = 40;
    const increment = num / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      current += increment;
      step++;
      if (step >= steps) {
        setDisplay(String(num));
        clearInterval(timer);
      } else {
        setDisplay(String(Math.floor(current)));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, num]);

  return (
    <span className="font-mono text-2xl font-bold text-[var(--color-accent-primary)]">
      {display}
      {suffix}
    </span>
  );
}

export default function AnimatedTrustBar({ metrics }: { metrics: readonly Metric[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div
      ref={ref}
      className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 md:gap-16"
    >
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex items-center gap-3 text-center sm:text-left"
        >
          <AnimatedValue raw={metric.value} inView={isInView} />
          <span className="text-[var(--color-text-secondary)] text-sm">
            {metric.label}
          </span>
        </div>
      ))}
    </div>
  );
}
