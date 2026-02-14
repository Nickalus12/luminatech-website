import { useEffect, useRef } from 'react';
import { useInView, useSpring, useTransform, motion } from 'framer-motion';

interface ScrollCounterProps {
  value: string;
  className?: string;
}

function parseValue(raw: string): { num: number; prefix: string; suffix: string } {
  const match = raw.match(/^([^0-9]*)([\d.]+)(.*)$/);
  if (!match) return { num: 0, prefix: '', suffix: raw };
  return { num: parseFloat(match[2]), prefix: match[1], suffix: match[3] };
}

export default function ScrollCounter({ value, className = '' }: ScrollCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const { num, prefix, suffix } = parseValue(value);

  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => {
    const rounded = num % 1 !== 0 ? v.toFixed(1) : Math.floor(v).toString();
    return `${prefix}${rounded}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      spring.set(num);
    }
  }, [isInView, num, spring]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
