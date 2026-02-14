import { useState, useRef, useCallback, type ReactNode } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  glowColor?: string;
  borderColor?: string;
  radius?: number;
  className?: string;
}

export default function SpotlightCard({
  children,
  glowColor = 'rgba(59, 130, 246, 0.15)',
  borderColor = 'rgba(59, 130, 246, 0.20)',
  radius = 350,
  className = '',
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative overflow-hidden rounded-xl border group ${className}`}
      style={{
        background: 'var(--color-bg-surface-1)',
        borderColor: isHovering ? borderColor : 'var(--color-border)',
        transition: 'border-color 0.3s ease',
      }}
    >
      {/* Cursor-following spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(${radius}px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 70%)`,
        }}
      />

      {/* Card content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
