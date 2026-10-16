import { useEffect, useState } from 'react';
import { resetDemo } from './mockApi';

// Top strip shown only in demo mode: switch between the candidate and staff
// views during a call, reset the sample data, and show where the live system
// would send email/WhatsApp notifications.
export function DemoBar({ view }: { view: 'apply' | 'admin' }) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const onNotify = (e: Event) => {
      setToast((e as CustomEvent<string>).detail);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setToast(null), 6000);
    };
    window.addEventListener('demo:notify', onNotify);
    return () => {
      window.removeEventListener('demo:notify', onNotify);
      window.clearTimeout(timer);
    };
  }, []);

  const reset = () => {
    resetDemo();
    window.location.hash = view === 'admin' ? '#/admin' : '#/';
    window.location.reload();
  };

  return (
    <>
      <div className="demo-bar" role="navigation" aria-label="Demo controls">
        <span className="demo-bar__label">Demo · sample data only</span>
        <span className="demo-bar__links">
          <a href="#/" className={view === 'apply' ? 'demo-bar__link demo-bar__link--active' : 'demo-bar__link'}>
            Candidate application
          </a>
          <a href="#/admin" className={view === 'admin' ? 'demo-bar__link demo-bar__link--active' : 'demo-bar__link'}>
            Staff pipeline
          </a>
          <button type="button" className="demo-bar__reset" onClick={reset}>
            Reset demo
          </button>
        </span>
      </div>
      {toast && (
        <div className="demo-toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
