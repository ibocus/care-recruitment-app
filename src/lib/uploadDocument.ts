import type { DocumentSlot, UploadedDocument } from '../types';

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_DOCUMENT_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export async function uploadDocument(
  draftId: string,
  slot: DocumentSlot,
  file: File,
): Promise<UploadedDocument> {
  if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG or PDF file');
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new Error('File is too large (max 10MB)');
  }

  const params = new URLSearchParams({ draftId, slot, filename: file.name });
  const res = await fetch(`/api/documents/upload?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Upload failed. Please try again.');
  }
  return res.json();
}
