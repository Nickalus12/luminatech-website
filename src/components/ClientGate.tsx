import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* -- Inject keyframes once (shared with KnowledgeHubGate) -- */
let stylesInjected = false;
function useGateStyles() {
  useEffect(() => {
    if (stylesInjected) return;
    stylesInjected = true;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes hub-siri-rotate {
        to { transform: rotate(360deg); }
      }
      @keyframes hub-pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1); }
        50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), 0 0 80px rgba(139, 92, 246, 0.2); }
      }
      @keyframes hub-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

/* -- What's inside content list -- */
const clientSections = [
  { icon: '{}', label: 'Code Snippets & SQL Patterns', color: '#3B82F6' },
  { icon: '\u26A1', label: 'N8N Automation Workflows', color: '#8B5CF6' },
  { icon: '\uD83D\uDD17', label: 'API Integration Guide', color: '#06B6D4' },
  { icon: '\uD83D\uDCCA', label: 'Performance Benchmarks', color: '#10B981' },
  { icon: '\uD83D\uDD27', label: 'Troubleshooting Resources', color: '#F87171' },
];

/* -- Modal card UI -- */
function ClientGateCard({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="relative rounded-2xl p-[2px] overflow-hidden"
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Rotating gradient border */}
      <div
        className="absolute"
        style={{
          inset: '-50%',
          background: 'conic-gradient(from 0deg, #3B82F6, #8B5CF6, #06B6D4, transparent 40%, #3B82F6)',
          animation: 'hub-siri-rotate 3s linear infinite',
          borderRadius: 'inherit',
        }}
        aria-hidden="true"
      />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ animation: 'hub-pulse-glow 3s ease-in-out infinite' }}
        aria-hidden="true"
      />

      {/* Inner card */}
      <div className="relative rounded-[14px] bg-[#0f1520] p-8 md:p-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-all duration-200 cursor-pointer"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </motion.div>

          <motion.h3
            className="text-2xl md:text-3xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Client-Exclusive Resources
          </motion.h3>
          <motion.p
            className="text-sm md:text-base leading-relaxed max-w-md mx-auto"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            These premium P21 resources are available exclusively to our consulting clients. Schedule a free consultation to learn how we can help optimize your ERP.
          </motion.p>
        </div>

        {/* What's inside grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          {clientSections.map((section, i) => (
            <motion.div
              key={section.label}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
            >
              <span className="text-sm shrink-0" style={{ filter: 'grayscale(0.3)' }}>{section.icon}</span>
              <span className="text-xs text-[#A0A0B0] leading-tight">{section.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA — link to /contact, not a form */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <motion.a
            href="/contact"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 no-underline cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
            }}
            whileHover={{ scale: 1.04, boxShadow: '0 6px 28px rgba(245, 158, 11, 0.45)' }}
            whileTap={{ scale: 0.97 }}
          >
            Schedule a Free Consultation
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </motion.a>

          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Or email us at{' '}
            <a
              href="mailto:Support@Lumina-ERP.com"
              className="text-[#3B82F6] hover:underline"
            >
              Support@Lumina-ERP.com
            </a>
          </p>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="mt-6 pt-5 flex items-center justify-center gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <div className="flex -space-x-2">
            {[
              { bg: '#3B82F6', letter: 'N' },
              { bg: '#8B5CF6', letter: 'M' },
              { bg: '#10B981', letter: 'A' },
              { bg: '#F59E0B', letter: 'J' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{
                  backgroundColor: item.bg,
                  boxShadow: '0 0 0 2px #0f1520',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
              >
                {item.letter}
              </motion.div>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Trusted by P21 teams at 50+ distributors
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ClientGate({ children }: { children?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useGateStyles();

  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for custom event to open modal
  useEffect(() => {
    function handleOpenGate() { openModal(); }
    document.addEventListener('open-client-gate', handleOpenGate);
    return () => document.removeEventListener('open-client-gate', handleOpenGate);
  }, [openModal]);

  // Close modal on Escape key
  useEffect(() => {
    if (!modalOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setModalOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [modalOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  // SSR-safe: show barrier before hydration
  if (!mounted) {
    return (
      <div>
        <div className="client-gate-barrier" />
        <div style={{ display: 'none' }}>{children}</div>
      </div>
    );
  }

  // Always locked — client-exclusive content never unlocks on the public site
  return (
    <>
      {/* Blurred content teaser */}
      <div className="relative">
        <div
          style={{
            maxHeight: '600px',
            overflow: 'hidden',
            filter: 'blur(5px)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          aria-hidden="true"
        >
          {children}
        </div>

        {/* Gradient fade overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(10, 10, 15, 0) 0%, rgba(10, 10, 15, 0.4) 30%, rgba(10, 10, 15, 0.85) 60%, rgba(10, 10, 15, 1) 85%)',
            cursor: 'pointer',
          }}
          onClick={openModal}
          role="button"
          tabIndex={0}
          aria-label="Click to learn about client-exclusive resources"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openModal(); }}
        />

        {/* Floating CTA — gold/amber accent */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: '80px' }}
        >
          <motion.button
            onClick={openModal}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-base cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              animation: 'hub-float 3s ease-in-out infinite',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.3), 0 0 60px rgba(217, 119, 6, 0.1)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Become a Client
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </motion.button>

          <p
            className="text-center mt-3 text-sm"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Exclusive to consulting clients
          </p>
        </div>
      </div>

      {/* Modal overlay */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              aria-hidden="true"
            />

            {/* Modal card */}
            <div className="relative w-full max-w-lg z-10">
              <ClientGateCard onClose={() => setModalOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
