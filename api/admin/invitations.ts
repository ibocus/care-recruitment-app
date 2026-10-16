import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isClerkAPIResponseError } from '@clerk/backend/errors';
import { AuthError, getClerkClient, requireStaffAuth } from '../../server/adminAuth.js';

function isEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await requireStaffAuth(req);
  } catch (err) {
    res.status(401).json({ error: err instanceof AuthError ? err.message : 'Unauthorized' });
    return;
  }

  const email = (req.body as { email?: unknown })?.email;
  if (!isEmail(email)) {
    res.status(400).json({ error: 'Enter a valid email address' });
    return;
  }

  try {
    await getClerkClient().invitations.createInvitation({ emailAddress: email.trim() });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Failed to send invitation', err);
    const message = isClerkAPIResponseError(err)
      ? err.errors[0]?.longMessage ?? err.errors[0]?.message
      : err instanceof Error
        ? err.message
        : undefined;
    res.status(400).json({ error: message ?? 'Could not send invitation' });
  }
}
