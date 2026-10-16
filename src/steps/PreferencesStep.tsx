import { CheckboxGroupField, TextAreaField, TextField, YesNoField } from '../components/fields';
import { DAY_OPTIONS, SHIFT_OPTIONS } from '../data/defaults';
import type { StepProps } from './StepProps';

export function PreferencesStep({ data, setData, errors }: StepProps) {
  const pr = data.preferences;
  const set = (patch: Partial<typeof pr>) =>
    setData((prev) => ({ ...prev, preferences: { ...prev.preferences, ...patch } }));
  const setAvailability = (patch: Partial<typeof pr.availability>) =>
    setData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, availability: { ...prev.preferences.availability, ...patch } },
    }));

  return (
    <div className="step">
      <h2 className="step__title">Preferences &amp; availability</h2>
      <p className="step__intro">This helps us match you to clients and shifts that suit you well.</p>

      <TextField
        id="languagesSpoken"
        label="Languages spoken"
        value={pr.languagesSpoken}
        onChange={(v) => set({ languagesSpoken: v })}
      />

      <div className="grid grid--2">
        <YesNoField
          id="canCook"
          label="Can you cook?"
          required
          value={pr.canCook}
          onChange={(v) => set({ canCook: v })}
          error={errors.canCook}
        />
        <YesNoField
          id="hasCulturalMeatRestriction"
          label="Are you vegetarian or do you have cultural reasons for not handling certain meat?"
          value={pr.hasCulturalMeatRestriction}
          onChange={(v) => set({ hasCulturalMeatRestriction: v })}
        />
      </div>

      {pr.hasCulturalMeatRestriction === 'yes' && (
        <YesNoField
          id="willingToCookMeatIfRestricted"
          label="Would you be prepared to cook meat for a client if needed? We're happy to discuss this at interview."
          value={pr.willingToCookMeatIfRestricted}
          onChange={(v) => set({ willingToCookMeatIfRestricted: v })}
        />
      )}

      <div className="grid grid--2">
        <YesNoField
          id="willingToCareForPetOwners"
          label="Are you prepared to look after clients' pets?"
          required
          value={pr.willingToCareForPetOwners}
          onChange={(v) => set({ willingToCareForPetOwners: v })}
          error={errors.willingToCareForPetOwners}
        />
        <YesNoField
          id="isSmoker"
          label="Are you a smoker?"
          required
          value={pr.isSmoker}
          onChange={(v) => set({ isSmoker: v })}
          error={errors.isSmoker}
        />
      </div>

      {pr.isSmoker === 'no' && (
        <YesNoField
          id="willingToCareForSmokers"
          label="Are you prepared to care for clients who smoke?"
          value={pr.willingToCareForSmokers}
          onChange={(v) => set({ willingToCareForSmokers: v })}
        />
      )}

      <TextAreaField
        id="leisureInterests"
        label="Leisure interests / activities"
        value={pr.leisureInterests}
        onChange={(v) => set({ leisureInterests: v })}
        hint="Include any community or voluntary experience"
      />
      <TextAreaField
        id="publicDuties"
        label="Public duties"
        value={pr.publicDuties}
        onChange={(v) => set({ publicDuties: v })}
        hint="e.g. Justice of the Peace, local councillor, school governor, prison visitor"
        rows={2}
      />

      <h3 className="step__subtitle">Availability</h3>
      <div className="grid grid--2">
        <TextField
          id="earliestStartDate"
          label="Earliest start date"
          type="date"
          required
          value={pr.availability.earliestStartDate}
          onChange={(v) => setAvailability({ earliestStartDate: v })}
          error={errors['availability.earliestStartDate']}
        />
        <TextField
          id="maxHoursPerWeek"
          label="Maximum hours per week"
          type="number"
          value={pr.availability.maxHoursPerWeek}
          onChange={(v) => setAvailability({ maxHoursPerWeek: v })}
        />
      </div>
      <CheckboxGroupField
        id="availabilityDays"
        label="Days available"
        required
        value={pr.availability.days}
        onChange={(v) => setAvailability({ days: v })}
        options={DAY_OPTIONS}
        error={errors['availability.days']}
      />
      <CheckboxGroupField
        id="availabilityShiftTypes"
        label="Shift types"
        required
        value={pr.availability.shiftTypes}
        onChange={(v) => setAvailability({ shiftTypes: v })}
        options={SHIFT_OPTIONS}
        error={errors['availability.shiftTypes']}
      />
    </div>
  );
}
