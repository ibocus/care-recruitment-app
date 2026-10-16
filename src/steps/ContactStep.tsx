import { CheckboxGroupField, TextField } from '../components/fields';
import { CONTACT_METHOD_OPTIONS } from '../data/defaults';
import type { StepProps } from './StepProps';

export function ContactStep({ data, setData, errors }: StepProps) {
  const c = data.contact;
  const set = (patch: Partial<typeof c>) =>
    setData((prev) => ({ ...prev, contact: { ...prev.contact, ...patch } }));

  return (
    <div className="step">
      <h2 className="step__title">Contact details</h2>
      <p className="step__intro">Where can we reach you?</p>

      <TextField
        id="addressLine1"
        label="Address line 1"
        required
        value={c.addressLine1}
        onChange={(v) => set({ addressLine1: v })}
        autoComplete="address-line1"
        error={errors.addressLine1}
      />
      <div className="grid grid--2">
        <TextField
          id="addressLine2"
          label="Address line 2"
          value={c.addressLine2}
          onChange={(v) => set({ addressLine2: v })}
          autoComplete="address-line2"
        />
        <TextField
          id="addressLine3"
          label="Address line 3"
          value={c.addressLine3}
          onChange={(v) => set({ addressLine3: v })}
        />
      </div>
      <div className="grid grid--3">
        <TextField
          id="town"
          label="Town / city"
          required
          value={c.town}
          onChange={(v) => set({ town: v })}
          autoComplete="address-level2"
          error={errors.town}
        />
        <TextField id="county" label="County" value={c.county} onChange={(v) => set({ county: v })} />
        <TextField
          id="postcode"
          label="Postcode"
          required
          value={c.postcode}
          onChange={(v) => set({ postcode: v.toUpperCase() })}
          autoComplete="postal-code"
          error={errors.postcode}
        />
      </div>

      <div className="grid grid--2">
        <TextField
          id="mobileTel1"
          label="Mobile telephone"
          type="tel"
          required
          value={c.mobileTel1}
          onChange={(v) => set({ mobileTel1: v })}
          autoComplete="tel"
          error={errors.mobileTel1}
        />
        <TextField
          id="mobileTel2"
          label="Mobile telephone (alternative)"
          type="tel"
          value={c.mobileTel2}
          onChange={(v) => set({ mobileTel2: v })}
          error={errors.mobileTel2}
        />
      </div>
      <div className="grid grid--2">
        <TextField
          id="homeTel"
          label="Home telephone"
          type="tel"
          value={c.homeTel}
          onChange={(v) => set({ homeTel: v })}
          error={errors.homeTel}
        />
        <TextField
          id="workTel"
          label="Work telephone"
          type="tel"
          value={c.workTel}
          onChange={(v) => set({ workTel: v })}
          error={errors.workTel}
        />
      </div>
      <div className="grid grid--2">
        <TextField
          id="email1"
          label="Email address"
          type="email"
          required
          value={c.email1}
          onChange={(v) => set({ email1: v })}
          autoComplete="email"
          error={errors.email1}
        />
        <TextField
          id="email2"
          label="Email address (alternative)"
          type="email"
          value={c.email2}
          onChange={(v) => set({ email2: v })}
          error={errors.email2}
        />
      </div>

      <CheckboxGroupField
        id="preferredContactMethods"
        label="How can we contact you?"
        required
        value={c.preferredContactMethods}
        onChange={(v) => set({ preferredContactMethods: v })}
        options={CONTACT_METHOD_OPTIONS}
        error={errors.preferredContactMethods}
      />
    </div>
  );
}
