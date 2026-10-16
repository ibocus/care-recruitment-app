import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AuthError, requireStaffAuth } from '../../../server/adminAuth.js';
import { listApplications } from '../../../server/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await requireStaffAuth(req);
  } catch (err) {
    res.status(401).json({ error: err instanceof AuthError ? err.message : 'Unauthorized' });
    return;
  }

  try {
    const applications = await listApplications();
    res.status(200).json({ applications });
  } catch (err) {
    console.error('Failed to list applications', err);
    res.status(500).json({ error: 'Could not load applications' });
  }
}
