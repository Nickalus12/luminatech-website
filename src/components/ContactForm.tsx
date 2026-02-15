import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  trackFieldFocus,
  trackFieldComplete,
  trackServiceSelect,
  trackLocationDetect,
  trackFormSubmit,
  trackFormValidationError,
} from '../lib/analytics';

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  helpType: string;
  message: string;
  _honeypot: string;
}

interface FormErrors {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  helpType?: string;
}

const API_ENDPOINT = 'https://odoo-worker.nbrewer.workers.dev/api/contact';

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN || '';

const helpOptions = [
  'P21 Health Check / Audit',
  'Custom Business Rules',
  'Reporting & Analytics',
  'Cloud Migration Planning',
  'Integration Development',
  'Managed Support / Retainer',
  'Something Else',
];

const CYCLING_NAMES = [
  'Sarah Mitchell',
  'James Chen',
  'Maria Rodriguez',
  'David Okafor',
  'Emma Larsson',
  'Amir Patel',
  'Olivia Thompson',
  'Kenji Nakamura',
  'Rachel Foster',
  'Carlos Mendoza',
  'Priya Sharma',
  'Lucas Weber',
];

const inputBase =
  'w-full bg-bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-tertiary text-base transition-all duration-200 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:shadow-glow hover:border-[rgba(59,130,246,0.3)]';

const inputError = 'border-accent-error focus:border-accent-error focus:ring-accent-error';

const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]);

function validateLocation(location: string): boolean {
  const trimmed = location.trim();
  if (!trimmed.includes(',')) return false;
  const parts = trimmed.split(',').map((p) => p.trim());
  if (parts.length < 2) return false;
  const city = parts[0];
  const state = parts[parts.length - 1].toUpperCase();
  // City must be at least 2 chars, state must be a valid US abbreviation or full state name (2+ chars)
  return city.length >= 2 && (US_STATES.has(state) || state.length >= 2);
}

/* Shake animation for invalid fields */
const shakeVariants = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

/* ── Cycling Name Placeholder Hook ── */
function useCyclingPlaceholder(names: string[], isFocused: boolean, hasValue: boolean) {
  const [displayText, setDisplayText] = useState('');
  const [nameIndex, setNameIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isFocused || hasValue) return;

    const currentName = names[nameIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(pauseTimer);
    }

    if (!isDeleting) {
      // Typing forward
      if (charIndex < currentName.length) {
        const timer = setTimeout(() => {
          setDisplayText(currentName.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, 60 + Math.random() * 40);
        return () => clearTimeout(timer);
      } else {
        // Finished typing - pause before deleting
        setIsPaused(true);
      }
    } else {
      // Deleting
      if (charIndex > 0) {
        const timer = setTimeout(() => {
          setCharIndex((c) => c - 1);
          setDisplayText(currentName.slice(0, charIndex - 1));
        }, 35);
        return () => clearTimeout(timer);
      } else {
        // Finished deleting - move to next name
        setIsDeleting(false);
        setNameIndex((i) => (i + 1) % names.length);
      }
    }
  }, [names, nameIndex, charIndex, isDeleting, isPaused, isFocused, hasValue]);

  // Reset when focus is lost and no value
  useEffect(() => {
    if (!isFocused && !hasValue) {
      setCharIndex(0);
      setDisplayText('');
      setIsDeleting(false);
      setIsPaused(false);
    }
  }, [isFocused, hasValue]);

  if (isFocused || hasValue) return 'Your name';
  return displayText || 'Your name';
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

/** Full-card success celebration that replaces the form */
function SuccessCelebration({ name }: { name: string }) {
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const hintTimer = setTimeout(() => setShowScrollHint(true), 1400);
    const scrollTimer = setTimeout(() => {
      const mapEl = document.getElementById('lumina-map');
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 2500);

    return () => {
      clearTimeout(hintTimer);
      clearTimeout(scrollTimer);
    };
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative mx-auto w-24 h-24 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-400/20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.4, opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5, repeat: 2, repeatDelay: 0.8 }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/15 to-emerald-500/10 border-2 border-emerald-400/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.7 }}
        />
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
            transition={{ type: 'spring', bounce: 0, duration: 0.6, delay: 0.4 }}
          />
        </motion.svg>
      </div>

      <motion.h3
        className="text-2xl md:text-3xl font-bold text-text-primary"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.3, duration: 0.6, delay: 0.5 }}
      >
        Thanks, {name}!
      </motion.h3>

      <motion.p
        className="text-base text-text-secondary mt-3 max-w-sm leading-relaxed"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.5, delay: 0.7 }}
      >
        We'll review your inquiry and be in touch within 24 hours.
      </motion.p>

      <AnimatePresence>
        {showScrollHint && (
          <motion.div
            className="mt-8 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sm text-text-tertiary">Scroll down to see our reach</p>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-tertiary"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="m6 9 6 6 6-6" />
            </motion.svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ContactFormProps {
  onSuccess?: (name: string) => void;
}

export default function ContactForm({ onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    location: '',
    helpType: '',
    message: '',
    _honeypot: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submittedName, setSubmittedName] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Cycling name placeholder state
  const [nameFocused, setNameFocused] = useState(false);
  const cyclingPlaceholder = useCyclingPlaceholder(CYCLING_NAMES, nameFocused, !!formData.name);

  // Location detection state
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }

    setGeoStatus('loading');
    trackLocationDetect('started');

    const STATE_MAP: Record<string, string> = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
      'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
      'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
      'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
      'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
      'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
      'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
      'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
      'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 600000,
        });
      });

      const { latitude, longitude } = position.coords;
      let locationStr = '';

      // Try Mapbox first (if token available)
      if (MAPBOX_TOKEN) {
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=place,region&limit=1&access_token=${MAPBOX_TOKEN}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.features?.length > 0) {
              const feature = data.features[0];
              let city = '';
              let state = '';
              if (feature.place_type?.includes('place')) {
                city = feature.text || '';
                const regionCtx = feature.context?.find((c: { id: string }) => c.id.startsWith('region'));
                state = regionCtx?.short_code?.replace('US-', '') || regionCtx?.text || '';
              } else if (feature.place_type?.includes('region')) {
                state = feature.text || '';
              }
              if (city && state) locationStr = `${city}, ${state}`;
            }
          }
        } catch { /* fall through to Nominatim */ }
      }

      // Fallback: OpenStreetMap Nominatim
      if (!locationStr) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            if (addr) {
              const city = addr.city || addr.town || addr.village || addr.hamlet || addr.county || '';
              const state = addr.state || '';
              const stateAbbr = STATE_MAP[state.toLowerCase()] || state;
              if (city && stateAbbr) locationStr = `${city}, ${stateAbbr}`;
            }
          }
        } catch { /* both failed */ }
      }

      if (locationStr) {
        setFormData((prev) => ({ ...prev, location: locationStr }));
        setErrors((prev) => {
          const next = { ...prev };
          delete next.location;
          return next;
        });
        setGeoStatus('success');
        trackLocationDetect('success', locationStr);
      } else {
        setGeoStatus('error');
        trackLocationDetect('error');
      }
    } catch (err: any) {
      setGeoStatus('error');
      trackLocationDetect('denied');
      // Log for debugging
      if (err?.code === 1) console.warn('Location: permission denied');
      else if (err?.code === 2) console.warn('Location: position unavailable');
      else if (err?.code === 3) console.warn('Location: timeout');
      else console.warn('Location detection failed:', err);
    }
  }, []);

  // Reset geo error after a few seconds
  useEffect(() => {
    if (geoStatus === 'error') {
      const timer = setTimeout(() => setGeoStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
    if (geoStatus === 'success') {
      const timer = setTimeout(() => setGeoStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [geoStatus]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.company.trim()) errs.company = 'Company is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errs.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (!formData.location.trim()) {
      errs.location = 'Location is required';
    } else if (!validateLocation(formData.location)) {
      errs.location = 'Please enter a valid City, State (e.g. Houston, TX)';
    }
    if (!formData.helpType) errs.helpType = 'Please select an option';
    return errs;
  }

  function handleChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'helpType' && value) {
      trackServiceSelect(value);
    }
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    }
  }

  function handleFieldFocus(field: string) {
    trackFieldFocus(field);
  }

  function handleFieldBlur(field: string, value: string) {
    trackFieldComplete(field, !!value.trim());
  }

  function focusFirstError(errs: FormErrors) {
    const fieldOrder: (keyof FormErrors)[] = ['name', 'company', 'email', 'phone', 'location', 'helpType'];
    const idMap: Record<string, string> = {
      name: 'contact-name',
      company: 'contact-company',
      email: 'contact-email',
      phone: 'contact-phone',
      location: 'contact-location',
      helpType: 'contact-help',
    };
    for (const field of fieldOrder) {
      if (errs[field]) {
        const el = document.getElementById(idMap[field]);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => el.focus(), 350);
        }
        break;
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (formData._honeypot) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setShakeKey((k) => k + 1);
      focusFirstError(errs);
      trackFormValidationError(Object.keys(errs).length, Object.keys(errs));
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
          phone: formData.phone,
          location: formData.location,
          helpType: formData.helpType,
          message: formData.message,
          source: 'contact-form',
          sourcePage: window.location.pathname,
        }),
      });

      const result = await response.json();
      if (result.success) {
        trackFormSubmit(true, formData.helpType);
        const firstName = formData.name.split(' ')[0];

        if (onSuccess) {
          onSuccess(firstName);
        } else {
          setSubmittedName(firstName);
          setShowToast(true);
          setStatus('success');
          setFormData({ name: '', company: '', email: '', phone: '', location: '', helpType: '', message: '', _honeypot: '' });
          setErrors({});
          window.dispatchEvent(new CustomEvent('lumina:form-submitted'));
          setTimeout(() => setShowToast(false), 8000);
        }
      } else {
        trackFormSubmit(false, formData.helpType);
        setStatus('error');
      }
    } catch {
      trackFormSubmit(false, formData.helpType);
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

      <AnimatePresence mode="wait">
      {status === 'success' ? (
        <SuccessCelebration key="success" name={submittedName} />
      ) : (
      <motion.form
        key="form"
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5"
        initial={false}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
      >
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

        {/* Validation summary banner */}
        <AnimatePresence>
          {Object.keys(errors).length > 0 && (
            <motion.div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/[0.06] p-4"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="shrink-0 mt-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-400">Please fill in the required fields</p>
                <p className="text-xs text-red-400/60 mt-0.5">
                  {Object.keys(errors).length === 1 ? '1 field needs' : `${Object.keys(errors).length} fields need`} your attention below.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name - with cycling placeholder */}
        <motion.div
          key={`name-${shakeKey}`}
          variants={shakeVariants}
          animate={errors.name ? 'shake' : undefined}
        >
          <label htmlFor="contact-name" className={labelClass}>
            Name <span className="text-accent-error">*</span>
          </label>
          <div className="relative">
            <input
              id="contact-name"
              type="text"
              autoComplete="name"
              placeholder={nameFocused || formData.name ? 'Your name' : ' '}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onFocus={() => { setNameFocused(true); handleFieldFocus('name'); }}
              onBlur={() => { setNameFocused(false); handleFieldBlur('name', formData.name); }}
              className={`${inputBase} ${errors.name ? inputError : ''}`}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {/* Cycling placeholder overlay */}
            {!nameFocused && !formData.name && (
              <div
                className="absolute inset-0 flex items-center px-4 pointer-events-none text-text-tertiary text-base"
                aria-hidden="true"
              >
                <span>{cyclingPlaceholder}</span>
                <motion.span
                  className="inline-block w-[2px] h-[1.1em] bg-text-tertiary/50 ml-[1px]"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                />
              </div>
            )}
          </div>
          <AnimatePresence>
            {errors.name && (
              <motion.p
                id="name-error"
                role="alert"
                className="mt-1.5 text-sm text-accent-error flex items-center gap-1.5"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Company */}
        <motion.div
          key={`company-${shakeKey}`}
          variants={shakeVariants}
          animate={errors.company ? 'shake' : undefined}
        >
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
            onFocus={() => handleFieldFocus('company')}
            onBlur={() => handleFieldBlur('company', formData.company)}
            className={`${inputBase} ${errors.company ? inputError : ''}`}
            aria-invalid={!!errors.company}
            aria-describedby={errors.company ? 'company-error' : undefined}
          />
          <AnimatePresence>
            {errors.company && (
              <motion.p
                id="company-error"
                role="alert"
                className="mt-1.5 text-sm text-accent-error flex items-center gap-1.5"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {errors.company}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Email */}
        <motion.div
          key={`email-${shakeKey}`}
          variants={shakeVariants}
          animate={errors.email ? 'shake' : undefined}
        >
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
            onFocus={() => handleFieldFocus('email')}
            onBlur={() => handleFieldBlur('email', formData.email)}
            className={`${inputBase} ${errors.email ? inputError : ''}`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          <AnimatePresence>
            {errors.email && (
              <motion.p
                id="email-error"
                role="alert"
                className="mt-1.5 text-sm text-accent-error flex items-center gap-1.5"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {errors.email}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Phone & Location -- side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Phone */}
          <motion.div
            key={`phone-${shakeKey}`}
            variants={shakeVariants}
            animate={errors.phone ? 'shake' : undefined}
          >
            <label htmlFor="contact-phone" className={labelClass}>
              Phone <span className="text-accent-error">*</span>
            </label>
            <input
              id="contact-phone"
              type="tel"
              autoComplete="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onFocus={() => handleFieldFocus('phone')}
              onBlur={() => handleFieldBlur('phone', formData.phone)}
              className={`${inputBase} ${errors.phone ? inputError : ''}`}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            <AnimatePresence>
              {errors.phone && (
                <motion.p
                  id="phone-error"
                  role="alert"
                  className="mt-1.5 text-sm text-accent-error flex items-center gap-1.5"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  {errors.phone}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Location - with geolocation detect button */}
          <motion.div
            key={`location-${shakeKey}`}
            variants={shakeVariants}
            animate={errors.location ? 'shake' : undefined}
          >
            <label htmlFor="contact-location" className={labelClass}>
              Location <span className="text-accent-error">*</span>
            </label>
            <div className="relative">
              <input
                id="contact-location"
                type="text"
                autoComplete="address-level1"
                placeholder="City, State"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                onFocus={() => handleFieldFocus('location')}
                onBlur={() => handleFieldBlur('location', formData.location)}
                className={`${inputBase} pr-10 ${errors.location ? inputError : ''}`}
                aria-invalid={!!errors.location}
                aria-describedby={errors.location ? 'location-error' : undefined}
              />
              {/* Location detect button */}
              <button
                type="button"
                onClick={detectLocation}
                disabled={geoStatus === 'loading'}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 rounded-md text-text-tertiary hover:text-accent-primary hover:bg-accent-primary/10 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-wait min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Detect my location"
                aria-label="Detect my location"
              >
                {geoStatus === 'loading' ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : geoStatus === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4" /><path d="M12 18v4" />
                    <path d="M2 12h4" /><path d="M18 12h4" />
                  </svg>
                )}
              </button>
            </div>
            <AnimatePresence>
              {geoStatus === 'error' && (
                <motion.p
                  className="mt-1 text-xs text-text-tertiary"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  Allow location access in your browser, or type it in.
                </motion.p>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {errors.location && (
                <motion.p
                  id="location-error"
                  role="alert"
                  className="mt-1.5 text-sm text-accent-error flex items-center gap-1.5"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  {errors.location}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Service Interest */}
        <motion.div
          key={`help-${shakeKey}`}
          variants={shakeVariants}
          animate={errors.helpType ? 'shake' : undefined}
        >
          <label htmlFor="contact-help" className={labelClass}>
            How Can We Help? <span className="text-accent-error">*</span>
          </label>
          <select
            id="contact-help"
            value={formData.helpType}
            onChange={(e) => handleChange('helpType', e.target.value)}
            onFocus={() => handleFieldFocus('helpType')}
            onBlur={() => handleFieldBlur('helpType', formData.helpType)}
            className={`${inputBase} ${!formData.helpType ? 'text-text-tertiary' : ''} ${errors.helpType ? inputError : ''} appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2716%27%20height%3D%2716%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%237A7A8A%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27m6%209%206%206%206-6%27%2F%3E%3C%2Fsvg%3E")] bg-no-repeat bg-[right_12px_center]`}
            aria-invalid={!!errors.helpType}
            aria-describedby={errors.helpType ? 'help-error' : undefined}
          >
            <option value="" disabled>Select a service...</option>
            {helpOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <AnimatePresence>
            {errors.helpType && (
              <motion.p
                id="help-error"
                role="alert"
                className="mt-1.5 text-sm text-accent-error flex items-center gap-1.5"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {errors.helpType}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

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
            onFocus={() => handleFieldFocus('message')}
            onBlur={() => handleFieldBlur('message', formData.message)}
            className={`${inputBase} resize-y min-h-[100px]`}
          />
        </div>

        {/* Error message */}
        <AnimatePresence>
          {status === 'error' && (
            <motion.div
              role="alert"
              className="bg-accent-error/10 border border-accent-error/30 rounded-lg p-4 text-sm text-accent-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              Something went wrong. Please try again or email us directly at{' '}
              <a href="mailto:Support@Lumina-ERP.com" className="underline">
                Support@Lumina-ERP.com
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-accent-primary text-white text-base font-semibold rounded-lg hover:bg-accent-primary-hover transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none shadow-glow cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {status === 'submitting' ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </>
          ) : (
            <>
              Get My Free Assessment
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </motion.button>
        <p className="text-center text-xs text-text-tertiary mt-3">
          Free 30-minute call. No obligations.
        </p>
      </motion.form>
      )}
      </AnimatePresence>
    </>
  );
}
