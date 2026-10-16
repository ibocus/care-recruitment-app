import type { ApplicationData } from '../types';

export async function submitApplication(data: ApplicationData): Promise<{ referenceId: string }> {
  const res = await fetch('/api/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Submission failed (${res.status})`);
  }

  return res.json();
}
