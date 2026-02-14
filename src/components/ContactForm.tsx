import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormData {
  name: string;
  company: string;
  email: string;
  helpType: string;
  message: string;
  _honeypot: string;
}

interface FormErrors {
  name?: string;
  company?: string;
  email?: string;
  helpType?: string;
}

const API_ENDPOINT = 'https://odoo-worker.nbrewer.workers.dev/api/contact';

const helpOptions = [
  'P21 Health Check / Audit',
  'Custom Business Rules',
  'Reporting & Analytics',
  'Cloud Migration Planning',
  'Integration Development',
  'Managed Support / Retainer',
  'Something Else',
];

const inputBase =
  'w-full bg-bg-surface-1 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-tertiary text-base transition-all duration-200 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:shadow-glow';

const inputError = 'border-accent-error focus:border-accent-error focus:ring-accent-error';

const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Frosted glass toast notification with enter/exit animation */
function Toast({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-4 right-4 sm:left-auto sm:top-6 sm:right-6 z-[9999] sm:max-w-sm pointer-events-auto"
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-primary via-accent-primary/60 to-transparent" />

        <div className="flex items-start gap-4">
          {/* Success icon with pulse ring */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              Message sent, {name}!
            </p>
            <p className="mt-1 text-xs text-white/60 leading-relaxed">
              We'll review your inquiry and respond within 24 hours.
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-white/40 hover:text-white/80 hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Dismiss notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    helpType: '',
    message: '',
    _honeypot: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submittedName, setSubmittedName] = useState('');
  const [showToast, setShowToast] = useState(false);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.company.trim()) errs.company = 'Company is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errs.email = 'Please enter a valid email';
    }
    if (!formData.helpType) errs.helpType = 'Please select an option';
    return errs;
  }

  function handleChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Honeypot check
    if (formData._honeypot) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company,
          email: formData.email,
          helpType: formData.helpType,
          message: formData.message,
          source: 'contact-form',
          sourcePage: window.location.pathname,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSubmittedName(formData.name.split(' ')[0]);
        setShowToast(true);
        setStatus('success');
        setFormData({ name: '', company: '', email: '', helpType: '', message: '', _honeypot: '' });
        setErrors({});

        // Auto-dismiss toast after 8 seconds
        setTimeout(() => setShowToast(false), 8000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      {/* Frosted toast notification */}
      <AnimatePresence>
        {showToast && (
          <Toast name={submittedName} onClose={() => setShowToast(false)} />
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Honeypot */}
        <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true">
          <label>
            Do not fill this out
            <input
              type="text"
              name="_honeypot"
              tabIndex={-1}
              autoComplete="off"
              value={formData._honeypot}
              onChange={(e) => handleChange('_honeypot', e.target.value)}
            />
          </label>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Name <span className="text-accent-error">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`${inputBase} ${errors.name ? inputError : ''}`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="mt-1.5 text-sm text-accent-error">{errors.name}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <label htmlFor="contact-company" className={labelClass}>
            Company <span className="text-accent-error">*</span>
          </label>
          <input
            id="contact-company"
            type="text"
            autoComplete="organization"
            placeholder="Your company"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className={`${inputBase} ${errors.company ? inputError : ''}`}
            aria-invalid={!!errors.company}
            aria-describedby={errors.company ? 'company-error' : undefined}
          />
          {errors.company && (
            <p id="company-error" role="alert" className="mt-1.5 text-sm text-accent-error">{errors.company}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email <span className="text-accent-error">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`${inputBase} ${errors.email ? inputError : ''}`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1.5 text-sm text-accent-error">{errors.email}</p>
          )}
        </div>

        {/* Service Interest */}
        <div>
          <label htmlFor="contact-help" className={labelClass}>
            How Can We Help? <span className="text-accent-error">*</span>
          </label>
          <select
            id="contact-help"
            value={formData.helpType}
            onChange={(e) => handleChange('helpType', e.target.value)}
            className={`${inputBase} ${!formData.helpType ? 'text-text-tertiary' : ''} ${errors.helpType ? inputError : ''} appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2716%27%20height%3D%2716%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%237A7A8A%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27m6%209%206%206%206-6%27%2F%3E%3C%2Fsvg%3E")] bg-no-repeat bg-[right_12px_center]`}
            aria-invalid={!!errors.helpType}
            aria-describedby={errors.helpType ? 'help-error' : undefined}
          >
            <option value="" disabled>Select a service...</option>
            {helpOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.helpType && (
            <p id="help-error" role="alert" className="mt-1.5 text-sm text-accent-error">{errors.helpType}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="contact-message" className={labelClass}>
            Tell Us More <span className="text-text-tertiary">(optional)</span>
          </label>
          <textarea
            id="contact-message"
            rows={4}
            placeholder="What's going on with your P21? The more context, the better we can help."
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            className={`${inputBase} resize-y min-h-[100px]`}
          />
        </div>

        {/* Error message */}
        {status === 'error' && (
          <div role="alert" className="bg-accent-error/10 border border-accent-error/30 rounded-lg p-4 text-sm text-accent-error animate-[fade-in_0.3s_ease-out]">
            Something went wrong. Please try again or email us directly at{' '}
            <a href="mailto:Support@Lumina-ERP.com" className="underline">
              Support@Lumina-ERP.com
            </a>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-accent-primary text-white text-base font-semibold rounded-lg hover:bg-accent-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none shadow-glow cursor-pointer"
        >
          {status === 'submitting' ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </>
          ) : status === 'success' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Sent Successfully
            </>
          ) : (
            <>
              Get My Free Assessment
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </button>
        <p className="text-center text-xs text-text-tertiary mt-3">
          Free 30-minute call. No contracts. No obligations.
        </p>
      </form>
    </>
  );
}
