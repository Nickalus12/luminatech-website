import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQTickerProps {
  items: FAQItem[];
  heading?: string;
}

// Split items into two rows for dual-marquee effect
function splitItems(items: FAQItem[]): [FAQItem[], FAQItem[]] {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

// ── Single question chip ──────────────────────────────────────

function FAQChip({
  item,
  index,
  isActive,
  onActivate,
  onDeactivate,
}: {
  item: FAQItem;
  index: string;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const chipRef = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleClick = useCallback(() => {
    if (isMobile) {
      if (isActive) onDeactivate();
      else onActivate();
    }
  }, [isMobile, isActive, onActivate, onDeactivate]);

  return (
    <span className="relative inline-flex flex-col items-center shrink-0">
      <button
        ref={chipRef}
        onClick={handleClick}
        onMouseEnter={isMobile ? undefined : onActivate}
        onMouseLeave={isMobile ? undefined : onDeactivate}
        onFocus={onActivate}
        onBlur={onDeactivate}
        aria-expanded={isActive}
        aria-controls={`faq-answer-${index}`}
        className={`
          relative px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap
          border transition-all duration-200 cursor-pointer select-none
          ${isActive
            ? 'bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/60 text-[var(--text-primary)] shadow-[0_0_16px_rgba(59,130,246,0.25)]'
            : 'bg-[var(--bg-surface-2)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--text-primary)] hover:shadow-[0_0_12px_rgba(59,130,246,0.15)]'
          }
        `}
      >
        <span className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 opacity-50"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          {item.question}
        </span>
      </button>

      {/* Desktop: popover above */}
      {!isMobile && (
        <AnimatePresence>
          {isActive && (
            <motion.div
              id={`faq-answer-${index}`}
              role="tooltip"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50
                w-72 max-w-[85vw] px-4 py-3 rounded-xl
                bg-[var(--bg-surface-1)] border border-[var(--accent-primary)]/30
                shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.15)]
                text-sm text-[var(--text-secondary)] leading-relaxed pointer-events-none"
            >
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3
                bg-[var(--bg-surface-1)] border-r border-b border-[var(--accent-primary)]/30
                rotate-45" />
              {item.answer}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile: answer expands below */}
      {isMobile && (
        <AnimatePresence>
          {isActive && (
            <motion.div
              id={`faq-answer-${index}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden mt-2 w-64 max-w-[80vw]"
            >
              <div className="px-4 py-3 rounded-xl
                bg-[var(--bg-surface-1)] border border-[var(--accent-primary)]/20
                text-xs text-[var(--text-secondary)] leading-relaxed">
                {item.answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </span>
  );
}

// ── Marquee row ──────────────────────────────────────────────

function MarqueeRow({
  items,
  direction,
  speed,
  activeId,
  onActivate,
  onDeactivate,
  rowIndex,
}: {
  items: FAQItem[];
  direction: 'left' | 'right';
  speed: number;
  activeId: string | null;
  onActivate: (id: string) => void;
  onDeactivate: () => void;
  rowIndex: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPaused = activeId !== null;

  // Duplicate items 4x for seamless loop
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      aria-label={`FAQ questions row ${rowIndex + 1}`}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 z-10
        bg-gradient-to-r from-[var(--bg-base)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 z-10
        bg-gradient-to-l from-[var(--bg-base)] to-transparent" />

      <div
        className={`faq-marquee-track faq-marquee-${direction}`}
        style={{
          animationDuration: `${speed}s`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        <div className="flex gap-3 py-2">
          {repeated.map((item, i) => {
            const id = `${rowIndex}-${i}`;
            return (
              <FAQChip
                key={id}
                item={item}
                index={id}
                isActive={activeId === id}
                onActivate={() => onActivate(id)}
                onDeactivate={onDeactivate}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main ticker ─────────────────────────────────────────────

export default function FAQTicker({ items, heading = 'Quick Answers' }: FAQTickerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [row1, row2] = splitItems(items);

  const handleActivate = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const handleDeactivate = useCallback(() => {
    setActiveId(null);
  }, []);

  return (
    <div className="w-full py-8 md:py-12">
      {/* Heading */}
      <p className="text-center text-xs uppercase tracking-[0.2em] font-medium text-[var(--text-tertiary)] mb-6">
        {heading}
      </p>

      {/* Dual marquee rows */}
      <div className="space-y-3">
        <MarqueeRow
          items={row1}
          direction="left"
          speed={35}
          activeId={activeId}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          rowIndex={0}
        />
        <MarqueeRow
          items={row2}
          direction="right"
          speed={40}
          activeId={activeId}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          rowIndex={1}
        />
      </div>

      {/* Inline styles for CSS marquee animation — GPU-accelerated via translate3d */}
      <style>{`
        .faq-marquee-track {
          display: inline-flex;
          width: max-content;
          will-change: transform;
        }
        .faq-marquee-left {
          animation: faq-scroll-left linear infinite;
        }
        .faq-marquee-right {
          animation: faq-scroll-right linear infinite;
        }
        @keyframes faq-scroll-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes faq-scroll-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .faq-marquee-left,
          .faq-marquee-right {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
