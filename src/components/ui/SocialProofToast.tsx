import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Subtle social proof toast notifications that cycle through activity messages.
 * Shows in bottom-left corner, max 3 shows per page visit, then stops.
 * Respects reduced motion preferences.
 */

const messages = [
  {
    text: 'A distributor in Texas just booked a consultation',
    initials: 'DT',
    color: '#3B82F6',
  },
  {
    text: '12 businesses consulted this month',
    initials: '12',
    color: '#8B5CF6',
  },
  {
    text: 'New P21 health check completed for a plumbing wholesaler',
    initials: 'PW',
    color: '#10B981',
  },
  {
    text: 'A Gulf Coast distributor started a retainer plan',
    initials: 'GC',
    color: '#F59E0B',
  },
  {
    text: '3 business rules deployed this week',
    initials: '3R',
    color: '#06B6D4',
  },
];

export default function SocialProofToast() {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const showCount = useRef(0);
  const maxShows = 3;

  const showToast = useCallback(() => {
    if (showCount.current >= maxShows) return;

    // Don't show if StickyCTA or ExitIntent is visible
    const stickyCta = document.querySelector('[data-sticky-cta]');
    const exitIntent = document.querySelector('[data-exit-intent]');
    if (stickyCta || exitIntent) return;

    const idx = showCount.current % messages.length;
    setCurrentIndex(idx);
    setVisible(true);
    showCount.current++;

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setVisible(false);
    }, 5000);
  }, []);

  useEffect(() => {
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // First show after 8 seconds
    const firstTimer = setTimeout(() => {
      showToast();
    }, 8000);

    // Subsequent shows every 18 seconds (8s delay + 5s visible + 5s gap)
    const intervalTimer = setInterval(() => {
      showToast();
    }, 18000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(intervalTimer);
    };
  }, [showToast]);

  const msg = messages[currentIndex];

  return (
    <AnimatePresence>
      {visible && msg && (
        <motion.div
          className="fixed bottom-24 sm:bottom-6 left-4 z-[998] max-w-xs pointer-events-auto"
          initial={{ opacity: 0, y: 16, x: -8 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 10, x: -8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="relative flex items-center gap-3 rounded-xl px-4 py-3 pr-10"
            style={{
              background: 'rgba(15, 15, 25, 0.9)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderLeft: `3px solid ${msg.color}`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Avatar circle */}
            <div
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: msg.color + '30', color: msg.color }}
            >
              {msg.initials}
            </div>

            {/* Message text */}
            <p className="text-xs text-white/80 leading-snug">{msg.text}</p>

            {/* Close button */}
            <button
              onClick={() => setVisible(false)}
              className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full text-white/25 hover:text-white/60 transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            {/* Live indicator dot */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5">
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ backgroundColor: msg.color, opacity: 0.4 }}
              />
              <span
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: msg.color }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
