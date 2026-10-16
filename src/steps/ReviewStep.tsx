import { STEPS } from '../data/defaults';
import type { ApplicationData } from '../types';

interface ReviewRow {
  label: string;
  value: string;
}

function row(label: string, value: string | number | undefined | null): ReviewRow | null {
  const v = value === undefined || value === null ? '' : String(value).trim();
  if (!v) return null;
  return { label, value: v };
}

function buildSections(data: ApplicationData) {
  const yn = (v: string) => (v === 'yes' ? 'Yes' : v === 'no' ? 'No' : '');

  return [
    {
      stepId: 'personal',
      title: 'Personal details',
      rows: [
        row('Name', [data.personal.title, data.personal.firstName, data.personal.lastName].filter(Boolean).join(' ')),
        row('Preferred name', data.personal.preferredName),
        row('Date of birth', data.personal.dateOfBirth),
        row('National Insurance number', data.personal.nationalInsuranceNumber),
        row('Previously applied', yn(data.personal.previouslyApplied)),
        row('How they heard about us', data.personal.howDidYouHearAboutUs),
      ].filter(Boolean) as ReviewRow[],
    },
    {
      stepId: 'contact',
      title: 'Contact details',
      rows: [
        row(
          'Address',
          [data.contact.addressLine1, data.contact.addressLine2, data.contact.addressLine3, data.contact.town, data.contact.county, data.contact.postcode]
            .filter(Boolean)
            .join(', '),
        ),
        row('Mobile', data.contact.mobileTel1),
        row('Email', data.contact.email1),
        row('Preferred contact methods', data.contact.preferredContactMethods.join(', ')),
      ].filter(Boolean) as ReviewRow[],
    },
    {
      stepId: 'eligibility',
      title: 'Right to work & eligibility',
      rows: [
        row('Right to work in UK', yn(data.eligibility.rightToWorkUK)),
        row('Right to work evidence', data.documents.rightToWorkEvidence?.originalName),
        row('Driving licence', yn(data.eligibility.hasDrivingLicence)),
        row('Own transport', yn(data.eligibility.hasOwnTransport)),
        row('Enhanced DBS held', yn(data.eligibility.hasEnhancedDbs)),
        row('DBS application route', data.eligibility.dbsApplicationRoute),
        row('DBS certificate uploaded', data.documents.dbsCertificate?.originalName),
        row('Consents to DBS check', data.eligibility.consentToDbsCheck ? 'Yes' : ''),
      ].filter(Boolean) as ReviewRow[],
    },
    {
      stepId: 'preferences',
      title: 'Preferences & availability',
      rows: [
        row('Languages spoken', data.preferences.languagesSpoken),
        row('Can cook', yn(data.preferences.canCook)),
        row('Smoker', yn(data.preferences.isSmoker)),
        row('Earliest start date', data.preferences.availability.earliestStartDate),
        row('Days available', data.preferences.availability.days.join(', ')),
        row('Shift types', data.preferences.availability.shiftTypes.join(', ')),
      ].filter(Boolean) as ReviewRow[],
    },
    {
      stepId: 'employment',
      title: 'Employment history',
      rows: data.employmentHistory
        .filter((e) => e.employer || e.jobTitle)
        .map((e) => row(`${e.jobTitle || 'Role'} at ${e.employer || 'Employer'}`, `${e.startDate || '?'} – ${e.stillEmployed ? 'present' : e.endDate || '?'}`))
        .filter(Boolean) as ReviewRow[],
    },
    {
      stepId: 'education',
      title: 'Education & qualifications',
      rows: data.education
        .filter((e) => e.institution || e.qualification)
        .map((e) => row(e.qualification || 'Qualification', [e.institution, e.yearCompleted].filter(Boolean).join(', ')))
        .filter(Boolean) as ReviewRow[],
    },
    {
      stepId: 'references',
      title: 'References',
      rows: data.references
        .filter((r) => r.fullName)
        .map((r) => row(r.fullName, [r.relationship, r.phone || r.email].filter(Boolean).join(' — ')))
        .filter(Boolean) as ReviewRow[],
    },
    {
      stepId: 'emergency',
      title: 'Emergency contact',
      rows: [
        row('Name', [data.emergencyContact.firstName, data.emergencyContact.lastName].filter(Boolean).join(' ')),
        row('Relationship', data.emergencyContact.relationship),
        row('Mobile', data.emergencyContact.mobileTel1),
      ].filter(Boolean) as ReviewRow[],
    },
    {
      stepId: 'declaration',
      title: 'Declaration & consent',
      rows: [
        row('Unspent criminal convictions', yn(data.declaration.hasCriminalConvictions)),
        row('Health condition affecting work', yn(data.declaration.hasHealthConditionAffectingWork)),
        row('Signed by', data.declaration.signatureFullName),
        row('Date signed', data.declaration.signatureDate),
      ].filter(Boolean) as ReviewRow[],
    },
  ];
}

interface ReviewStepProps {
  data: ApplicationData;
  onEditStep: (stepId: string) => void;
  incompleteStepIds: string[];
}

export function ReviewStep({ data, onEditStep, incompleteStepIds }: ReviewStepProps) {
  const sections = buildSections(data);

  return (
    <div className="step">
      <h2 className="step__title">Review your application</h2>
      <p className="step__intro">Check everything looks right, then submit. You can jump back to fix anything.</p>

      {incompleteStepIds.length > 0 && (
        <div className="review-warning" role="alert">
          <strong>Some required sections still need attention:</strong>
          <ul>
            {incompleteStepIds.map((id) => {
              const stepDef = STEPS.find((s) => s.id === id);
              return (
                <li key={id}>
                  <button type="button" className="link-button" onClick={() => onEditStep(id)}>
                    {stepDef?.title ?? id}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {sections.map((section) => (
        <div className="review-section" key={section.stepId}>
          <div className="review-section__header">
            <h3 className="step__subtitle">{section.title}</h3>
            <button type="button" className="link-button" onClick={() => onEditStep(section.stepId)}>
              Edit
            </button>
          </div>
          {section.rows.length === 0 ? (
            <p className="review-section__empty">Nothing entered yet.</p>
          ) : (
            <dl className="review-list">
              {section.rows.map((r) => (
                <div className="review-list__item" key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ))}
    </div>
  );
}
