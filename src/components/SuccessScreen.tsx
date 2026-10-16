import type { ApplicationData } from '../types';
import { DEMO_MODE } from '../brand';

interface SuccessScreenProps {
  data: ApplicationData;
  referenceId: string;
  onStartNew: () => void;
}

export function SuccessScreen({ data, referenceId, onStartNew }: SuccessScreenProps) {
  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `care-application-${referenceId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="success-screen">
      <div className="success-screen__icon" aria-hidden="true">✓</div>
      <h2>Application submitted</h2>
      <p>
        Thanks, {data.personal.firstName || 'there'} — your application has been recorded. Your reference number
        is <strong>{referenceId}</strong>.
      </p>
      <p className="success-screen__note">
        {DEMO_MODE
          ? 'In the demo, this application now appears in the Staff pipeline view.'
          : 'Your application has been saved and the team has been notified. You can also keep a copy for your own records below.'}
      </p>
      <div className="success-screen__actions">
        {!DEMO_MODE && (
          <>
            <button type="button" className="btn btn--primary" onClick={downloadJson}>
              Download application (JSON)
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => window.print()}>
              Print / save as PDF
            </button>
          </>
        )}
        <button type="button" className="btn btn--ghost" onClick={onStartNew}>
          Start a new application
        </button>
      </div>
    </div>
  );
}
