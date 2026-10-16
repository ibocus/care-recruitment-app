import { BRAND } from '../brand';
import { CheckboxField, TextAreaField, TextField, YesNoField } from '../components/fields';
import type { StepProps } from './StepProps';

export function DeclarationStep({ data, setData, errors }: StepProps) {
  const d = data.declaration;
  const set = (patch: Partial<typeof d>) =>
    setData((prev) => ({ ...prev, declaration: { ...prev.declaration, ...patch } }));

  return (
    <div className="step">
      <h2 className="step__title">Declaration &amp; consent</h2>
      <p className="step__intro">Almost done. Please read and confirm the following before submitting.</p>

      <YesNoField
        id="hasCriminalConvictions"
        label="Do you have any unspent criminal convictions?"
        required
        value={d.hasCriminalConvictions}
        onChange={(v) => set({ hasCriminalConvictions: v })}
        error={errors.hasCriminalConvictions}
      />
      {d.hasCriminalConvictions === 'yes' && (
        <TextAreaField
          id="convictionDetails"
          label="Please provide details"
          required
          value={d.convictionDetails}
          onChange={(v) => set({ convictionDetails: v })}
          error={errors.convictionDetails}
        />
      )}

      <YesNoField
        id="hasHealthConditionAffectingWork"
        label="Do you have any health conditions that may affect your ability to carry out care work?"
        required
        value={d.hasHealthConditionAffectingWork}
        onChange={(v) => set({ hasHealthConditionAffectingWork: v })}
        error={errors.hasHealthConditionAffectingWork}
      />
      {d.hasHealthConditionAffectingWork === 'yes' && (
        <TextAreaField
          id="healthDetails"
          label="Please provide details"
          required
          value={d.healthDetails}
          onChange={(v) => set({ healthDetails: v })}
          error={errors.healthDetails}
        />
      )}

      <div className="declaration-box">
        <CheckboxField
          id="informationAccurate"
          checked={d.informationAccurate}
          onChange={(v) => set({ informationAccurate: v })}
          error={errors.informationAccurate}
          label="I confirm that the information given in this application is true, complete, and accurate to the best of my knowledge."
        />
        <CheckboxField
          id="consentToReferenceChecks"
          checked={d.consentToReferenceChecks}
          onChange={(v) => set({ consentToReferenceChecks: v })}
          error={errors.consentToReferenceChecks}
          label={`I consent to ${BRAND.name} contacting the references I have provided.`}
        />
        <CheckboxField
          id="consentToDataProcessing"
          checked={d.consentToDataProcessing}
          onChange={(v) => set({ consentToDataProcessing: v })}
          error={errors.consentToDataProcessing}
          label={`I consent to ${BRAND.name} processing the personal data in this application for recruitment purposes, in line with their privacy policy.`}
        />
      </div>

      <div className="grid grid--2">
        <TextField
          id="signatureFullName"
          label="Type your full name to sign"
          required
          value={d.signatureFullName}
          onChange={(v) => set({ signatureFullName: v })}
          error={errors.signatureFullName}
        />
        <TextField
          id="signatureDate"
          label="Date"
          type="date"
          required
          value={d.signatureDate}
          onChange={(v) => set({ signatureDate: v })}
          error={errors.signatureDate}
        />
      </div>
    </div>
  );
}
