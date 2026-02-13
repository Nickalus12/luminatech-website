/**
 * HubSpot Forms API Integration Utilities
 *
 * References:
 * - Forms API: https://developers.hubspot.com/docs/api-reference/marketing-forms-v3/guide
 * - Tracking Cookie: https://www.stephanieogaygarcia.com/hubspot-website-development/get-hubspot-cookie-hubspotutk-using-javascript
 */

export const HUBSPOT_PORTAL_ID = '245170452';
export const HUBSPOT_FORM_GUID = '98783590-40a0-4b73-b4f7-cc76d3fe2206';

/**
 * Get the HubSpot tracking cookie (hubspotutk)
 * This cookie is set by the HubSpot tracking code and contains a unique visitor ID
 * The cookie value is used to track visitor activity and associate form submissions with contacts
 */
export function getHubSpotCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'hubspotutk') {
      return value;
    }
  }
  return null;
}

/**
 * Contact form data interface matching our ContactForm.tsx
 */
export interface ContactFormData {
  name: string;
  company: string;
  email: string;
  helpType: string;
  message: string;
}

/**
 * Map our contact form data to HubSpot field format
 *
 * Note: Custom properties need to be created in HubSpot first:
 * 1. service_interest (dropdown/single checkbox with the help options)
 * 2. consultation_message (multi-line text for the message field)
 *
 * To create custom properties:
 * https://app.hubspot.com/contacts/245170452/property-settings/0-1
 */
export function mapToHubSpotFields(data: ContactFormData) {
  // Split name into first/last (HubSpot expects these separately)
  const nameParts = data.name.trim().split(' ');
  const firstname = nameParts[0] || '';
  const lastname = nameParts.slice(1).join(' ') || '';

  return {
    fields: [
      { name: 'email', value: data.email },
      { name: 'firstname', value: firstname },
      { name: 'lastname', value: lastname },
      { name: 'company', value: data.company },
      // These are custom properties - create them in HubSpot before enabling:
      { name: 'service_interest', value: data.helpType },
      { name: 'consultation_message', value: data.message },
    ],
    context: {
      hutk: getHubSpotCookie(), // Visitor tracking token
      pageUri: typeof window !== 'undefined' ? window.location.href : '',
      pageName: 'Contact Page - Lumina Erp',
    },
  };
}

/**
 * Submit form data to HubSpot Forms API
 *
 * This endpoint does NOT require authentication - only portal ID and form GUID
 * Reference: https://api.hsforms.com/submissions/v3/integration/submit/:portalId/:formGuid
 *
 * @param data Contact form data
 * @returns Promise<boolean> True if submission succeeded, false otherwise
 */
export async function submitToHubSpot(data: ContactFormData): Promise<boolean> {
  // Skip if form GUID not configured
  if (HUBSPOT_FORM_GUID === 'YOUR_FORM_GUID_HERE') {
    console.warn('HubSpot form GUID not configured. Skipping HubSpot submission.');
    return false;
  }

  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;
  const payload = mapToHubSpotFields(data);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('HubSpot submission failed:', errorData);
      return false;
    }

    console.log('Successfully submitted to HubSpot');
    return true;
  } catch (error) {
    console.error('HubSpot submission error:', error);
    return false;
  }
}
