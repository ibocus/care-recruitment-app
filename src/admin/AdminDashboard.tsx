import { useCallback, useEffect, useState } from 'react';
import { fetchApplication, fetchApplications, fetchDocument, inviteStaff, sendPipelineAction } from './adminApi';
import {
  DBS_STATUS_LABELS,
  RTW_STATUS_LABELS,
  STAGE_LABELS,
  getAvailableActions,
  type ApplicationStage,
  type DbsStatus,
} from '../data/pipeline';
import type { ApplicationRecord, ApplicationSummary, DocumentSlot } from '../types';
import { DEMO_MODE } from '../brand';

const DOCUMENT_LABELS: Record<DocumentSlot, string> = {
  rightToWorkEvidence: 'Right to work evidence',
  dbsCertificate: 'Enhanced DBS certificate',
};

const STAGE_FILTERS: Array<{ id: ApplicationStage | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'right_to_work_check', label: STAGE_LABELS.right_to_work_check },
  { id: 'interview', label: STAGE_LABELS.interview },
  { id: 'references_dbs', label: STAGE_LABELS.references_dbs },
  { id: 'offer', label: STAGE_LABELS.offer },
  { id: 'closed_not_eligible', label: STAGE_LABELS.closed_not_eligible },
];

function StageBadge({ stage }: { stage: ApplicationStage }) {
  return <span className={`stage-badge stage-badge--${stage}`}>{STAGE_LABELS[stage]}</span>;
}

export function AdminDashboard({ getToken }: { getToken: () => Promise<string | null> }) {
  const [applications, setApplications] = useState<ApplicationSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApplicationStage | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ApplicationRecord | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null);

  const authedGetToken = useCallback(() => getToken(), [getToken]);

  const handleInvite = useCallback(async () => {
    const email = window.prompt("Invite a staff member — enter their email address:");
    if (!email || !email.trim()) return;
    setInviting(true);
    try {
      await inviteStaff(email.trim(), authedGetToken);
      window.alert(`Invitation sent to ${email.trim()}.`);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not send invitation');
    } finally {
      setInviting(false);
    }
  }, [authedGetToken]);

  const loadList = useCallback(async () => {
    try {
      const apps = await fetchApplications(authedGetToken);
      setApplications(apps);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load applications');
    }
  }, [authedGetToken]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openApplication = useCallback(
    async (id: string) => {
      setSelectedId(id);
      setActionError(null);
      setDetail(null);
      setDetailError(null);
      try {
        const app = await fetchApplication(id, authedGetToken);
        setDetail(app);
      } catch (err) {
        setDetailError(err instanceof Error ? err.message : 'Could not load application');
      }
    },
    [authedGetToken],
  );

  const runAction = useCallback(
    async (action: Parameters<typeof sendPipelineAction>[1], needsReason?: boolean) => {
      if (!selectedId) return;
      let finalAction = action;
      if (needsReason) {
        const reason = window.prompt('Reason (shown in the application history):') ?? undefined;
        finalAction = { ...action, reason } as typeof action;
      }
      setBusy(true);
      setActionError(null);
      try {
        const updated = await sendPipelineAction(selectedId, finalAction, authedGetToken);
        setDetail(updated);
        await loadList();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Could not update application');
      } finally {
        setBusy(false);
      }
    },
    [selectedId, authedGetToken, loadList],
  );

  const setDbsStatus = useCallback(
    (dbsStatus: DbsStatus) => runAction({ type: 'set_dbs_status', dbsStatus }),
    [runAction],
  );

  const viewDocument = useCallback(
    async (slot: DocumentSlot) => {
      if (!selectedId) return;
      try {
        const blob = await fetchDocument(selectedId, slot, authedGetToken);
        const url = URL.createObjectURL(blob);
        // Show the document in an in-page viewer: popups are often blocked,
        // and staff stay on the application while they check it.
        setPreview({ url, type: blob.type, name: DOCUMENT_LABELS[slot] });
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'Could not load document');
      }
    },
    [selectedId, authedGetToken],
  );

  const closePreview = useCallback(() => {
    setPreview((p) => {
      if (p) URL.revokeObjectURL(p.url);
      return null;
    });
  }, []);

  const filtered = (applications ?? []).filter((a) => filter === 'all' || a.stage === filter);

  return (
    <div className="admin-page">
      {preview && (
        <div className="doc-viewer" role="dialog" aria-modal="true" aria-label={preview.name}>
          <div className="doc-viewer__panel">
            <div className="doc-viewer__bar">
              <strong>{preview.name}</strong>
              <span>
                {!DEMO_MODE && (
                  <>
                    <a className="btn btn--ghost btn--small" href={preview.url} download>
                      Download
                    </a>{' '}
                  </>
                )}
                <button type="button" className="btn btn--secondary btn--small" onClick={closePreview}>
                  Close
                </button>
              </span>
            </div>
            {preview.type.startsWith('image/') ? (
              <img className="doc-viewer__content" src={preview.url} alt={preview.name} />
            ) : (
              <iframe className="doc-viewer__content" src={preview.url} title={preview.name} />
            )}
          </div>
        </div>
      )}
      <div className="admin-toolbar">
        <button type="button" className="btn btn--secondary btn--small" disabled={inviting} onClick={handleInvite}>
          {inviting ? 'Sending…' : '+ Invite staff'}
        </button>
      </div>

      <div className="admin-body">
        <aside className="admin-list-pane">
          <div className="admin-filters">
            {STAGE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`admin-filter ${filter === f.id ? 'admin-filter--active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {error && <p className="admin-error">{error}</p>}
          {!error && applications === null && <p className="admin-muted">Loading applications…</p>}
          {!error && applications !== null && filtered.length === 0 && (
            <p className="admin-muted">No applications at this stage.</p>
          )}

          <ul className="admin-list">
            {filtered.map((app) => (
              <li key={app.id}>
                <button
                  type="button"
                  className={`admin-list-item ${selectedId === app.id ? 'admin-list-item--active' : ''}`}
                  onClick={() => openApplication(app.id)}
                >
                  <span className="admin-list-item__name">{app.applicant_name || 'Unnamed applicant'}</span>
                  <span className="admin-list-item__ref">{app.reference_id}</span>
                  <StageBadge stage={app.stage} />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="admin-detail-pane">
          {!selectedId && <p className="admin-muted">Select an application to view details.</p>}
          {selectedId && detailError && <p className="admin-error">{detailError}</p>}
          {selectedId && !detail && !detailError && <p className="admin-muted">Loading…</p>}

          {detail && (
            <div className="admin-detail">
              <header className="admin-detail__header">
                <div>
                  <h2>{detail.applicant_name || 'Unnamed applicant'}</h2>
                  <p className="admin-muted">
                    {detail.reference_id} &middot; Submitted {new Date(detail.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <StageBadge stage={detail.stage} />
              </header>

              <dl className="admin-fact-grid">
                <div>
                  <dt>Email</dt>
                  <dd>{detail.email || '—'}</dd>
                </div>
                <div>
                  <dt>Mobile</dt>
                  <dd>{detail.phone || '—'}</dd>
                </div>
                <div>
                  <dt>Right to work</dt>
                  <dd>{RTW_STATUS_LABELS[detail.rtw_status]}</dd>
                </div>
                <div>
                  <dt>DBS route (applicant's choice)</dt>
                  <dd>{detail.payload.eligibility.dbsApplicationRoute || '—'}</dd>
                </div>
              </dl>

              <div className="admin-documents">
                {(Object.keys(DOCUMENT_LABELS) as DocumentSlot[]).map((slot) => {
                  const doc = detail.payload.documents[slot];
                  return (
                    <button
                      key={slot}
                      type="button"
                      className="btn btn--ghost btn--small"
                      disabled={!doc}
                      onClick={() => viewDocument(slot)}
                    >
                      {doc ? `View ${DOCUMENT_LABELS[slot]}` : `No ${DOCUMENT_LABELS[slot].toLowerCase()}`}
                    </button>
                  );
                })}
              </div>

              {detail.stage === 'references_dbs' && (
                <div className="admin-dbs-status">
                  <label htmlFor="dbs-status">DBS status</label>
                  <select
                    id="dbs-status"
                    value={detail.dbs_status}
                    disabled={busy}
                    onChange={(e) => setDbsStatus(e.target.value as DbsStatus)}
                  >
                    {Object.entries(DBS_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {detail.stage === 'closed_not_eligible' && detail.closed_reason && (
                <p className="admin-closed-reason">Closed: {detail.closed_reason}</p>
              )}

              {actionError && (
                <p className="admin-error" role="alert">
                  {actionError}
                </p>
              )}

              <div className="admin-actions">
                {getAvailableActions(detail.stage).map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    className={`btn ${opt.variant === 'danger' ? 'btn--danger' : 'btn--primary'}`}
                    disabled={busy}
                    onClick={() => runAction(opt.action, opt.needsReason)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <h3>History</h3>
              <ol className="admin-history">
                {detail.stage_history.map((h, i) => (
                  <li key={i}>
                    <span className="admin-history__stage">{STAGE_LABELS[h.stage]}</span>
                    <span className="admin-muted">
                      {new Date(h.at).toLocaleString('en-GB')} &middot; {h.by}
                    </span>
                    {h.note && <span className="admin-history__note">{h.note}</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
