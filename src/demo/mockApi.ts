// Demo mode backend: answers the app's /api/* calls inside the browser, so
// the demo needs no Supabase, Clerk, Blob storage, email or WhatsApp.
// Pipeline moves go through the same applyPipelineAction rules the real API
// enforces, so the right to work gate and DBS-before-offer rule still apply.
import { applyPipelineAction, STAGE_LABELS, type PipelineAction, type PipelineState } from '../data/pipeline';
import type { ApplicationData, ApplicationRecord, ApplicationSummary, DocumentSlot } from '../types';
import { storageKey } from '../brand';
import { buildSeed, type DemoDocument } from './seed';

interface DemoDb {
  apps: ApplicationRecord[];
  docs: Record<string, DemoDocument>;
}

const DB_KEY = storageKey('demo-db');
const MAX_STORED_UPLOAD = 1.5 * 1024 * 1024; // keep browser storage small
let memoryDb: DemoDb | null = null;

function load(): DemoDb {
  if (memoryDb) return memoryDb;
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (raw) {
      memoryDb = JSON.parse(raw) as DemoDb;
      return memoryDb;
    }
  } catch {
    // fall through to a fresh seed
  }
  memoryDb = buildSeed();
  save(memoryDb);
  return memoryDb;
}

function save(db: DemoDb): void {
  memoryDb = db;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // storage full or unavailable: keep working in memory for this visit
  }
}

export function resetDemo(): void {
  memoryDb = null;
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(storageKey(''))) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // nothing stored
  }
}

export function notify(message: string): void {
  window.dispatchEvent(new CustomEvent('demo:notify', { detail: message }));
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const summary = (a: ApplicationRecord): ApplicationSummary => ({
  id: a.id,
  reference_id: a.reference_id,
  applicant_name: a.applicant_name,
  email: a.email,
  phone: a.phone,
  stage: a.stage,
  rtw_status: a.rtw_status,
  dbs_status: a.dbs_status,
  created_at: a.created_at,
});

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function placeholderDoc(name: string): DemoDocument {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="300"><rect width="700" height="300" fill="#f8fafc"/>
<text x="30" y="120" font-family="Arial" font-size="24" fill="#0f172a">${name}</text>
<text x="30" y="170" font-family="Arial" font-size="18" fill="#64748b">Large files are not kept in the demo. In the live system the</text>
<text x="30" y="200" font-family="Arial" font-size="18" fill="#64748b">original is stored privately and opened here for signed-in staff.</text></svg>`;
  return { contentType: 'image/svg+xml', dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` };
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

async function handle(method: string, url: URL, init?: RequestInit): Promise<Response> {
  const path = url.pathname;
  const db = load();

  if (path === '/api/apply' && method === 'POST') {
    const data = JSON.parse(String(init?.body ?? '{}')) as ApplicationData;
    const referenceId = `DEMO-${Date.now().toString(36).toUpperCase()}`;
    const name = [data.personal?.firstName, data.personal?.lastName].filter(Boolean).join(' ') || 'Unknown applicant';
    const now = new Date().toISOString();
    db.apps.unshift({
      id: `demo-${Date.now()}`,
      reference_id: referenceId,
      applicant_name: name,
      email: data.contact?.email1 ?? null,
      phone: data.contact?.mobileTel1 ?? null,
      stage: 'right_to_work_check',
      rtw_status: 'pending',
      dbs_status: 'pending',
      created_at: now,
      payload: data,
      closed_reason: null,
      stage_history: [{ stage: 'right_to_work_check', at: now, by: 'system', note: 'Application submitted' }],
    });
    save(db);
    notify(`Live system: HR now gets an email and WhatsApp — new application from ${name}. Open "Staff pipeline" to see it.`);
    return json(200, { referenceId });
  }

  if (path === '/api/documents/upload' && method === 'POST') {
    const draftId = url.searchParams.get('draftId') ?? 'draft';
    const slot = url.searchParams.get('slot') ?? 'document';
    const filename = url.searchParams.get('filename') || slot;
    const body = init?.body as Blob | undefined;
    if (!body || body.size === 0) return json(400, { error: 'No file received' });
    const contentType = body.type || 'application/octet-stream';
    const pathname = `demo/${draftId}/${slot}`;
    db.docs[pathname] =
      body.size <= MAX_STORED_UPLOAD ? { contentType, dataUrl: await fileToDataUrl(body) } : placeholderDoc(filename);
    save(db);
    return json(200, { pathname, originalName: filename, contentType, size: body.size, uploadedAt: new Date().toISOString() });
  }

  if (path === '/api/admin/applications' && method === 'GET') {
    const apps = [...db.apps].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(summary);
    return json(200, { applications: apps });
  }

  if (path === '/api/admin/invitations' && method === 'POST') {
    const { email } = JSON.parse(String(init?.body ?? '{}')) as { email?: string };
    notify(`Live system: an invitation email goes to ${email ?? 'the new staff member'} to set up their sign-in.`);
    return json(200, { ok: true });
  }

  const docMatch = path.match(/^\/api\/admin\/applications\/([^/]+)\/documents\/([^/]+)$/);
  if (docMatch && method === 'GET') {
    const app = db.apps.find((a) => a.id === decodeURIComponent(docMatch[1]));
    const doc = app?.payload.documents[docMatch[2] as DocumentSlot];
    if (!doc) return json(404, { error: 'Document not found' });
    const stored = db.docs[doc.pathname] ?? placeholderDoc(doc.originalName);
    return new Response(await dataUrlToBlob(stored.dataUrl), { status: 200, headers: { 'Content-Type': stored.contentType } });
  }

  const appMatch = path.match(/^\/api\/admin\/applications\/([^/]+)$/);
  if (appMatch) {
    const idx = db.apps.findIndex((a) => a.id === decodeURIComponent(appMatch[1]));
    if (idx < 0) return json(404, { error: 'Application not found' });
    const current = db.apps[idx];
    if (method === 'GET') return json(200, { application: current });
    if (method === 'PATCH') {
      const action = JSON.parse(String(init?.body ?? '{}')) as PipelineAction;
      const state: PipelineState = {
        stage: current.stage,
        rtwStatus: current.rtw_status,
        dbsStatus: current.dbs_status,
        closedReason: current.closed_reason ?? undefined,
        stageHistory: current.stage_history,
      };
      try {
        const next = applyPipelineAction(state, action, 'Demo Staff');
        const updated: ApplicationRecord = {
          ...current,
          stage: next.stage,
          rtw_status: next.rtwStatus,
          dbs_status: next.dbsStatus,
          closed_reason: next.closedReason ?? null,
          stage_history: next.stageHistory,
        };
        db.apps[idx] = updated;
        save(db);
        if (next.stage !== state.stage) {
          notify(`Live system: HR notified by email and WhatsApp — ${current.applicant_name} moved to ${STAGE_LABELS[next.stage]}.`);
        }
        return json(200, { application: updated });
      } catch (err) {
        return json(400, { error: err instanceof Error ? err.message : 'Could not update application' });
      }
    }
  }

  return json(404, { error: `Not available in the demo: ${method} ${path}` });
}

export function installMockApi(): void {
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    let url: URL | null = null;
    if (raw.startsWith('/api/')) {
      url = new URL(raw, 'https://demo.local');
    } else {
      try {
        const parsed = new URL(raw);
        if (parsed.origin === window.location.origin && parsed.pathname.startsWith('/api/')) url = parsed;
      } catch {
        url = null;
      }
    }
    if (!url) return realFetch(input, init);
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    // A short pause so the demo feels like a real network round trip.
    await new Promise((r) => setTimeout(r, 250));
    return handle(method, url, init);
  };
}
