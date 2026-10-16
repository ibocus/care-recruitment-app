import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveApplication } from '../server/supabase.js';
import { sendApplicationEmail } from '../server/email.js';
import { sendWhatsAppNotification } from '../server/whatsapp.js';
import type { ApplicationData } from '../src/types.js';

function isApplicationData(value: unknown): value is ApplicationData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.personal === 'object' && typeof v.contact === 'object' && typeof v.declaration === 'object';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const data = req.body;
  if (!isApplicationData(data)) {
    res.status(400).json({ error: 'Invalid application payload' });
    return;
  }

  const prefix = (process.env.REFERENCE_PREFIX ?? 'APP').toUpperCase();
  const referenceId = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  const applicantName = [data.personal.firstName, data.personal.lastName].filter(Boolean).join(' ') || 'Unknown applicant';

  try {
    await saveApplication(referenceId, data);
  } catch (err) {
    console.error('Failed to save application', err);
    res.status(500).json({ error: 'Could not save your application. Please try again shortly.' });
    return;
  }

  // Notifications are best-effort: the application is already safely stored,
  // so a failed email/WhatsApp send shouldn't fail the whole request.
  const [emailResult, whatsappResult] = await Promise.allSettled([
    sendApplicationEmail(referenceId, data),
    sendWhatsAppNotification(referenceId, applicantName),
  ]);
  if (emailResult.status === 'rejected') console.error('Email notification failed', emailResult.reason);
  if (whatsappResult.status === 'rejected') console.error('WhatsApp notification failed', whatsappResult.reason);

  res.status(200).json({ referenceId });
}
