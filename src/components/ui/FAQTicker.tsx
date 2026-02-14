import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQTickerProps {
  items: FAQItem[];
  heading?: string;
}

// Chevron icon that rotates when open
function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-[var(--text-tertiary)]"
      aria-hidden="true"
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <path d="m6 9 6 6 6-6" />
    </motion.svg>
  );
}

// Single accordion item
function FAQAccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const itemId = `faq-item-${index}`;
  const answerId = `faq-answer-${index}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div
        className={`
          relative rounded-xl border transition-all duration-300
          ${isOpen
            ? 'bg-[var(--accent-primary)]/[0.04] border-[var(--accent-primary)]/25 shadow-[0_0_24px_rgba(59,130,246,0.06)]'
            : 'bg-[var(--bg-surface-1)] border-[var(--border)] hover:border-[var(--text-tertiary)]/40'
          }
        `}
      >
        {/* Glow accent bar on left edge */}
        <div
          className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full transition-all duration-300"
          style={{
            background: isOpen
              ? 'linear-gradient(180deg, var(--accent-primary), var(--accent-violet))'
              : 'transparent',
            boxShadow: isOpen
              ? '0 0 8px rgba(59, 130, 246, 0.4)'
              : 'none',
          }}
        />

        {/* Question button */}
        <button
          id={itemId}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={answerId}
          className="w-full flex items-center gap-4 px-5 py-4 md:px-6 md:py-5 text-left cursor-pointer group"
        >
          {/* Number badge */}
          <span
            className={`
              shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
              text-xs font-mono font-semibold transition-all duration-300
              ${isOpen
                ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
                : 'bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'
              }
            `}
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* Question text */}
          <span
            className={`
              flex-1 text-sm md:text-base font-medium leading-snug transition-colors duration-200
              ${isOpen
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
              }
            `}
          >
            {item.question}
          </span>

          <ChevronIcon isOpen={isOpen} />
        </button>

        {/* Answer panel */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={answerId}
              role="region"
              aria-labelledby={itemId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.25, delay: 0.08 },
              }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 md:px-6 md:pb-6 pl-[4.25rem] md:pl-[4.75rem]">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function FAQTicker({ items, heading = 'Common Questions' }: FAQTickerProps) {
  // First item open by default so the user sees the answer pattern
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="w-full py-10 md:py-16">
      {/* Section heading */}
      <div className="text-center mb-8 md:mb-10">
        <p className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--text-tertiary)] mb-3">
          {heading}
        </p>
        <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
          Got questions? We've got answers.
        </h2>
      </div>

      {/* Accordion items */}
      <div className="max-w-2xl mx-auto space-y-3">
        {items.map((item, i) => (
          <FAQAccordionItem
            key={i}
            item={item}
            index={i}
            isOpen={openIndex === i}
            onToggle={() => handleToggle(i)}
          />
        ))}
      </div>

      {/* Bottom note */}
      <motion.p
        className="text-center text-xs text-[var(--text-tertiary)] mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Have a different question?{' '}
        <a
          href="mailto:Support@Lumina-ERP.com"
          className="text-[var(--accent-primary)] hover:underline"
        >
          Reach out directly
        </a>
      </motion.p>
    </div>
  );
}
