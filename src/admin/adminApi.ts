import type { PipelineAction } from '../data/pipeline';
import type { ApplicationRecord, ApplicationSummary, DocumentSlot } from '../types';

type GetToken = () => Promise<string | null>;

async function authedFetch(path: string, getToken: GetToken, init?: RequestInit): Promise<Response> {
  const token = await getToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
      Authorization: `Bearer ${token ?? ''}`,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res;
}

export async function fetchApplications(getToken: GetToken): Promise<ApplicationSummary[]> {
  const res = await authedFetch('/api/admin/applications', getToken);
  const body = (await res.json()) as { applications: ApplicationSummary[] };
  return body.applications;
}

export async function fetchApplication(id: string, getToken: GetToken): Promise<ApplicationRecord> {
  const res = await authedFetch(`/api/admin/applications/${id}`, getToken);
  const body = (await res.json()) as { application: ApplicationRecord };
  return body.application;
}

export async function fetchDocument(id: string, slot: DocumentSlot, getToken: GetToken): Promise<Blob> {
  const res = await authedFetch(`/api/admin/applications/${id}/documents/${slot}`, getToken);
  return res.blob();
}

export async function inviteStaff(email: string, getToken: GetToken): Promise<void> {
  await authedFetch('/api/admin/invitations', getToken, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function sendPipelineAction(
  id: string,
  action: PipelineAction,
  getToken: GetToken,
): Promise<ApplicationRecord> {
  const res = await authedFetch(`/api/admin/applications/${id}`, getToken, {
    method: 'PATCH',
    body: JSON.stringify(action),
  });
  const body = (await res.json()) as { application: ApplicationRecord };
  return body.application;
}
