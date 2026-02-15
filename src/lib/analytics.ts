/**
 * Lightweight GA4 event tracking utility.
 * Uses gtag() which is loaded via Analytics.astro.
 * All events flow into GA4 (G-2P1FBWXLFK) and GTM (GTM-TGNXHWTC).
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function track(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/* ── Form Events ── */

export function trackFieldFocus(fieldName: string) {
  track('form_field_focus', {
    field_name: fieldName,
    form_name: 'contact',
  });
}

export function trackFieldComplete(fieldName: string, hasValue: boolean) {
  if (hasValue) {
    track('form_field_complete', {
      field_name: fieldName,
      form_name: 'contact',
    });
  }
}

export function trackServiceSelect(service: string) {
  track('service_selected', {
    service_type: service,
    form_name: 'contact',
  });
}

export function trackLocationDetect(status: 'started' | 'success' | 'denied' | 'error', location?: string) {
  track('location_detect', {
    detect_status: status,
    ...(location ? { detected_location: location } : {}),
  });
}

export function trackFormSubmit(success: boolean, helpType?: string) {
  track(success ? 'form_submit_success' : 'form_submit_error', {
    form_name: 'contact',
    ...(helpType ? { service_type: helpType } : {}),
  });
}

export function trackFormValidationError(errorCount: number, fields: string[]) {
  track('form_validation_error', {
    error_count: errorCount,
    error_fields: fields.join(','),
    form_name: 'contact',
  });
}

/* ── Autocomplete Events ── */

export function trackAutocompleteSelect(field: string, value: string) {
  track('autocomplete_select', {
    field_name: field,
    selected_value: value,
    form_name: 'contact',
  });
}

export function trackAutocompleteDismiss(field: string) {
  track('autocomplete_dismiss', {
    field_name: field,
    form_name: 'contact',
  });
}

/* ── Smart Field Events ── */

export function trackEmailHintShown(suggestion: string) {
  track('email_hint_shown', {
    suggested_domain: suggestion,
    form_name: 'contact',
  });
}

export function trackEmailHintAccepted(suggestion: string) {
  track('email_hint_accepted', {
    suggested_domain: suggestion,
    form_name: 'contact',
  });
}

/* ── Navigation & Engagement Events ── */

export function trackCtaClick(ctaName: string, location: string) {
  track('cta_click', {
    cta_name: ctaName,
    cta_location: location,
  });
}

export function trackScheduleClick(source: string) {
  track('schedule_consultation', {
    click_source: source,
  });
}

export function trackMapInteraction(phase: string) {
  track('map_interaction', {
    map_phase: phase,
  });
}

export function trackExternalLink(url: string, label: string) {
  track('external_link_click', {
    link_url: url,
    link_label: label,
  });
}
