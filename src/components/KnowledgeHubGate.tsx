import { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SUBSCRIBE_ENDPOINT = 'https://odoo-worker.nbrewer.workers.dev/api/subscribe';
const STORAGE_KEY = 'lumina_hub_unlocked';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ── Inject Siri glow keyframes once ── */
let stylesInjected = false;
function useSiriGlowStyles() {
  useEffect(() => {
    if (stylesInjected) return;
    stylesInjected = true;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes hub-siri-rotate {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

/* ── What's inside content list ── */
const gatedSections = [
  { icon: '{}', label: 'Code Snippets & SQL Patterns', color: '#3B82F6' },
  { icon: '⚡', label: 'N8N Automation Workflows', color: '#8B5CF6' },
  { icon: '🔗', label: 'API Integration Guide', color: '#06B6D4' },
  { icon: '📊', label: 'Performance Benchmarks', color: '#10B981' },
  { icon: '⚠️', label: 'Common Gotchas & Fixes', color: '#F59E0B' },
  { icon: '🔧', label: 'Troubleshooting Resources', color: '#F87171' },
];

export default function KnowledgeHubGate({ children }: { children?: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'returning' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useSiriGlowStyles();

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUnlocked(true);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch(SUBSCRIBE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'knowledge-hub-gate',
          sourcePage: '/resources',
        }),
      });
      const result = await response.json();
      if (result.success) {
        const isReturning = result.existing === true;
        setStatus(isReturning ? 'returning' : 'success');
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          email,
          unlockedAt: new Date().toISOString(),
        }));
        setTimeout(() => setUnlocked(true), isReturning ? 800 : 1200);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  // Before hydration — show the gate barrier (SSR-safe)
  if (!mounted) {
    return (
      <div>
        <div className="hub-gate-barrier" />
        <div style={{ display: 'none' }}>{children}</div>
      </div>
    );
  }

  // Unlocked — show content
  if (unlocked) {
    return (
      <motion.div
        id="hub-gated-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    );
  }

  // Locked — show prestigious gate card (NO blurred content behind)
  return (
    <div className="py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Siri glow wrapper */}
        <motion.div
          className="relative rounded-2xl p-[2px] overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
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
            style={{
              boxShadow: '0 0 40px rgba(59, 130, 246, 0.2), 0 0 80px rgba(139, 92, 246, 0.1)',
            }}
            aria-hidden="true"
          />

          {/* Inner card */}
          <div className="relative rounded-[14px] bg-[#0f1520] p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                Unlock the Full Knowledge Hub
              </motion.h3>
              <motion.p
                className="text-sm md:text-base leading-relaxed max-w-md mx-auto"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                Enter your email to get instant access to our exclusive P21 resources — used by top distributors daily.
              </motion.p>
            </div>

            {/* What's inside grid */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              {gatedSections.map((section, i) => (
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

            {/* Email form or success state */}
            <AnimatePresence mode="wait">
              {(status === 'success' || status === 'returning') ? (
                <motion.div
                  key="success"
                  className="text-center py-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ background: status === 'returning' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.15)' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={status === 'returning' ? '#3B82F6' : '#22c55e'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path
                        d="M20 6 9 17l-5-5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      />
                    </svg>
                  </motion.div>
                  <p className="text-lg font-semibold text-white">
                    {status === 'returning' ? 'Welcome back!' : "You're in!"}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {status === 'returning' ? 'You already have access. Loading now...' : 'Unlocking your resources now...'}
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 text-left">
                      <input
                        ref={inputRef}
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); if (status === 'error') setStatus('idle'); }}
                        className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: emailError ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                        aria-label="Email address"
                        aria-invalid={!!emailError}
                      />
                      {emailError && (
                        <motion.p
                          className="mt-1 text-xs text-red-400"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {emailError}
                        </motion.p>
                      )}
                    </div>
                    <motion.button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                      }}
                      whileHover={{ scale: 1.04, boxShadow: '0 6px 28px rgba(59, 130, 246, 0.45)' }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {status === 'submitting' ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Unlocking...
                        </>
                      ) : (
                        <>
                          Unlock Access
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                          </svg>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {status === 'error' && (
                    <motion.p
                      className="text-sm text-red-400"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Something went wrong. Please try again or email Support@Lumina-ERP.com.
                    </motion.p>
                  )}

                  <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    No spam, ever. Unsubscribe anytime.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>

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
      </div>
    </div>
  );
}
