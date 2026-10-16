import { SelectField, TextField, YesNoField, TextAreaField } from '../components/fields';
import { TITLE_OPTIONS } from '../data/defaults';
import type { StepProps } from './StepProps';

export function PersonalStep({ data, setData, errors }: StepProps) {
  const p = data.personal;
  const set = (patch: Partial<typeof p>) =>
    setData((prev) => ({ ...prev, personal: { ...prev.personal, ...patch } }));

  return (
    <div className="step">
      <h2 className="step__title">Personal details</h2>
      <p className="step__intro">Let's start with a few details about you.</p>

      <div className="grid grid--2">
        <SelectField
          id="title"
          label="Title"
          required
          value={p.title}
          onChange={(v) => set({ title: v })}
          options={TITLE_OPTIONS}
          error={errors.title}
        />
        <TextField
          id="preferredName"
          label="Preferred first name"
          value={p.preferredName}
          onChange={(v) => set({ preferredName: v })}
          hint="If different from your first name"
        />
      </div>

      <div className="grid grid--2">
        <TextField
          id="firstName"
          label="First name"
          required
          value={p.firstName}
          onChange={(v) => set({ firstName: v })}
          autoComplete="given-name"
          error={errors.firstName}
        />
        <TextField
          id="lastName"
          label="Last name"
          required
          value={p.lastName}
          onChange={(v) => set({ lastName: v })}
          autoComplete="family-name"
          error={errors.lastName}
        />
      </div>

      <div className="grid grid--2">
        <TextField
          id="maidenName"
          label="Maiden name"
          value={p.maidenName}
          onChange={(v) => set({ maidenName: v })}
          hint="If applicable"
        />
        <TextField
          id="dateOfBirth"
          label="Date of birth"
          type="date"
          required
          value={p.dateOfBirth}
          onChange={(v) => set({ dateOfBirth: v })}
          error={errors.dateOfBirth}
        />
      </div>

      <TextField
        id="nationalInsuranceNumber"
        label="National Insurance number"
        value={p.nationalInsuranceNumber}
        onChange={(v) => set({ nationalInsuranceNumber: v.toUpperCase() })}
        placeholder="QQ123456C"
        hint="Optional at this stage — you'll need it before your first day"
        error={errors.nationalInsuranceNumber}
      />

      <YesNoField
        id="previouslyApplied"
        label="Have you previously applied to us for any position within the past two years?"
        required
        value={p.previouslyApplied}
        onChange={(v) => set({ previouslyApplied: v })}
        error={errors.previouslyApplied}
      />

      <TextAreaField
        id="howDidYouHearAboutUs"
        label="How did you hear about us?"
        value={p.howDidYouHearAboutUs}
        onChange={(v) => set({ howDidYouHearAboutUs: v })}
        rows={2}
      />
    </div>
  );
}
