/**
 * Odoo CRM Integration Utilities
 *
 * Cloudflare Worker proxy: https://odoo-worker.nbrewer.workers.dev
 * Odoo instance: lumina-erp.odoo.com
 *
 * Endpoints:
 * - POST /api/contact   -> Create CRM lead (crm.lead)
 * - POST /api/subscribe -> Add to mailing list (mailing.contact)
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
  source?: string;
  sourcePage?: string;
}

export interface SubscribeFormData {
  name?: string;
  email: string;
  company?: string;
  source?: string;
}

const WORKER_BASE = 'https://odoo-worker.nbrewer.workers.dev';

export async function submitContactForm(data: ContactFormData): Promise<boolean> {
  try {
    const response = await fetch(`${WORKER_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Contact form submission error:', error);
    return false;
  }
}

export async function submitSubscribeForm(data: SubscribeFormData): Promise<boolean> {
  try {
    const response = await fetch(`${WORKER_BASE}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Subscribe form submission error:', error);
    return false;
  }
}
