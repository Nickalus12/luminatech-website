import { useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';

export default function ChatPrompt() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const handleClick = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).Intercom) {
      (window as any).Intercom('showNewMessage', 'I have an ERP question: ');
    } else {
      window.location.href = '/contact';
    }
  }, []);

  return (
    <div ref={ref} className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          borderRadius: '16px',
        }}
        className="relative overflow-hidden px-6 py-5 md:px-8 md:py-6"
      >
        {/* Subtle corner glow */}
        <div
          className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <div
            className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <svg
              width="20"
              height="20"
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

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p
              className="text-sm md:text-base font-semibold mb-1"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Have a specific ERP question?
            </p>
            <p
              className="text-xs md:text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Ask us anything — we typically respond within 24 hours.
            </p>
          </div>

          {/* Button */}
          <motion.button
            onClick={handleClick}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
            style={{
              background: 'var(--color-accent-primary)',
              boxShadow: '0 0 16px rgba(59, 130, 246, 0.2)',
            }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(59, 130, 246, 0.35)' }}
            whileTap={{ scale: 0.97 }}
          >
            Chat With Us
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
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
