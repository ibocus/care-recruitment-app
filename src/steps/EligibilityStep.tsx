import { useMemo } from 'react';
import { CheckboxField, SelectField, YesNoField } from '../components/fields';
import { FileUploadField } from '../components/FileUploadField';
import { DBS_ROUTE_OPTIONS } from '../data/defaults';
import { getOrCreateDraftId } from '../lib/draftId';
import type { StepProps } from './StepProps';
import type { ApplicationDocuments } from '../types';

export function EligibilityStep({ data, setData, errors }: StepProps) {
  const e = data.eligibility;
  const draftId = useMemo(() => getOrCreateDraftId(), []);
  const set = (patch: Partial<typeof e>) =>
    setData((prev) => ({ ...prev, eligibility: { ...prev.eligibility, ...patch } }));
  const setDocument = (slot: 'rightToWorkEvidence' | 'dbsCertificate', value: ApplicationDocuments[typeof slot]) =>
    setData((prev) => ({ ...prev, documents: { ...prev.documents, [slot]: value } }));

  return (
    <div className="step">
      <h2 className="step__title">Right to work &amp; eligibility</h2>
      <p className="step__intro">
        UK care regulations require us to confirm a few things before we can progress your application.
      </p>

      <YesNoField
        id="rightToWorkUK"
        label="Do you have the right to work in the UK?"
        required
        value={e.rightToWorkUK}
        onChange={(v) => set({ rightToWorkUK: v })}
        error={errors.rightToWorkUK}
      />

      <FileUploadField
        id="rightToWorkEvidence"
        label="Upload evidence of your right to work"
        required
        hint="A passport photo page, biometric residence permit, or share code result. JPG, PNG or PDF, up to 10MB."
        draftId={draftId}
        slot="rightToWorkEvidence"
        value={data.documents.rightToWorkEvidence}
        onChange={(v) => setDocument('rightToWorkEvidence', v)}
        error={errors.rightToWorkEvidence}
      />

      <YesNoField
        id="requiresSponsorship"
        label="Will you now, or in the future, require visa sponsorship?"
        value={e.requiresSponsorship}
        onChange={(v) => set({ requiresSponsorship: v })}
      />
      <YesNoField
        id="hasDrivingLicence"
        label="Do you hold a full UK driving licence?"
        required
        value={e.hasDrivingLicence}
        onChange={(v) => set({ hasDrivingLicence: v })}
        error={errors.hasDrivingLicence}
      />
      <YesNoField
        id="hasOwnTransport"
        label="Do you have access to your own transport?"
        required
        value={e.hasOwnTransport}
        onChange={(v) => set({ hasOwnTransport: v })}
        error={errors.hasOwnTransport}
      />
      <YesNoField
        id="hasEnhancedDbs"
        label="Do you already hold an Enhanced DBS certificate (on the update service)?"
        value={e.hasEnhancedDbs}
        onChange={(v) => set({ hasEnhancedDbs: v, dbsApplicationRoute: v === 'yes' ? '' : e.dbsApplicationRoute })}
      />

      {e.hasEnhancedDbs === 'yes' && (
        <FileUploadField
          id="dbsCertificate"
          label="Upload your Enhanced DBS certificate"
          hint="Optional now — you can also bring the original to interview. JPG, PNG or PDF, up to 10MB."
          draftId={draftId}
          slot="dbsCertificate"
          value={data.documents.dbsCertificate}
          onChange={(v) => setDocument('dbsCertificate', v)}
        />
      )}

      {e.hasEnhancedDbs !== 'yes' && (
        <SelectField
          id="dbsApplicationRoute"
          label="How would you like to complete your Enhanced DBS check?"
          required
          value={e.dbsApplicationRoute}
          onChange={(v) => set({ dbsApplicationRoute: v })}
          options={DBS_ROUTE_OPTIONS}
          error={errors.dbsApplicationRoute}
        />
      )}

      <CheckboxField
        id="consentToDbsCheck"
        checked={e.consentToDbsCheck}
        onChange={(v) => set({ consentToDbsCheck: v })}
        error={errors.consentToDbsCheck}
        label="I understand that any offer of employment is subject to a satisfactory Enhanced DBS check and reference checks, and I consent to these being carried out."
      />
    </div>
  );
}
