import { TextField } from '../components/fields';
import type { ReferenceContact } from '../types';
import type { StepProps } from './StepProps';

export function ReferencesStep({ data, setData, errors }: StepProps) {
  const updateReference = (index: 0 | 1, patch: Partial<ReferenceContact>) =>
    setData((prev) => {
      const references = [...prev.references] as [ReferenceContact, ReferenceContact];
      references[index] = { ...references[index], ...patch };
      return { ...prev, references };
    });

  return (
    <div className="step">
      <h2 className="step__title">References</h2>
      <p className="step__intro">
        Please provide two professional references who can comment on your care experience (not family members).
      </p>

      {([0, 1] as const).map((index) => {
        const ref = data.references[index];
        return (
          <div className="repeatable-card" key={index}>
            <h3 className="step__subtitle">Reference {index + 1}</h3>
            <div className="grid grid--2">
              <TextField
                id={`refName-${index}`}
                label="Full name"
                required
                value={ref.fullName}
                onChange={(v) => updateReference(index, { fullName: v })}
                error={errors[`references.${index}.fullName`]}
              />
              <TextField
                id={`refRelationship-${index}`}
                label="Relationship to you"
                required
                value={ref.relationship}
                onChange={(v) => updateReference(index, { relationship: v })}
                placeholder="e.g. Line manager, Care coordinator"
                error={errors[`references.${index}.relationship`]}
              />
            </div>
            <div className="grid grid--2">
              <TextField
                id={`refCompany-${index}`}
                label="Company / organisation"
                value={ref.company}
                onChange={(v) => updateReference(index, { company: v })}
              />
              <TextField
                id={`refPosition-${index}`}
                label="Their job title"
                value={ref.position}
                onChange={(v) => updateReference(index, { position: v })}
              />
            </div>
            <div className="grid grid--3">
              <TextField
                id={`refPhone-${index}`}
                label="Phone"
                type="tel"
                value={ref.phone}
                onChange={(v) => updateReference(index, { phone: v })}
                error={errors[`references.${index}.phone`]}
                hint="Provide a phone or an email"
              />
              <TextField
                id={`refEmail-${index}`}
                label="Email"
                type="email"
                value={ref.email}
                onChange={(v) => updateReference(index, { email: v })}
                error={errors[`references.${index}.email`]}
              />
              <TextField
                id={`refYearsKnown-${index}`}
                label="Years known"
                type="number"
                value={ref.yearsKnown}
                onChange={(v) => updateReference(index, { yearsKnown: v })}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
