import { TextField } from '../components/fields';
import { emptyEducationEntry } from '../data/defaults';
import type { EducationEntry } from '../types';
import type { StepProps } from './StepProps';

export function EducationStep({ data, setData }: StepProps) {
  const entries = data.education;

  const updateEntry = (id: string, patch: Partial<EducationEntry>) =>
    setData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));

  const addEntry = () =>
    setData((prev) => ({ ...prev, education: [...prev.education, emptyEducationEntry()] }));

  const removeEntry = (id: string) =>
    setData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));

  return (
    <div className="step">
      <h2 className="step__title">Education &amp; qualifications</h2>
      <p className="step__intro">
        Include schools, colleges, and any care-related certificates (e.g. NVQ/QCF Health &amp; Social Care, Care
        Certificate, First Aid).
      </p>

      {entries.map((entry, i) => (
        <div className="repeatable-card" key={entry.id}>
          <div className="repeatable-card__header">
            <h3 className="step__subtitle">Qualification {i + 1}</h3>
            {entries.length > 1 && (
              <button type="button" className="btn btn--ghost btn--small" onClick={() => removeEntry(entry.id)}>
                Remove
              </button>
            )}
          </div>
          <div className="grid grid--3">
            <TextField
              id={`institution-${entry.id}`}
              label="School / college / provider"
              value={entry.institution}
              onChange={(v) => updateEntry(entry.id, { institution: v })}
            />
            <TextField
              id={`qualification-${entry.id}`}
              label="Qualification"
              value={entry.qualification}
              onChange={(v) => updateEntry(entry.id, { qualification: v })}
            />
            <TextField
              id={`yearCompleted-${entry.id}`}
              label="Year completed"
              type="number"
              value={entry.yearCompleted}
              onChange={(v) => updateEntry(entry.id, { yearCompleted: v })}
            />
          </div>
        </div>
      ))}

      <button type="button" className="btn btn--secondary" onClick={addEntry}>
        + Add another qualification
      </button>
    </div>
  );
}
