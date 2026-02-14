import { useState, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CONTACT_ENDPOINT = 'https://odoo-worker.nbrewer.workers.dev/api/contact';

// ── Question Data ───────────────────────────────────────────────

interface QuizOption {
  value: string;
  label: string;
  description: string;
}

interface QuizQuestion {
  id: string;
  title: string;
  subtitle: string;
  options: QuizOption[];
}

const questions: QuizQuestion[] = [
  {
    id: 'challenge',
    title: "What's your main challenge?",
    subtitle: 'Select the area where you need the most help',
    options: [
      { value: 'performance', label: 'Performance Issues', description: 'System slowdowns, timeouts, or slow reports' },
      { value: 'integration', label: 'Integration Needs', description: 'Connecting P21 with other systems' },
      { value: 'automation', label: 'Automation', description: 'Manual processes that should be automated' },
      { value: 'custom', label: 'Custom Development', description: 'Functionality P21 doesn\'t provide out-of-box' },
    ],
  },
  {
    id: 'size',
    title: 'How many P21 users do you have?',
    subtitle: 'This helps us gauge project complexity',
    options: [
      { value: 'small', label: '1-20 Users', description: 'Single location, small team' },
      { value: 'medium', label: '21-100 Users', description: '2-5 locations, growing operations' },
      { value: 'large', label: '100+ Users', description: 'Multiple locations, complex setup' },
      { value: 'enterprise', label: '500+ Users', description: 'Highly customized environment' },
    ],
  },
  {
    id: 'technical',
    title: 'What technical resources do you have?',
    subtitle: 'We tailor our delivery model to your team',
    options: [
      { value: 'dev-team', label: 'In-House Developers', description: 'Team that can handle implementation' },
      { value: 'it-staff', label: 'IT Staff (Non-Dev)', description: 'Technical but not developers' },
      { value: 'limited', label: 'Limited Technical', description: 'Mostly business users' },
      { value: 'none', label: 'No Technical Resources', description: 'Need fully managed solution' },
    ],
  },
  {
    id: 'timeline',
    title: 'How urgent is this?',
    subtitle: 'Helps us prioritize and plan the engagement',
    options: [
      { value: 'critical', label: 'Critical', description: 'Need a solution within 2 weeks' },
      { value: 'urgent', label: 'Urgent', description: 'Within 1-2 months' },
      { value: 'standard', label: 'Standard', description: '3-6 months is fine' },
      { value: 'flexible', label: 'Flexible', description: 'No rush, quality over speed' },
    ],
  },
  {
    id: 'budget',
    title: 'What\'s your budget range?',
    subtitle: 'We\'ll match you with the right scope',
    options: [
      { value: 'under-5k', label: 'Under $5K', description: 'Small project or specific task' },
      { value: '5k-15k', label: '$5K - $15K', description: 'Single service or integration' },
      { value: '15k-50k', label: '$15K - $50K', description: 'Major project or ongoing support' },
      { value: '50k-plus', label: '$50K+', description: 'Enterprise or multi-service' },
    ],
  },
];

// ── Scoring & Recommendation Engine ─────────────────────────────

// Maps to the 6 services in copy.ts
const serviceIds = ['extensions', 'integrations', 'database', 'warehouse', 'portals', 'support'] as const;

const serviceNames: Record<string, string> = {
  extensions: 'P21 Extensions & DynaChange',
  integrations: 'API Integration Services',
  database: 'Database Optimization',
  warehouse: 'Warehouse Automation',
  portals: 'Custom Portal Development',
  support: 'System Administration & Support',
};

const serviceDescriptions: Record<string, string> = {
  extensions: 'Custom business rules that automate workflows and enforce validation',
  integrations: 'Connect P21 to SellerCloud, e-commerce, and custom APIs',
  database: 'Make reports load 10-15x faster with query optimization',
  warehouse: 'Automate pick routing, bin allocation, and shipping workflows',
  portals: 'Customer-facing portals with live pricing and availability',
  support: 'Predictable monthly support with guaranteed response times',
};

function getRecommendation(answers: Record<string, string>): { primary: string; secondary: string; reason: string } {
  const scores: Record<string, number> = {};
  serviceIds.forEach(id => { scores[id] = 0; });

  // Challenge scoring (heaviest weight)
  switch (answers.challenge) {
    case 'performance':
      scores.database += 40; scores.support += 15; scores.extensions += 10;
      break;
    case 'integration':
      scores.integrations += 40; scores.portals += 15; scores.extensions += 10;
      break;
    case 'automation':
      scores.extensions += 35; scores.warehouse += 30; scores.integrations += 15;
      break;
    case 'custom':
      scores.extensions += 30; scores.portals += 30; scores.integrations += 15;
      break;
  }

  // Size scoring
  if (answers.size === 'small') {
    scores.database += 10; scores.support += 10;
  } else if (answers.size === 'medium') {
    scores.integrations += 10; scores.extensions += 10; scores.support += 5;
  } else {
    scores.warehouse += 10; scores.integrations += 10; scores.portals += 10;
  }

  // Technical scoring
  if (answers.technical === 'dev-team') {
    scores.extensions += 10; scores.integrations += 5;
  } else if (answers.technical === 'none' || answers.technical === 'limited') {
    scores.support += 15; scores.database += 5;
  }

  // Budget scoring
  if (answers.budget === 'under-5k') {
    scores.database += 10; scores.support += 10;
  } else if (answers.budget === '50k-plus') {
    scores.portals += 10; scores.integrations += 10;
  }

  // Timeline scoring
  if (answers.timeline === 'critical') {
    scores.database += 10; scores.support += 10;
  }

  // Sort by score
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1][0];

  // Generate reason
  const reasons: string[] = [];
  if (answers.challenge === 'performance') reasons.push('addresses your performance challenges directly');
  if (answers.challenge === 'integration') reasons.push('specializes in system connectivity');
  if (answers.challenge === 'automation') reasons.push('automates your manual workflows');
  if (answers.challenge === 'custom') reasons.push('delivers custom P21 functionality');
  if (answers.timeline === 'critical') reasons.push('can deliver within your urgent timeline');
  if (answers.technical === 'none') reasons.push('includes fully managed delivery');

  return {
    primary,
    secondary,
    reason: reasons.length > 0
      ? `This service ${reasons.join(' and ')}.`
      : 'Best overall fit based on your needs and constraints.',
  };
}

// ── Component ───────────────────────────────────────────────────

interface ServiceSelectorQuizProps {
  className?: string;
}

export default function ServiceSelectorQuiz({ className = '' }: ServiceSelectorQuizProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizEmail, setQuizEmail] = useState('');
  const [quizName, setQuizName] = useState('');
  const [quizCompany, setQuizCompany] = useState('');
  const [quizLeadStatus, setQuizLeadStatus] = useState<'idle' | 'submitting' | 'sent'>('idle');

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleSelect = useCallback((value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResults(true);
    }
  }, [answers, currentQuestion, step]);

  const handleBack = useCallback(() => {
    if (showResults) {
      setShowResults(false);
    } else if (step > 0) {
      setStep(step - 1);
    }
  }, [showResults, step]);

  const handleReset = useCallback(() => {
    setStep(0);
    setAnswers({});
    setShowResults(false);
  }, []);

  const recommendation = showResults ? getRecommendation(answers) : null;

  return (
    <div className={className}>
      {/* Collapsed trigger */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between gap-4 bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10 border border-[#3B82F6]/20 rounded-xl px-6 py-5 hover:border-[#3B82F6]/40 transition-all duration-200 group cursor-pointer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#3B82F6]/20 shrink-0">
              <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[#E8E8ED]">Not sure which service you need?</p>
              <p className="text-xs text-[#A0A0B0]">Take our 2-minute quiz to get a personalized recommendation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium text-[#3B82F6] group-hover:gap-3 transition-all">Start Quiz</span>
            <svg className="w-4 h-4 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>
      )}

      {/* Quiz panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#12121A] border border-[#2A2A36] rounded-xl overflow-hidden"
          >
            {/* Progress bar */}
            <div className="px-6 pt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#6B6B7B]">
                  {showResults ? 'Results' : `Step ${step + 1} of ${questions.length}`}
                </span>
                <button
                  onClick={() => { setIsOpen(false); handleReset(); }}
                  className="text-xs text-[#6B6B7B] hover:text-[#A0A0B0] transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="h-1 bg-[#2A2A36] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#3B82F6] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: showResults ? '100%' : `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {!showResults ? (
                  /* Question */
                  <motion.div
                    key={`q-${step}`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h3 className="text-lg font-semibold text-[#E8E8ED] mb-1">{currentQuestion.title}</h3>
                    <p className="text-sm text-[#A0A0B0] mb-6">{currentQuestion.subtitle}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentQuestion.options.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSelect(option.value)}
                          className={`text-left p-4 rounded-lg border transition-all duration-150 cursor-pointer ${
                            answers[currentQuestion.id] === option.value
                              ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                              : 'border-[#2A2A36] bg-[#1A1A24] hover:border-[#3B82F6]/40 hover:bg-[#1A1A24]'
                          }`}
                        >
                          <p className="text-sm font-semibold text-[#E8E8ED] mb-0.5">{option.label}</p>
                          <p className="text-xs text-[#A0A0B0]">{option.description}</p>
                        </button>
                      ))}
                    </div>

                    {step > 0 && (
                      <button
                        onClick={handleBack}
                        className="mt-4 flex items-center gap-1.5 text-sm text-[#6B6B7B] hover:text-[#A0A0B0] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                    )}
                  </motion.div>
                ) : (
                  /* Results */
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {recommendation && (
                      <div className="space-y-6">
                        <div>
                          <p className="text-xs text-[#3B82F6] font-semibold uppercase tracking-wider mb-2">Recommended For You</p>
                          <h3 className="text-xl font-bold text-[#E8E8ED] mb-2">{serviceNames[recommendation.primary]}</h3>
                          <p className="text-sm text-[#A0A0B0] leading-relaxed mb-3">{serviceDescriptions[recommendation.primary]}</p>
                          <p className="text-xs text-[#6B6B7B] italic">{recommendation.reason}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              const el = document.getElementById(recommendation.primary);
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                const btn = el.querySelector('button');
                                if (btn) setTimeout(() => btn.click(), 400);
                              }
                            }}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3B82F6] text-white text-sm font-semibold rounded-lg hover:bg-[#2563EB] transition-colors cursor-pointer"
                          >
                            View Service Details
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <a
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-[#2A2A36] text-[#A0A0B0] text-sm font-medium rounded-lg hover:border-[#3B82F6]/50 hover:text-[#E8E8ED] transition-colors"
                          >
                            Schedule Consultation
                          </a>
                        </div>

                        {/* Quick lead capture */}
                        {quizLeadStatus === 'sent' ? (
                          <div className="pt-4 border-t border-[#2A2A36] text-center">
                            <p className="text-sm text-[#10B981] font-medium">We'll follow up with a tailored proposal!</p>
                          </div>
                        ) : (
                          <div className="pt-4 border-t border-[#2A2A36]">
                            <p className="text-xs text-[#A0A0B0] mb-3">Want a tailored proposal? Drop your info:</p>
                            <form
                              onSubmit={async (e: FormEvent) => {
                                e.preventDefault();
                                if (!quizEmail || !quizName || !quizCompany) return;
                                setQuizLeadStatus('submitting');
                                try {
                                  await fetch(CONTACT_ENDPOINT, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      name: quizName,
                                      company: quizCompany,
                                      email: quizEmail,
                                      helpType: serviceNames[recommendation.primary],
                                      message: `Service Quiz Results:\n- Challenge: ${answers.challenge}\n- Size: ${answers.size}\n- Technical: ${answers.technical}\n- Timeline: ${answers.timeline}\n- Budget: ${answers.budget}\n- Recommended: ${serviceNames[recommendation.primary]}\n- Also Consider: ${serviceNames[recommendation.secondary]}`,
                                      source: 'service-quiz',
                                      sourcePage: window.location.pathname,
                                    }),
                                  });
                                  setQuizLeadStatus('sent');
                                } catch {
                                  setQuizLeadStatus('idle');
                                }
                              }}
                              className="flex flex-col gap-2"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input type="text" placeholder="Name" value={quizName} onChange={(e) => setQuizName(e.target.value)} required className="bg-[#1A1A24] border border-[#2A2A36] rounded-lg px-3 py-2 text-xs text-[#E8E8ED] placeholder-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]" />
                                <input type="email" placeholder="Email" value={quizEmail} onChange={(e) => setQuizEmail(e.target.value)} required className="bg-[#1A1A24] border border-[#2A2A36] rounded-lg px-3 py-2 text-xs text-[#E8E8ED] placeholder-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]" />
                                <input type="text" placeholder="Company" value={quizCompany} onChange={(e) => setQuizCompany(e.target.value)} required className="bg-[#1A1A24] border border-[#2A2A36] rounded-lg px-3 py-2 text-xs text-[#E8E8ED] placeholder-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]" />
                              </div>
                              <button type="submit" disabled={quizLeadStatus === 'submitting'} className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-semibold rounded-lg hover:bg-[#2563EB] transition-colors disabled:opacity-50 cursor-pointer">
                                {quizLeadStatus === 'submitting' ? 'Sending...' : 'Get My Proposal'}
                              </button>
                            </form>
                          </div>
                        )}

                        {/* Also Consider */}
                        <div className="pt-4 border-t border-[#2A2A36]">
                          <p className="text-xs text-[#6B6B7B] mb-2">Also worth exploring:</p>
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              const el = document.getElementById(recommendation.secondary);
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                const btn = el.querySelector('button');
                                if (btn) setTimeout(() => btn.click(), 400);
                              }
                            }}
                            className="text-sm text-[#3B82F6] hover:underline cursor-pointer"
                          >
                            {serviceNames[recommendation.secondary]}
                          </button>
                        </div>

                        <button
                          onClick={handleReset}
                          className="text-xs text-[#6B6B7B] hover:text-[#A0A0B0] transition-colors cursor-pointer"
                        >
                          Retake Quiz
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
