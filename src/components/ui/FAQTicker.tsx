import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQTickerProps {
  items: FAQItem[];
  heading?: string;
}

// Action links for specific questions — links to relevant pages
const questionCTAs: Record<string, { href: string; label: string }> = {
  'How do you price your services?': { href: '/services', label: 'View Our Services' },
  'What does a free consultation look like?': { href: '/contact#schedule', label: 'Book Your Free Call' },
  'Can you help with the Kinetic UI transition?': { href: '/services', label: 'Explore Migration Support' },
};

// Category tags for visual interest
const questionMeta: Record<string, { tag: string; color: string }> = {
  'What does a free consultation look like?': { tag: 'Discovery', color: '#3B82F6' },
  'Do you work on-site or remote?': { tag: 'Logistics', color: '#8B5CF6' },
  'How do you price your services?': { tag: 'Pricing', color: '#10B981' },
  'What if I\'m not sure what I need?': { tag: 'Getting Started', color: '#F59E0B' },
  'Can you help with the Kinetic UI transition?': { tag: 'Migration', color: '#06B6D4' },
};

export default function FAQTicker({ items, heading = 'Common Questions' }: FAQTickerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex];
  const cta = questionCTAs[activeItem?.question];
  const activeMeta = questionMeta[activeItem?.question];

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

      {/* ── Desktop: Split-panel dashboard ── */}
      <div className="hidden md:block max-w-4xl mx-auto">
        <div
          className="grid grid-cols-5 rounded-2xl overflow-hidden"
          style={{
            border: '1px solid rgba(59, 130, 246, 0.12)',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.04), 0 4px 24px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Question selector — left panel */}
          <div
            className="col-span-2 p-2"
            style={{ background: 'var(--color-bg-surface-1)' }}
          >
            {items.map((item, i) => {
              const meta = questionMeta[item.question];
              const isActive = activeIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer group relative"
                  style={{
                    background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
                  }}
                  aria-pressed={isActive}
                >
                  {/* Category tag */}
                  {meta && (
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-1.5 transition-opacity duration-200"
                      style={{
                        color: isActive ? meta.color : 'var(--color-text-tertiary)',
                        opacity: isActive ? 1 : 0.6,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          background: meta.color,
                          boxShadow: isActive ? `0 0 6px ${meta.color}` : 'none',
                        }}
                      />
                      {meta.tag}
                    </span>
                  )}
                  <span
                    className="block text-sm font-medium leading-snug transition-colors duration-200"
                    style={{
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {item.question}
                  </span>

                  {/* Hover glow overlay */}
                  {!isActive && (
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                      style={{ background: 'rgba(59, 130, 246, 0.03)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer panel — right side */}
          <div
            className="col-span-3 p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.95), rgba(10, 10, 18, 0.98))',
              borderLeft: '1px solid rgba(59, 130, 246, 0.08)',
            }}
          >
            {/* Decorative corner glow */}
            <div
              className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.06), transparent 70%)',
              }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                {/* Active category badge */}
                {activeMeta && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4"
                    style={{
                      background: `${activeMeta.color}15`,
                      color: activeMeta.color,
                      border: `1px solid ${activeMeta.color}30`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: activeMeta.color }}
                    />
                    {activeMeta.tag}
                  </span>
                )}

                {/* Question as heading */}
                <h4
                  className="text-lg font-semibold mb-4 leading-snug"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {activeItem.question}
                </h4>

                {/* Answer text */}
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {activeItem.answer}
                </p>

                {/* CTA button if applicable */}
                {cta && (
                  <motion.a
                    href={cta.href}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white no-underline transition-all duration-200"
                    style={{
                      background: 'var(--color-accent-primary)',
                      boxShadow: '0 0 16px rgba(59, 130, 246, 0.25)',
                    }}
                    whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(59, 130, 246, 0.4)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {cta.label}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </motion.a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Mobile: Horizontal pills + answer card ── */}
      <div className="md:hidden max-w-lg mx-auto px-1">
        {/* Scrolling question pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none -mx-1 px-1">
          {items.map((item, i) => {
            const meta = questionMeta[item.question];
            const isActive = activeIndex === i;
            return (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className="shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap"
                style={{
                  background: isActive
                    ? 'var(--color-accent-primary)'
                    : 'var(--color-bg-surface-1)',
                  color: isActive ? '#fff' : 'var(--color-text-secondary)',
                  border: isActive
                    ? '1px solid var(--color-accent-primary)'
                    : '1px solid var(--color-border)',
                  boxShadow: isActive ? '0 0 12px rgba(59, 130, 246, 0.3)' : 'none',
                }}
              >
                {meta ? meta.tag : `Q${i + 1}`}
              </button>
            );
          })}
        </div>

        {/* Answer card */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--color-bg-surface-1)',
            border: '1px solid var(--color-border)',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h4
                className="text-base font-semibold mb-3 leading-snug"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {activeItem.question}
              </h4>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {activeItem.answer}
              </p>
              {cta && (
                <a
                  href={cta.href}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white no-underline"
                  style={{
                    background: 'var(--color-accent-primary)',
                    boxShadow: '0 0 12px rgba(59, 130, 246, 0.2)',
                  }}
                >
                  {cta.label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom note */}
      <p className="text-center text-xs mt-8" style={{ color: 'var(--color-text-tertiary)' }}>
        Have a different question?{' '}
        <a
          href="mailto:Support@Lumina-ERP.com"
          className="hover:underline"
          style={{ color: 'var(--color-accent-primary)' }}
        >
          Reach out directly
        </a>
      </p>
    </div>
  );
}
