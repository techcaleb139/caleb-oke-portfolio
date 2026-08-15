import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { name, business, workflow, outcome } = req.body || {};

    if (!name || !workflow) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO contact_submissions (name, business, workflow, outcome, status)
      VALUES (${name}, ${business}, ${workflow}, ${outcome}, 'pending')
    `;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact submission failed:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
