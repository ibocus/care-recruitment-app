import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};
const MAX_BYTES = 10 * 1024 * 1024;
const DRAFT_ID_RE = /^[a-z0-9-]{8,64}$/i;
const SLOTS = ['rightToWorkEvidence', 'dbsCertificate'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { draftId, slot, filename } = req.query;
  if (typeof draftId !== 'string' || !DRAFT_ID_RE.test(draftId)) {
    res.status(400).json({ error: 'Invalid draft id' });
    return;
  }
  if (typeof slot !== 'string' || !SLOTS.includes(slot)) {
    res.status(400).json({ error: 'Invalid document slot' });
    return;
  }

  const contentType = req.headers['content-type'] ?? '';
  const extension = ALLOWED_TYPES[contentType];
  if (!extension) {
    res.status(400).json({ error: 'Please upload a JPG, PNG or PDF file' });
    return;
  }

  const body = Buffer.isBuffer(req.body) ? req.body : await readRawBody(req);
  if (body.length === 0) {
    res.status(400).json({ error: 'No file received' });
    return;
  }
  if (body.length > MAX_BYTES) {
    res.status(413).json({ error: 'File is too large (max 10MB)' });
    return;
  }

  try {
    const blob = await put(`applications/${draftId}/${slot}.${extension}`, body, {
      access: 'private',
      contentType,
      allowOverwrite: true,
    });
    res.status(200).json({
      pathname: blob.pathname,
      originalName: typeof filename === 'string' && filename.trim() ? filename.trim() : `${slot}.${extension}`,
      contentType,
      size: body.length,
      uploadedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Document upload failed', err);
    res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
}
