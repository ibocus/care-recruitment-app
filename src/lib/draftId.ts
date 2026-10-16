import { storageKey } from '../brand';

const DRAFT_ID_KEY = storageKey('draft-id');

// A stable per-browser identifier for this in-progress application, used to
// namespace document uploads (right to work evidence, DBS certificate) that
// happen before the application itself is submitted and has a reference ID.
export function getOrCreateDraftId(): string {
  try {
    const existing = window.localStorage.getItem(DRAFT_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.localStorage.setItem(DRAFT_ID_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
