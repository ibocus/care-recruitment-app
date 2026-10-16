import type { ApplicationData } from '../src/types.js';
import { STAGE_LABELS, type ApplicationStage } from '../src/data/pipeline.js';

function escapeHtml(value: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return value.replace(/[&<>"']/g, (c) => map[c]);
}

async function sendEmail(subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  const from = process.env.NOTIFY_EMAIL_FROM ?? 'Care Applications <onboarding@resend.dev>';
  if (!apiKey || !to) {
    throw new Error('Email is not configured: set RESEND_API_KEY and NOTIFY_EMAIL_TO');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
  }
}

function buildEmailHtml(referenceId: string, data: ApplicationData): string {
  const rows: [string, string][] = [
    ['Reference', referenceId],
    ['Name', [data.personal.title, data.personal.firstName, data.personal.lastName].filter(Boolean).join(' ')],
    ['Email', data.contact.email1],
    ['Mobile', data.contact.mobileTel1],
    ['Address', [data.contact.addressLine1, data.contact.town, data.contact.postcode].filter(Boolean).join(', ')],
    ['Right to work in UK', data.eligibility.rightToWorkUK],
    ['DBS application route', data.eligibility.dbsApplicationRoute],
    ['Earliest start date', data.preferences.availability.earliestStartDate],
  ];
  const rowsHtml = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#666">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`)
    .join('');
  return `
    <h2>New care worker application</h2>
    <table>${rowsHtml}</table>
    <p style="color:#666">Full details are stored in Supabase (table <code>applications</code>, reference <code>${escapeHtml(referenceId)}</code>).</p>
  `;
}

export async function sendApplicationEmail(referenceId: string, data: ApplicationData): Promise<void> {
  const applicantName =
    [data.personal.firstName, data.personal.lastName].filter(Boolean).join(' ') || 'Unknown applicant';
  await sendEmail(
    `New care worker application: ${applicantName} (${referenceId})`,
    buildEmailHtml(referenceId, data),
  );
}

export async function sendStageChangeEmail(
  referenceId: string,
  applicantName: string,
  fromStage: ApplicationStage,
  toStage: ApplicationStage,
  note: string | undefined,
): Promise<void> {
  const html = `
    <h2>${escapeHtml(applicantName)} — ${escapeHtml(STAGE_LABELS[toStage])}</h2>
    <p>Reference <code>${escapeHtml(referenceId)}</code> moved from
      <strong>${escapeHtml(STAGE_LABELS[fromStage])}</strong> to
      <strong>${escapeHtml(STAGE_LABELS[toStage])}</strong>.</p>
    ${note ? `<p style="color:#666">${escapeHtml(note)}</p>` : ''}
    <p style="color:#666">View it in the <a href="${escapeHtml((process.env.APP_URL ?? '').replace(/\/$/, ''))}/admin">admin panel</a>.</p>
  `;
  await sendEmail(`${applicantName} → ${STAGE_LABELS[toStage]} (${referenceId})`, html);
}
