import { useMemo, useState } from 'react';
import './styles/app.css';
import { createEmptyApplication, STEPS } from './data/defaults';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { submitApplication } from './lib/submitApplication';
import { PersonalStep } from './steps/PersonalStep';
import { ContactStep } from './steps/ContactStep';
import { EligibilityStep } from './steps/EligibilityStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { EmploymentStep } from './steps/EmploymentStep';
import { EducationStep } from './steps/EducationStep';
import { ReferencesStep } from './steps/ReferencesStep';
import { EmergencyContactStep } from './steps/EmergencyContactStep';
import { DeclarationStep } from './steps/DeclarationStep';
import { ReviewStep } from './steps/ReviewStep';
import { SuccessScreen } from './components/SuccessScreen';
import { isStepValid, validateStep } from './utils/validation';
import type { ApplicationData } from './types';
import { BRAND, storageKey } from './brand';

const DATA_KEY = storageKey('draft');
const STEP_KEY = storageKey('step');

function StepComponent({
  stepId,
  data,
  setData,
  errors,
  onEditStep,
  incompleteStepIds,
}: {
  stepId: string;
  data: ApplicationData;
  setData: (updater: (prev: ApplicationData) => ApplicationData) => void;
  errors: Record<string, string>;
  onEditStep: (id: string) => void;
  incompleteStepIds: string[];
}) {
  switch (stepId) {
    case 'personal':
      return <PersonalStep data={data} setData={setData} errors={errors} />;
    case 'contact':
      return <ContactStep data={data} setData={setData} errors={errors} />;
    case 'eligibility':
      return <EligibilityStep data={data} setData={setData} errors={errors} />;
    case 'preferences':
      return <PreferencesStep data={data} setData={setData} errors={errors} />;
    case 'employment':
      return <EmploymentStep data={data} setData={setData} errors={errors} />;
    case 'education':
      return <EducationStep data={data} setData={setData} errors={errors} />;
    case 'references':
      return <ReferencesStep data={data} setData={setData} errors={errors} />;
    case 'emergency':
      return <EmergencyContactStep data={data} setData={setData} errors={errors} />;
    case 'declaration':
      return <DeclarationStep data={data} setData={setData} errors={errors} />;
    case 'review':
      return <ReviewStep data={data} onEditStep={onEditStep} incompleteStepIds={incompleteStepIds} />;
    default:
      return null;
  }
}

export default function App() {
  const { state: data, setState: setData, savedAt, clear: clearDraft } = useLocalStorageState<ApplicationData>(
    DATA_KEY,
    createEmptyApplication,
  );
  const { state: stepIndex, setState: setStepIndex, clear: clearStep } = useLocalStorageState<number>(
    STEP_KEY,
    () => 0,
  );
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ referenceId: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentStep = STEPS[stepIndex];
  const isReviewStep = currentStep.id === 'review';

  const errors = useMemo(() => validateStep(currentStep.id, data), [currentStep.id, data]);

  const incompleteStepIds = useMemo(
    () => STEPS.filter((s) => s.id !== 'review').filter((s) => !isStepValid(s.id, data)).map((s) => s.id),
    [data],
  );

  const goToStep = (index: number) => {
    setStepIndex(() => index);
    setAttemptedNext(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (Object.keys(errors).length > 0) {
      setAttemptedNext(true);
      return;
    }
    setAttemptedNext(false);
    goToStep(Math.min(stepIndex + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    goToStep(Math.max(stepIndex - 1, 0));
  };

  const handleSubmit = async () => {
    if (incompleteStepIds.length > 0) {
      goToStep(STEPS.findIndex((s) => s.id === incompleteStepIds[0]));
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitApplication(data);
      setSubmitted(result);
      clearDraft();
      clearStep();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setData(() => createEmptyApplication());
    setStepIndex(() => 0);
    setSubmitted(null);
    setAttemptedNext(false);
    setSubmitError(null);
  };

  const handleStartNew = () => resetAll();

  const handleClearDraft = () => {
    if (window.confirm('Clear your saved draft? This cannot be undone.')) {
      resetAll();
      clearDraft();
      clearStep();
    }
  };

  if (submitted) {
    return (
      <div className="app-shell">
        <SuccessScreen data={data} referenceId={submitted.referenceId} onStartNew={handleStartNew} />
      </div>
    );
  }

  const progressPct = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Care Worker Application</h1>
        <p>
          {BRAND.name} — {BRAND.area}
        </p>
      </header>

      <nav className="stepper" aria-label="Application progress">
        <div className="stepper__bar">
          <div className="stepper__bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <ol className="stepper__list">
          {STEPS.map((step, i) => {
            const isDone = i < stepIndex && isStepValid(step.id, data);
            return (
              <li key={step.id}>
                <button
                  type="button"
                  className={`stepper__item ${i === stepIndex ? 'stepper__item--active' : ''} ${isDone ? 'stepper__item--done' : ''}`}
                  onClick={() => (i <= stepIndex ? goToStep(i) : undefined)}
                  disabled={i > stepIndex}
                  aria-current={i === stepIndex ? 'step' : undefined}
                >
                  <span className="stepper__index">{isDone ? '✓' : i + 1}</span>
                  <span className="stepper__label">{step.shortTitle}</span>
                </button>
              </li>
            );
          })}
        </ol>
        {savedAt && <p className="stepper__saved">Draft saved</p>}
      </nav>

      <main className="app-main">
        <StepComponent
          stepId={currentStep.id}
          data={data}
          setData={setData}
          errors={attemptedNext || isReviewStep ? errors : {}}
          onEditStep={(id) => goToStep(STEPS.findIndex((s) => s.id === id))}
          incompleteStepIds={incompleteStepIds}
        />

        <div className="app-nav">
          <button type="button" className="btn btn--ghost" onClick={handleBack} disabled={stepIndex === 0}>
            Back
          </button>
          {isReviewStep ? (
            <button type="button" className="btn btn--primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          ) : (
            <button type="button" className="btn btn--primary" onClick={handleNext}>
              Next
            </button>
          )}
        </div>
        {attemptedNext && Object.keys(errors).length > 0 && (
          <p className="app-nav__error" role="alert">
            Please fix the highlighted fields before continuing.
          </p>
        )}
        {submitError && (
          <p className="app-nav__error" role="alert">
            {submitError}
          </p>
        )}
      </main>

      <footer className="app-footer">
        <button type="button" className="link-button" onClick={handleClearDraft}>
          Clear saved draft
        </button>
      </footer>
    </div>
  );
}
