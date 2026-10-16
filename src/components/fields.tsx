import type { ChangeEvent, ReactNode, TextareaHTMLAttributes } from 'react';

export interface BaseProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
}

export function FieldShell({
  id,
  label,
  error,
  required,
  hint,
  className,
  children,
}: BaseProps & { children: ReactNode }) {
  return (
    <div className={`field ${className ?? ''} ${error ? 'field--error' : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {required && <span className="field__required" aria-hidden="true"> *</span>}
      </label>
      {hint && <p className="field__hint" id={`${id}-hint`}>{hint}</p>}
      {children}
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
}

export function TextField({
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  maxLength,
  ...shell
}: TextFieldProps) {
  return (
    <FieldShell {...shell}>
      <input
        id={shell.id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        aria-invalid={!!shell.error}
        aria-describedby={shell.error ? `${shell.id}-error` : shell.hint ? `${shell.id}-hint` : undefined}
        className="field__input"
      />
    </FieldShell>
  );
}

interface TextAreaFieldProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  rows?: TextareaHTMLAttributes<HTMLTextAreaElement>['rows'];
  placeholder?: string;
}

export function TextAreaField({ value, onChange, rows = 4, placeholder, ...shell }: TextAreaFieldProps) {
  return (
    <FieldShell {...shell}>
      <textarea
        id={shell.id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!shell.error}
        aria-describedby={shell.error ? `${shell.id}-error` : shell.hint ? `${shell.id}-hint` : undefined}
        className="field__input field__textarea"
      />
    </FieldShell>
  );
}

interface SelectFieldProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export function SelectField({ value, onChange, options, placeholder = 'Select…', ...shell }: SelectFieldProps) {
  return (
    <FieldShell {...shell}>
      <select
        id={shell.id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!shell.error}
        className="field__input field__select"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface YesNoFieldProps extends BaseProps {
  value: 'yes' | 'no' | '';
  onChange: (value: 'yes' | 'no') => void;
}

export function YesNoField({ value, onChange, ...shell }: YesNoFieldProps) {
  return (
    <FieldShell {...shell}>
      <div className="field__toggle-group" role="radiogroup" aria-labelledby={`${shell.id}-label`}>
        {(['yes', 'no'] as const).map((opt) => (
          <button
            type="button"
            key={opt}
            role="radio"
            aria-checked={value === opt}
            className={`toggle-btn ${value === opt ? 'toggle-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </FieldShell>
  );
}

interface CheckboxGroupFieldProps extends BaseProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
}

export function CheckboxGroupField({ value, onChange, options, ...shell }: CheckboxGroupFieldProps) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };
  return (
    <FieldShell {...shell}>
      <div className="field__chip-group">
        {options.map((opt) => (
          <button
            type="button"
            key={opt}
            className={`chip ${value.includes(opt) ? 'chip--active' : ''}`}
            aria-pressed={value.includes(opt)}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </FieldShell>
  );
}

interface CheckboxFieldProps {
  id: string;
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function CheckboxField({ id, label, checked, onChange, error }: CheckboxFieldProps) {
  return (
    <div className={`field field--checkbox ${error ? 'field--error' : ''}`}>
      <label htmlFor={id} className="checkbox-label">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
