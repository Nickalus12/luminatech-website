import { useState, type FormEvent } from 'react';

interface FormData {
  name: string;
  email: string;
  company: string;
  _honeypot: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
}

interface EmailCaptureFormProps {
  resourceTitle: string;
  resourceType?: 'guide' | 'template' | 'checklist' | 'library';
  onSuccess?: () => void;
}

const inputBase =
  'w-full bg-bg-surface-1 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-tertiary text-base transition-all duration-200 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:shadow-glow';

const inputError = 'border-accent-error focus:border-accent-error focus:ring-accent-error';

const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function EmailCaptureForm({
  resourceTitle,
  resourceType = 'guide',
  onSuccess
}: EmailCaptureFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    _honeypot: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submittedName, setSubmittedName] = useState('');

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.company.trim()) errs.company = 'Company is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errs.email = 'Please enter a valid email';
    }
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
      const response = await fetch('https://odoo-worker.nbrewer.workers.dev/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company,
          email: formData.email,
          helpType: resourceType,
          message: `Resource requested: ${resourceTitle} (${resourceType})`,
          source: 'resource-gate',
          sourcePage: window.location.pathname,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSubmittedName(formData.name.split(' ')[0]);
        setStatus('success');
        setFormData({ name: '', company: '', email: '', _honeypot: '' });
        setErrors({});

        // Store access in localStorage
        const gatedAccess = JSON.parse(localStorage.getItem('gatedResourceAccess') || '{}');
        gatedAccess[formData.email] = {
          name: formData.name,
          company: formData.company,
          grantedAt: new Date().toISOString(),
          resources: [...(gatedAccess[formData.email]?.resources || []), resourceTitle]
        };
        localStorage.setItem('gatedResourceAccess', JSON.stringify(gatedAccess));

        // Call success callback
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500);
        }
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="bg-bg-surface-1 border border-accent-success/30 rounded-xl p-8 text-center animate-[fade-in_0.4s_ease-out]">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent-success/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          Thanks, {submittedName}!
        </h3>
        <p className="text-text-secondary mb-4">
          You now have access to this resource.
        </p>
        {!onSuccess && (
          <p className="text-sm text-text-tertiary">
            Scroll down to view the content, or check your email for a copy.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-bg-surface-1 border border-border rounded-xl p-6 md:p-8">
      <div className="mb-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-accent-primary/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          Get Free Access
        </h3>
        <p className="text-text-secondary text-sm">
          Enter your email to unlock <strong>{resourceTitle}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
          <label htmlFor="resource-name" className={labelClass}>
            Name <span className="text-accent-error">*</span>
          </label>
          <input
            id="resource-name"
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

        {/* Email */}
        <div>
          <label htmlFor="resource-email" className={labelClass}>
            Email <span className="text-accent-error">*</span>
          </label>
          <input
            id="resource-email"
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

        {/* Company */}
        <div>
          <label htmlFor="resource-company" className={labelClass}>
            Company <span className="text-accent-error">*</span>
          </label>
          <input
            id="resource-company"
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

        {/* Error message */}
        {status === 'error' && (
          <div role="alert" className="bg-accent-error/10 border border-accent-error/30 rounded-lg p-4 text-sm text-accent-error animate-[fade-in_0.3s_ease-out]">
            Something went wrong. Please try again or email us at{' '}
            <a href="mailto:Support@Lumina-ERP.com" className="underline">
              Support@Lumina-ERP.com
            </a>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-primary text-white text-base font-semibold rounded-lg hover:bg-accent-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none shadow-glow cursor-pointer"
        >
          {status === 'submitting' ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </>
          ) : (
            <>
              Get Free Access
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        <p className="text-center text-xs text-text-tertiary mt-3">
          No spam. Unsubscribe anytime. We respect your privacy.
        </p>
      </form>
    </div>
  );
}
