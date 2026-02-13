import { useEffect, useRef, useState } from 'react';

interface Metric {
  value: string;
  label: string;
  suffix?: string;
}

interface MetricsGridProps {
  metrics: Metric[];
  className?: string;
}

export default function MetricsGrid({ metrics, className = '' }: MetricsGridProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${className}`}
    >
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`text-center transition-all duration-700 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary to-accent-violet blur-2xl opacity-20 scale-150"></div>
            <div className="relative text-5xl md:text-6xl font-mono font-bold bg-gradient-to-r from-accent-primary via-accent-violet to-accent-primary bg-clip-text text-transparent">
              {metric.value}{metric.suffix || ''}
            </div>
          </div>
          <p className="text-sm text-text-secondary mt-3">{metric.label}</p>
        </div>
      ))}
    </div>
  );
}
