/**
 * Form Submission Utilities
 *
 * Primary: Formspree (https://formspree.io/f/mojnjggl)
 * Future: Odoo CRM API (lumina-erp.odoo.com) via Cloudflare Worker proxy
 *
 * Google Cloud Project APIs enabled:
 * - Google Calendar API (appointment scheduling)
 * - Google Meet (auto-generated meeting links)
 * - Gmail API (confirmation emails)
 * - People API (contact enrichment)
 * - Google Analytics API
 * - YouTube Data API v3
 */

export interface ContactFormData {
  name: string;
  company: string;
  email: string;
  helpType?: string;
  message?: string;
  resourceRequested?: string;
  resourceType?: string;
  leadSource?: string;
}

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mojnjggl';

/**
 * Submit form data to Formspree
 */
export async function submitToFormspree(data: ContactFormData): Promise<boolean> {
  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error('Form submission error:', error);
    return false;
  }
}

/**
 * @deprecated Use submitToFormspree instead. Kept for backward compatibility during migration.
 */
export async function submitToHubSpot(data: ContactFormData): Promise<boolean> {
  return submitToFormspree(data);
}
