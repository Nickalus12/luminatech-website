import { useState, type FormEvent } from 'react';

const SUBSCRIBE_ENDPOINT = 'https://odoo-worker.nbrewer.workers.dev/api/subscribe';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setStatus('submitting');
    try {
      const response = await fetch(SUBSCRIBE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'footer-newsletter',
        }),
      });
      const result = await response.json();
      if (result.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        You're subscribed!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
        required
        className="flex-1 min-w-0 bg-bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary transition-colors"
        aria-label="Email for newsletter"
      />
      <button
        type="submit"
        disabled={status === 'submitting' || !email}
        className="shrink-0 px-4 py-2 bg-accent-primary text-white text-sm font-medium rounded-lg hover:bg-accent-primary-hover transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        {status === 'submitting' ? (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : 'Subscribe'}
      </button>
      {status === 'error' && (
        <p className="text-xs text-accent-error mt-1">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
