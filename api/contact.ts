import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Enforce POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { name, email, company, message, _honeypot } = req.body || {};

    // 2. Basic Spam Protection (Honeypot)
    if (_honeypot && _honeypot.trim() !== '') {
      // If a bot filled out the hidden honeypot field, return success without doing anything
      return res.status(200).json({ success: true, message: 'Message received.' });
    }

    // 3. Input Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Valid name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters long.' });
    }

    // 4. Send to n8n webhook (with timeout)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      console.warn('N8N_WEBHOOK_URL is not set. Simulating success for portfolio testing.');
      return res.status(200).json({ success: true, message: 'Message validated (n8n URL not configured).' });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, company, message, source: 'Portfolio Contact Form' }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`n8n webhook responded with status: ${response.status}`);
    }

    return res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (error: any) {
    console.error('Contact form error:', error);
    
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Request to automation server timed out. Please try again.' });
    }
    
    return res.status(500).json({ error: 'An internal error occurred while processing your request.' });
  }
}
