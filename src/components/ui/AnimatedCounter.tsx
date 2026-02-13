import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: string;
  suffix?: string;
  gradient?: boolean;
  className?: string;
}

export default function AnimatedCounter({ value, suffix = '', gradient = false, className = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState('0');
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    const hasDecimal = value.includes('.');
    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      current += increment;
      step++;

      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        const displayNum = hasDecimal
          ? current.toFixed(1)
          : Math.floor(current).toString();
        setDisplayValue(displayNum + (value.includes('x') ? 'x' : ''));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  const textClass = gradient
    ? 'bg-gradient-to-r from-accent-primary via-accent-violet to-accent-primary bg-clip-text text-transparent'
    : 'text-accent-primary';

  return (
    <div ref={elementRef} className={`font-mono font-bold ${textClass} ${className}`}>
      {displayValue}{suffix}
    </div>
  );
}
