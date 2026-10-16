import { Readable } from 'node:stream';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { get } from '@vercel/blob';
import { AuthError, requireStaffAuth } from '../../../../../server/adminAuth.js';
import { getApplication } from '../../../../../server/supabase.js';
import type { DocumentSlot } from '../../../../../src/types.js';

const SLOTS: DocumentSlot[] = ['rightToWorkEvidence', 'dbsCertificate'];

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

  const { id, slot } = req.query;
  if (typeof id !== 'string' || typeof slot !== 'string' || !SLOTS.includes(slot as DocumentSlot)) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  try {
    const application = await getApplication(id);
    const doc = application.payload.documents[slot as DocumentSlot];
    if (!doc) {
      res.status(404).json({ error: 'No document uploaded for this slot' });
      return;
    }

    const blob = await get(doc.pathname, { access: 'private' });
    if (!blob || blob.statusCode !== 200) {
      res.status(404).json({ error: 'Document not found in storage' });
      return;
    }

    res.setHeader('Content-Type', doc.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName.replace(/["\\]/g, '_')}"`);
    Readable.fromWeb(blob.stream).pipe(res);
  } catch (err) {
    console.error('Failed to load document', err);
    res.status(500).json({ error: 'Could not load document' });
  }
}
