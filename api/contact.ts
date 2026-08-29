import { neon } from '@neondatabase/serverless';
import { type ApiRequest, type ApiResponse, assertSameOriginMutation, parseJsonBody, sendError } from './_lib/http';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // 1. Enforce POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    assertSameOriginMutation(req);
    const { name, contact, business, workflow, outcome, website, _honeypot } = parseJsonBody<Record<string, unknown>>(req);

    // 2. Honeypot Spam Protection
    const websiteFilled = typeof website === 'string' && website.trim() !== '';
    const legacyHoneypotFilled = typeof _honeypot === 'string' && _honeypot.trim() !== '';
    if (websiteFilled || legacyHoneypotFilled) {
      // If a bot filled out the hidden honeypot field, return success without doing anything
      return res.status(200).json({ success: true, message: 'Your message has been received.' });
    }

    // 3. Trim values and Input Validation
    const clean = (value: unknown) => typeof value === 'string'
      ? [...value].filter((character) => {
          const code = character.charCodeAt(0);
          return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
        }).join('').trim()
      : '';
    const safeName = clean(name);
    const safeContact = clean(contact);
    const safeBusiness = clean(business);
    const safeWorkflow = clean(workflow);
    const safeOutcome = clean(outcome) || 'Not provided yet';

    if (!safeName || !safeContact || !safeWorkflow) {
      return res.status(400).json({ error: 'Name, reply contact, and task description are required fields.' });
    }

    // 4. Length Limits to prevent oversized payloads
    if (safeName.length > 200 || safeContact.length > 320 || safeBusiness.length > 200) {
      return res.status(400).json({ error: 'Name, reply contact, or business field exceeds maximum length.' });
    }
    if (safeWorkflow.length > 4500 || safeOutcome.length > 5000) {
      return res.status(400).json({ error: 'Workflow or outcome field exceeds maximum length.' });
    }

    // Preserve the current database schema while keeping the visitor's reply route
    // beside the workflow details consumed by the existing automation.
    const workflowWithContact = `Reply contact: ${safeContact}\n\n${safeWorkflow}`;

    // 5. Insert into Neon Postgres Database (Parameterized)
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not configured.');
    }
    const sql = neon(process.env.DATABASE_URL);
    
    await sql`
      INSERT INTO contact_submissions (name, business, workflow, outcome, status)
      VALUES (${safeName}, ${safeBusiness}, ${workflowWithContact}, ${safeOutcome}, 'pending')
    `;

    // 6. Return Clean Success Response
    return res.status(200).json({ success: true, message: 'Your message has been received.' });
  } catch (error: unknown) {
    return sendError(res, error, 'Contact form error');
  }
}
