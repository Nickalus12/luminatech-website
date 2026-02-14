import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContactForm from './ContactForm';

type Phase = 'form' | 'celebration';

export default function ConsultationExperience() {
  const [phase, setPhase] = useState<Phase>('form');
  const [submittedName, setSubmittedName] = useState('');

  // Handle form success: transition to celebration phase
  function handleFormSuccess(name: string) {
    setSubmittedName(name);
    setPhase('celebration');
  }

  // Reset to form phase
  function handleBackToForm() {
    setPhase('form');
  }

  return (
    <AnimatePresence mode="wait">
      {/* ── FORM PHASE ── */}
      {phase === 'form' && (
        <motion.div
          key="form-phase"
          className="bg-bg-surface-1 border border-border rounded-xl p-6 md:p-8"
          exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.3 } }}
        >
          <ContactForm onSuccess={handleFormSuccess} />
        </motion.div>
      )}

      {/* ── CELEBRATION PHASE ── */}
      {phase === 'celebration' && (
        <motion.div
          key="celebration-phase"
          className="bg-bg-surface-1 border border-border rounded-xl p-6 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.4 } }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col items-center justify-center text-center py-12 px-4">
            {/* Animated checkmark with spring physics */}
            <div className="relative mx-auto w-24 h-24 mb-8">
              {/* Expanding glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-emerald-400/20"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.4, opacity: [0, 0.5, 0] }}
                transition={{
                  duration: 1.5,
                  ease: 'easeOut',
                  delay: 0.5,
                  repeat: 2,
                  repeatDelay: 0.8,
                }}
              />
              {/* Circle background with spring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/15 to-emerald-500/10 border-2 border-emerald-400/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, duration: 0.7 }}
              />
              {/* Checkmark SVG with path draw */}
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="absolute inset-0 w-full h-full p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.path
                  d="M20 6 9 17l-5-5"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    type: 'spring',
                    bounce: 0,
                    duration: 0.6,
                    delay: 0.4,
                  }}
                />
              </motion.svg>
            </div>

            {/* Personalized heading */}
            <motion.h3
              className="text-2xl md:text-3xl font-bold text-text-primary"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                bounce: 0.3,
                duration: 0.6,
                delay: 0.5,
              }}
            >
              Thanks, {submittedName}!
            </motion.h3>

            {/* Subtext */}
            <motion.p
              className="text-base text-text-secondary mt-3 max-w-sm leading-relaxed"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                bounce: 0.2,
                duration: 0.5,
                delay: 0.7,
              }}
            >
              We'll review your inquiry and respond within 24 hours.
            </motion.p>

            {/* Back to form link */}
            <motion.button
              onClick={handleBackToForm}
              className="mt-8 text-sm text-text-tertiary hover:text-accent-primary transition-colors cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              &larr; Send another message
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
