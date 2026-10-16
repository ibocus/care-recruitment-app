import { CheckboxField, TextAreaField, TextField } from '../components/fields';
import { emptyEmploymentEntry } from '../data/defaults';
import type { EmploymentEntry } from '../types';
import type { StepProps } from './StepProps';

export function EmploymentStep({ data, setData, errors }: StepProps) {
  const entries = data.employmentHistory;

  const updateEntry = (id: string, patch: Partial<EmploymentEntry>) =>
    setData((prev) => ({
      ...prev,
      employmentHistory: prev.employmentHistory.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));

  const addEntry = () =>
    setData((prev) => ({ ...prev, employmentHistory: [...prev.employmentHistory, emptyEmploymentEntry()] }));

  const removeEntry = (id: string) =>
    setData((prev) => ({ ...prev, employmentHistory: prev.employmentHistory.filter((e) => e.id !== id) }));

  return (
    <div className="step">
      <h2 className="step__title">Employment history</h2>
      <p className="step__intro">
        Please list your most recent employers first. At least one employer is required; extra
        blank rows are ignored.
      </p>

      {entries.map((entry, i) => (
        <div className="repeatable-card" key={entry.id}>
          <div className="repeatable-card__header">
            <h3 className="step__subtitle">Employer {i + 1}</h3>
            {entries.length > 1 && (
              <button type="button" className="btn btn--ghost btn--small" onClick={() => removeEntry(entry.id)}>
                Remove
              </button>
            )}
          </div>
          <div className="grid grid--2">
            <TextField
              id={`employer-${entry.id}`}
              label="Employer name"
              value={entry.employer}
              onChange={(v) => updateEntry(entry.id, { employer: v })}
              error={errors[`employmentHistory.${i}.employer`]}
            />
            <TextField
              id={`jobTitle-${entry.id}`}
              label="Job title"
              value={entry.jobTitle}
              onChange={(v) => updateEntry(entry.id, { jobTitle: v })}
              error={errors[`employmentHistory.${i}.jobTitle`]}
            />
          </div>
          <div className="grid grid--3">
            <TextField
              id={`startDate-${entry.id}`}
              label="Start date"
              type="date"
              value={entry.startDate}
              onChange={(v) => updateEntry(entry.id, { startDate: v })}
              error={errors[`employmentHistory.${i}.startDate`]}
            />
            <TextField
              id={`endDate-${entry.id}`}
              label="End date"
              type="date"
              value={entry.endDate}
              onChange={(v) => updateEntry(entry.id, { endDate: v })}
              error={errors[`employmentHistory.${i}.endDate`]}
            />
            <div className="field field--checkbox-inline">
              <CheckboxField
                id={`stillEmployed-${entry.id}`}
                checked={entry.stillEmployed}
                onChange={(v) => updateEntry(entry.id, { stillEmployed: v, endDate: v ? '' : entry.endDate })}
                label="I still work here"
              />
            </div>
          </div>
          <TextField
            id={`reasonForLeaving-${entry.id}`}
            label="Reason for leaving"
            value={entry.reasonForLeaving}
            onChange={(v) => updateEntry(entry.id, { reasonForLeaving: v })}
          />
          <TextAreaField
            id={`dutiesSummary-${entry.id}`}
            label="Summary of duties"
            value={entry.dutiesSummary}
            onChange={(v) => updateEntry(entry.id, { dutiesSummary: v })}
            rows={3}
          />
        </div>
      ))}

      <button type="button" className="btn btn--secondary" onClick={addEntry}>
        + Add another employer
      </button>
    </div>
  );
}
