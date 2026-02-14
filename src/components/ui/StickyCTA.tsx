import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Sticky CTA bar that appears after scrolling past the hero section.
 * Glassmorphism design, dismissible (persists in sessionStorage).
 */
export default function StickyCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem('sticky-cta-dismissed') === '1') {
      setDismissed(true);
      return;
    }

    const threshold = 400;
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > threshold);
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Check initial position
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    sessionStorage.setItem('sticky-cta-dismissed', '1');
  }, []);

  const shouldShow = visible && !dismissed;

  // Respect reduced motion
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-[999] pointer-events-none"
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="pointer-events-auto mx-auto max-w-3xl px-4 pb-4 sm:pb-5"
          >
            <div
              className="relative flex items-center justify-between gap-3 sm:gap-4 rounded-xl px-4 sm:px-6 py-3"
              style={{
                background: 'rgba(10, 10, 18, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                boxShadow:
                  '0 -4px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.06)',
              }}
            >
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-white truncate">
                  Ready to optimize your P21?
                </p>
                <p className="text-xs text-white/50 hidden sm:block">
                  Free 30-min call. No contracts. No obligations.
                </p>
              </div>

              {/* CTA Button */}
              <a
                href="/contact"
                className="shrink-0 inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm font-semibold text-white no-underline transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  background: 'var(--color-accent-primary)',
                  boxShadow: '0 0 16px rgba(59, 130, 246, 0.3)',
                }}
              >
                Book a Free Consultation
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="hidden sm:block"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>

              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-white/30 hover:text-white/70 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                aria-label="Dismiss"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
