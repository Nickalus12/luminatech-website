import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  trackFieldFocus,
  trackFieldComplete,
  trackServiceSelect,
  trackLocationDetect,
  trackFormSubmit,
  trackFormValidationError,
  trackAutocompleteSelect,
  trackAutocompleteDismiss,
  trackEmailHintShown,
  trackEmailHintAccepted,
} from '../lib/analytics';
import { AutocompleteDropdown, useAutocomplete } from './AutocompleteDropdown';

interface FormData {
  name: string;
  company: string;
  email: string;
  linkedin: string;
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
const LINKEDIN_AUTH_URL = 'https://odoo-worker.nbrewer.workers.dev/api/linkedin/auth';
const WORKER_ORIGIN = 'https://odoo-worker.nbrewer.workers.dev';

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN || '';

interface LinkedInProfile {
  name: string;
  email: string;
  picture: string;
}

const STORAGE_KEY = 'lumina-contact-draft';

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

/* ── Phone auto-formatting ── */
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  // Handle +1 prefix
  const national = digits.startsWith('1') && digits.length > 10 ? digits.slice(1) : digits;
  if (national.length <= 3) return national;
  if (national.length <= 6) return `(${national.slice(0, 3)}) ${national.slice(3)}`;
  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6, 10)}`;
}

/* ── Email domain typo detection ── */
const COMMON_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com',
  'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'ymail.com',
  'live.com', 'msn.com', 'comcast.net', 'att.net', 'sbcglobal.net',
  'verizon.net', 'cox.net', 'charter.net', 'earthlink.net',
];

const DOMAIN_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmail.co': 'gmail.com',
  'gmaill.com': 'gmail.com', 'gmil.com': 'gmail.com',
  'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.co': 'yahoo.com',
  'yahoocom': 'yahoo.com', 'yhaoo.com': 'yahoo.com',
  'outllok.com': 'outlook.com', 'outlok.com': 'outlook.com', 'outlook.co': 'outlook.com',
  'outloo.com': 'outlook.com', 'outlookk.com': 'outlook.com',
  'hotmal.com': 'hotmail.com', 'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com', 'hotmaill.com': 'hotmail.com',
  'icloud.co': 'icloud.com', 'iclud.com': 'icloud.com',
};

function suggestEmailDomain(email: string): string | null {
  const atIndex = email.indexOf('@');
  if (atIndex < 1) return null;
  const domain = email.slice(atIndex + 1).toLowerCase();
  if (!domain || domain.length < 3) return null;
  // Direct typo match
  if (DOMAIN_TYPOS[domain]) return DOMAIN_TYPOS[domain];
  // Check close Levenshtein distance (simple approach: off-by-one)
  for (const common of COMMON_DOMAINS) {
    if (domain === common) return null; // Already correct
    // Off by one char at end (e.g. "gmail.con" -> "gmail.com")
    if (domain.length === common.length && domain.slice(0, -1) === common.slice(0, -1)) {
      return common;
    }
  }
  return null;
}

/* ── LinkedIn URL normalization ── */
function normalizeLinkedInUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  // Extract the path portion (e.g., "in/username" or just "username")
  const match = trimmed.match(/(?:(?:https?:\/\/)?(?:www\.)?linkedin\.com\/)?(in\/[\w-]+)/i);
  if (match) return `https://www.linkedin.com/${match[1]}`;
  return trimmed;
}

function isValidLinkedInUrl(value: string): boolean {
  if (!value.trim()) return true; // Optional field, empty is valid
  return /^https:\/\/www\.linkedin\.com\/in\/[\w-]+\/?$/.test(normalizeLinkedInUrl(value));
}

/* ── Mapbox location search ── */
async function searchMapboxLocations(query: string): Promise<{ id: string; name: string; full: string }[]> {
  if (!MAPBOX_TOKEN) return [];
  const res = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&access_token=${MAPBOX_TOKEN}&autocomplete=true&country=US&types=place,locality,neighborhood&limit=5&language=en`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.features || []).map((f: any) => {
    const props = f.properties || {};
    const city = props.name || props.full_address || '';
    const ctx = props.context || {};
    const region = ctx.region?.region_code || ctx.region?.name || '';
    const full = region ? `${city}, ${region}` : city;
    return { id: f.id || crypto.randomUUID(), name: city, full };
  });
}

/* ── Clearbit company search ── */
interface ClearbitCompany {
  name: string;
  domain: string;
  logo: string;
}

async function searchClearbitCompanies(query: string): Promise<ClearbitCompany[]> {
  try {
    const res = await fetch(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
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

/** Completion progress bar */
function ProgressBar({ formData }: { formData: FormData }) {
  const filled = [
    formData.name.trim(),
    formData.company.trim(),
    formData.email.trim() && validateEmail(formData.email),
    formData.phone.trim() && validatePhone(formData.phone),
    formData.location.trim(),
    formData.helpType,
  ].filter(Boolean).length;
  const pct = (filled / 6) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-text-tertiary">{filled}/6 fields complete</span>
        {filled === 6 && (
          <motion.span
            className="text-xs text-emerald-400 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Ready to submit
          </motion.span>
        )}
      </div>
      <div className="h-1 w-full rounded-full bg-bg-surface-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent-primary to-emerald-400"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

/** Express Lane card — LinkedIn quick-fill */
function ExpressLane({
  profile,
  loading,
  onConnect,
  onDisconnect,
}: {
  profile: LinkedInProfile | null;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  if (profile) {
    return (
      <motion.div
        className="mb-6 rounded-xl border border-[#0A66C2]/20 bg-[#0A66C2]/[0.04] p-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3">
          {profile.picture ? (
            <img
              src={profile.picture}
              alt=""
              className="w-10 h-10 rounded-full ring-2 ring-[#0A66C2]/30"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#0A66C2]/15 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary truncate">{profile.name}</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[#0A66C2]/15 text-[#0A66C2] border border-[#0A66C2]/20">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                Verified
              </span>
            </div>
            <p className="text-xs text-text-tertiary truncate">{profile.email}</p>
          </div>
          <button
            type="button"
            onClick={onDisconnect}
            className="shrink-0 p-1.5 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Disconnect LinkedIn"
            title="Disconnect"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mb-6 rounded-xl border border-border bg-bg-surface-2/50 p-5 text-center"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span className="text-sm font-semibold text-text-primary">Express Lane</span>
      </div>
      <p className="text-xs text-text-tertiary mb-4">Pre-fill your details instantly with LinkedIn</p>
      <button
        type="button"
        onClick={onConnect}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2.5 w-full max-w-xs mx-auto px-5 py-2.5 rounded-lg bg-[#0A66C2] text-white text-sm font-semibold hover:bg-[#004182] transition-all duration-200 disabled:opacity-60 disabled:cursor-wait cursor-pointer shadow-[0_0_20px_rgba(10,102,194,0.2)] hover:shadow-[0_0_30px_rgba(10,102,194,0.35)]"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Continue with LinkedIn
          </>
        )}
      </button>
      <div className="flex items-center gap-3 mt-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-text-tertiary uppercase tracking-wider">or fill in manually</span>
        <div className="flex-1 h-px bg-border" />
      </div>
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
    linkedin: '',
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

  // LinkedIn Express Lane state
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);
  const [linkedInLoading, setLinkedInLoading] = useState(false);

  // Cycling name placeholder state
  const [nameFocused, setNameFocused] = useState(false);
  const cyclingPlaceholder = useCyclingPlaceholder(CYCLING_NAMES, nameFocused, !!formData.name);

  // Location detection state
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Location autocomplete
  const locationAC = useAutocomplete({
    fetchFn: searchMapboxLocations,
    toItem: (r) => ({ id: r.id, label: r.full }),
    debounceMs: 300,
    minChars: 2,
  });

  // Company autocomplete
  const companyAC = useAutocomplete({
    fetchFn: searchClearbitCompanies,
    toItem: (c) => ({
      id: c.domain,
      label: c.name,
      sublabel: c.domain,
      icon: c.logo,
    }),
    debounceMs: 300,
    minChars: 2,
  });

  // Email hint state
  const [emailHint, setEmailHint] = useState<string | null>(null);

  // Company domain from Clearbit (for email placeholder enhancement)
  const [companyDomain, setCompanyDomain] = useState<string | null>(null);

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

  // --- localStorage draft persistence ---
  const draftLoaded = useRef(false);
  useEffect(() => {
    if (draftLoaded.current) return;
    draftLoaded.current = true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed, _honeypot: '' }));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (status === 'success') return; // Don't save after submission
    const timer = setTimeout(() => {
      try {
        const { _honeypot, ...rest } = formData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
      } catch { /* ignore */ }
    }, 600);
    return () => clearTimeout(timer);
  }, [formData, status]);

  // --- LinkedIn OAuth popup + postMessage ---
  const handleLinkedInConnect = useCallback(() => {
    setLinkedInLoading(true);
    const origin = encodeURIComponent(window.location.origin);
    const popup = window.open(
      `${LINKEDIN_AUTH_URL}?origin=${origin}`,
      'linkedin-auth',
      'width=600,height=700,left=200,top=100,toolbar=no,menubar=no'
    );

    // Poll for popup close (in case user closes it manually)
    const pollTimer = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(pollTimer);
        setLinkedInLoading(false);
      }
    }, 500);
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== WORKER_ORIGIN) return;

      if (event.data?.type === 'linkedin-profile') {
        const profile = event.data.profile as LinkedInProfile;
        setLinkedInProfile(profile);
        setLinkedInLoading(false);

        // Cascade-fill the form fields with slight delays
        const updates: Partial<FormData> = {};
        if (profile.name) updates.name = profile.name;
        if (profile.email) updates.email = profile.email;
        // Construct LinkedIn URL from name (user can edit)
        updates.linkedin = '';

        setFormData((prev) => ({ ...prev, ...updates }));

        // Clear errors for auto-filled fields
        setErrors((prev) => {
          const next = { ...prev };
          if (profile.name) delete next.name;
          if (profile.email) delete next.email;
          return next;
        });
      }

      if (event.data?.type === 'linkedin-error') {
        setLinkedInLoading(false);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLinkedInDisconnect = useCallback(() => {
    setLinkedInProfile(null);
  }, []);

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
    // Phone auto-formatting
    if (field === 'phone') {
      value = formatPhoneNumber(value);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'helpType' && value) {
      trackServiceSelect(value);
    }

    // Trigger location autocomplete
    if (field === 'location') {
      locationAC.search(value);
    }

    // Trigger company autocomplete
    if (field === 'company') {
      companyAC.search(value);
    }

    // Email domain hint
    if (field === 'email') {
      const hint = suggestEmailDomain(value);
      if (hint && hint !== emailHint) {
        setEmailHint(hint);
        trackEmailHintShown(hint);
      } else if (!hint) {
        setEmailHint(null);
      }
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
          linkedin: formData.linkedin ? normalizeLinkedInUrl(formData.linkedin) : '',
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

        // Clear saved draft
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }

        if (onSuccess) {
          onSuccess(firstName);
        } else {
          setSubmittedName(firstName);
          setShowToast(true);
          setStatus('success');
          setFormData({ name: '', company: '', email: '', linkedin: '', phone: '', location: '', helpType: '', message: '', _honeypot: '' });
          setErrors({});
          setLinkedInProfile(null);
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
      <div key="form-wrapper">
        {/* Express Lane — LinkedIn quick-fill */}
        <ExpressLane
          profile={linkedInProfile}
          loading={linkedInLoading}
          onConnect={handleLinkedInConnect}
          onDisconnect={handleLinkedInDisconnect}
        />

        {/* Progress bar */}
        <ProgressBar formData={formData} />

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
            {linkedInProfile && formData.name === linkedInProfile.name && (
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#0A66C2]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                via LinkedIn
              </span>
            )}
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

        {/* Company - with Clearbit autocomplete */}
        <motion.div
          key={`company-${shakeKey}`}
          variants={shakeVariants}
          animate={errors.company ? 'shake' : undefined}
        >
          <label htmlFor="contact-company" className={labelClass}>
            Company <span className="text-accent-error">*</span>
          </label>
          <div className="relative">
            <input
              id="contact-company"
              type="text"
              autoComplete="off"
              placeholder="Your company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              onFocus={() => handleFieldFocus('company')}
              onBlur={() => {
                handleFieldBlur('company', formData.company);
                // Delay close so click can register
                setTimeout(() => companyAC.close(), 150);
              }}
              onKeyDown={(e) => {
                const selected = companyAC.handleKeyDown(e);
                if (selected) {
                  handleChange('company', selected.label);
                  setCompanyDomain(selected.sublabel || null);
                  companyAC.close();
                  trackAutocompleteSelect('company', selected.label);
                }
                if (e.key === 'Escape') {
                  trackAutocompleteDismiss('company');
                }
              }}
              className={`${inputBase} ${errors.company ? inputError : ''}`}
              aria-invalid={!!errors.company}
              aria-describedby={errors.company ? 'company-error' : undefined}
              role="combobox"
              aria-expanded={companyAC.isOpen}
              aria-controls="company-listbox"
              aria-activedescendant={companyAC.activeIndex >= 0 ? `company-listbox-option-${companyAC.activeIndex}` : undefined}
              aria-autocomplete="list"
            />
            <AutocompleteDropdown
              items={companyAC.items}
              isOpen={companyAC.isOpen}
              activeIndex={companyAC.activeIndex}
              loading={companyAC.loading}
              listboxId="company-listbox"
              onSelect={(item) => {
                handleChange('company', item.label);
                setCompanyDomain(item.sublabel || null);
                companyAC.close();
                trackAutocompleteSelect('company', item.label);
              }}
            />
          </div>
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

        {/* Email - with typo hint */}
        <motion.div
          key={`email-${shakeKey}`}
          variants={shakeVariants}
          animate={errors.email ? 'shake' : undefined}
        >
          <label htmlFor="contact-email" className={labelClass}>
            Email <span className="text-accent-error">*</span>
            {linkedInProfile && formData.email === linkedInProfile.email && (
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#0A66C2]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                via LinkedIn
              </span>
            )}
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder={companyDomain ? `you@${companyDomain}` : 'you@company.com'}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onFocus={() => handleFieldFocus('email')}
            onBlur={() => handleFieldBlur('email', formData.email)}
            className={`${inputBase} ${errors.email ? inputError : ''}`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : emailHint ? 'email-hint' : undefined}
          />
          <AnimatePresence>
            {emailHint && !errors.email && (
              <motion.button
                id="email-hint"
                type="button"
                className="mt-1.5 text-sm text-accent-primary flex items-center gap-1.5 cursor-pointer hover:text-accent-primary-hover transition-colors"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  const atIndex = formData.email.indexOf('@');
                  if (atIndex >= 0) {
                    const corrected = formData.email.slice(0, atIndex + 1) + emailHint;
                    handleChange('email', corrected);
                    setEmailHint(null);
                    trackEmailHintAccepted(emailHint);
                  }
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                </svg>
                Did you mean @{emailHint}?
              </motion.button>
            )}
          </AnimatePresence>
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

        {/* LinkedIn (optional) */}
        <div>
          <label htmlFor="contact-linkedin" className={labelClass}>
            LinkedIn <span className="text-text-tertiary">(optional)</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
            <input
              id="contact-linkedin"
              type="url"
              autoComplete="off"
              placeholder="linkedin.com/in/your-profile"
              value={formData.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              onFocus={() => handleFieldFocus('linkedin')}
              onBlur={() => {
                handleFieldBlur('linkedin', formData.linkedin);
                if (formData.linkedin.trim()) {
                  const normalized = normalizeLinkedInUrl(formData.linkedin);
                  if (normalized !== formData.linkedin) {
                    setFormData((prev) => ({ ...prev, linkedin: normalized }));
                  }
                }
              }}
              className={`${inputBase} pl-10 ${
                formData.linkedin && isValidLinkedInUrl(formData.linkedin)
                  ? 'border-[#0A66C2]/30 focus:border-[#0A66C2] focus:ring-[#0A66C2]/40'
                  : ''
              }`}
            />
            {formData.linkedin && isValidLinkedInUrl(formData.linkedin) && (
              <motion.div
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A66C2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </motion.div>
            )}
          </div>
          {formData.linkedin && isValidLinkedInUrl(formData.linkedin) && (
            <motion.p
              className="mt-1.5 text-xs text-[#0A66C2]/70 flex items-center gap-1"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              Helps us understand your background
            </motion.p>
          )}
          {formData.linkedin && !isValidLinkedInUrl(formData.linkedin) && (
            <p className="mt-1.5 text-xs text-text-tertiary">
              Enter a URL like linkedin.com/in/your-profile
            </p>
          )}
        </div>

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

          {/* Location - with Mapbox autocomplete + geolocation detect */}
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
                autoComplete="off"
                placeholder="City, State"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                onFocus={() => handleFieldFocus('location')}
                onBlur={() => {
                  handleFieldBlur('location', formData.location);
                  setTimeout(() => locationAC.close(), 150);
                }}
                onKeyDown={(e) => {
                  const selected = locationAC.handleKeyDown(e);
                  if (selected) {
                    handleChange('location', selected.label);
                    locationAC.close();
                    trackAutocompleteSelect('location', selected.label);
                  }
                  if (e.key === 'Escape') {
                    trackAutocompleteDismiss('location');
                  }
                }}
                className={`${inputBase} pr-10 ${errors.location ? inputError : ''}`}
                aria-invalid={!!errors.location}
                aria-describedby={errors.location ? 'location-error' : undefined}
                role="combobox"
                aria-expanded={locationAC.isOpen}
                aria-controls="location-listbox"
                aria-activedescendant={locationAC.activeIndex >= 0 ? `location-listbox-option-${locationAC.activeIndex}` : undefined}
                aria-autocomplete="list"
              />
              {/* Location detect button */}
              <button
                type="button"
                onClick={detectLocation}
                disabled={geoStatus === 'loading'}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 rounded-md text-text-tertiary hover:text-accent-primary hover:bg-accent-primary/10 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-wait min-w-[44px] min-h-[44px] flex items-center justify-center z-10"
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
              <AutocompleteDropdown
                items={locationAC.items}
                isOpen={locationAC.isOpen}
                activeIndex={locationAC.activeIndex}
                loading={locationAC.loading}
                listboxId="location-listbox"
                onSelect={(item) => {
                  handleChange('location', item.label);
                  locationAC.close();
                  trackAutocompleteSelect('location', item.label);
                }}
              />
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
      </div>
      )}
      </AnimatePresence>
    </>
  );
}
