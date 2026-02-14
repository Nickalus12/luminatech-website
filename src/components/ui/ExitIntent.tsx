import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'exit-shown';
const MOBILE_DELAY = 60_000; // 60 seconds

export default function ExitIntent() {
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
  }, []);

  useEffect(() => {
    // Don't show on contact page
    if (window.location.pathname.startsWith('/contact')) return;

    // Don't show if already dismissed this session
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === 'true') return;
    } catch {}

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let fired = false;

    function show() {
      if (fired) return;
      fired = true;
      setVisible(true);
    }

    // Desktop: mouse leaves viewport toward top
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 5) show();
    }

    // Mobile: inactivity timeout
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    let mobileTimer: ReturnType<typeof setTimeout> | undefined;

    if (isMobile) {
      mobileTimer = setTimeout(() => {
        if (document.visibilityState === 'visible') show();
      }, MOBILE_DELAY);
    } else {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (mobileTimer) clearTimeout(mobileTimer);
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!visible) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [visible, dismiss]);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slideIn = prefersReduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 20, x: 20 },
        animate: { opacity: 1, y: 0, x: 0 },
        exit: { opacity: 0, y: 10, x: 10 },
      };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="exit-intent"
          {...slideIn}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-[9990] w-[340px] max-w-[calc(100vw-3rem)]"
          role="dialog"
          aria-label="Before you go"
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(15, 15, 25, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              boxShadow:
                '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.06)',
            }}
          >
            {/* Left accent stripe */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{
                background:
                  'linear-gradient(180deg, #3B82F6, #8B5CF6)',
              }}
            />

            {/* Dismiss button */}
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-all duration-200 cursor-pointer"
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

            <div className="p-5 pl-6">
              {/* Icon + heading */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
                  </svg>
                </div>
                <div className="min-w-0 pr-6">
                  <p className="text-sm font-semibold text-white leading-snug">
                    Before you go — got a quick P21 question?
                  </p>
                </div>
              </div>

              <p
                className="text-xs leading-relaxed mb-4"
                style={{ color: 'rgba(255, 255, 255, 0.55)' }}
              >
                We respond within 24 hours. No sales pitch — just straight P21
                answers from practitioners who use it daily.
              </p>

              {/* CTA */}
              <motion.a
                href="/contact"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white no-underline cursor-pointer"
                style={{
                  background: 'var(--color-accent-primary)',
                  boxShadow: '0 0 16px rgba(59, 130, 246, 0.25)',
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: '0 0 24px rgba(59, 130, 246, 0.4)',
                }}
                whileTap={{ scale: 0.97 }}
              >
                Schedule a Free Call
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

              {/* Trust line */}
              <p
                className="text-center text-[10px] mt-3"
                style={{ color: 'rgba(255, 255, 255, 0.35)' }}
              >
                Free 30-min consultation — no obligations
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
