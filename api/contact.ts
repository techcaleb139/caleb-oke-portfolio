import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Enforce POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { name, business, workflow, outcome } = req.body || {};

    // 2. Input Validation (Basic)
    if (!name || !workflow) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 3. Insert into Neon Postgres Database
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      INSERT INTO contact_submissions (name, business, workflow, outcome, status)
      VALUES (${name}, ${business}, ${workflow}, ${outcome}, 'pending')
    `;

    // 4. Send to n8n webhook (with timeout)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (n8nWebhookUrl) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      try {
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, business, workflow, outcome, source: 'Portfolio Contact Form' }),
          signal: controller.signal
        });
        
        if (!response.ok) {
          console.warn(`n8n webhook responded with status: ${response.status}`);
        }
      } catch (webhookError: any) {
         console.warn('n8n webhook failed:', webhookError);
      } finally {
        clearTimeout(timeoutId);
      }
    } else {
      console.warn('N8N_WEBHOOK_URL is not set. Skipped webhook dispatch.');
    }

    return res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'An internal error occurred while processing your request.' });
  }
}
