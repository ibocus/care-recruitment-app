import { SelectField, TextField } from '../components/fields';
import { TITLE_OPTIONS } from '../data/defaults';
import type { StepProps } from './StepProps';

export function EmergencyContactStep({ data, setData, errors }: StepProps) {
  const ec = data.emergencyContact;
  const set = (patch: Partial<typeof ec>) =>
    setData((prev) => ({ ...prev, emergencyContact: { ...prev.emergencyContact, ...patch } }));

  return (
    <div className="step">
      <h2 className="step__title">Emergency contact / next of kin</h2>
      <p className="step__intro">Who should we contact in an emergency?</p>

      <div className="grid grid--3">
        <SelectField id="ecTitle" label="Title" value={ec.title} onChange={(v) => set({ title: v })} options={TITLE_OPTIONS} />
        <TextField
          id="ecFirstName"
          label="First name"
          required
          value={ec.firstName}
          onChange={(v) => set({ firstName: v })}
          error={errors.firstName}
        />
        <TextField
          id="ecLastName"
          label="Last name"
          required
          value={ec.lastName}
          onChange={(v) => set({ lastName: v })}
          error={errors.lastName}
        />
      </div>

      <TextField
        id="ecRelationship"
        label="Relationship to you"
        required
        value={ec.relationship}
        onChange={(v) => set({ relationship: v })}
        error={errors.relationship}
      />

      <TextField id="ecAddressLine1" label="Address line 1" value={ec.addressLine1} onChange={(v) => set({ addressLine1: v })} />
      <div className="grid grid--2">
        <TextField id="ecAddressLine2" label="Address line 2" value={ec.addressLine2} onChange={(v) => set({ addressLine2: v })} />
        <TextField id="ecAddressLine3" label="Address line 3" value={ec.addressLine3} onChange={(v) => set({ addressLine3: v })} />
      </div>
      <TextField id="ecPostcode" label="Postcode" value={ec.postcode} onChange={(v) => set({ postcode: v.toUpperCase() })} />

      <div className="grid grid--2">
        <TextField
          id="ecMobileTel1"
          label="Mobile telephone"
          type="tel"
          required
          value={ec.mobileTel1}
          onChange={(v) => set({ mobileTel1: v })}
          error={errors.mobileTel1}
        />
        <TextField id="ecMobileTel2" label="Mobile telephone (alternative)" type="tel" value={ec.mobileTel2} onChange={(v) => set({ mobileTel2: v })} />
      </div>
      <div className="grid grid--2">
        <TextField id="ecHomeTel" label="Home telephone" type="tel" value={ec.homeTel} onChange={(v) => set({ homeTel: v })} />
        <TextField id="ecWorkTel" label="Work telephone" type="tel" value={ec.workTel} onChange={(v) => set({ workTel: v })} />
      </div>
      <TextField id="ecEmail" label="Email" type="email" value={ec.email} onChange={(v) => set({ email: v })} />
    </div>
  );
}
