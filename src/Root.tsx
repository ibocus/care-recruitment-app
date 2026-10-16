import { useEffect, useState } from 'react'
import App from './App.tsx'
import AdminApp from './admin/AdminApp.tsx'
import { DEMO_MODE } from './brand'
import { DemoBar } from './demo/DemoBar'

// The staff panel lives at /admin; #admin, #/admin and ?view=admin also work, so the
// demo can be hosted as a single static page.
function currentView(): 'apply' | 'admin' {
  const { pathname, hash, search } = window.location
  if (pathname.startsWith('/admin') || hash === '#admin' || hash.startsWith('#/admin')) return 'admin'
  if (new URLSearchParams(search).get('view') === 'admin') return 'admin'
  return 'apply'
}

export default function Root() {
  const [view, setView] = useState(currentView)
  const [resetCount, setResetCount] = useState(0)
  useEffect(() => {
    const onHash = () => setView(currentView())
    const onReset = () => setResetCount((n) => n + 1)
    window.addEventListener('hashchange', onHash)
    window.addEventListener('demo:reset', onReset)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('demo:reset', onReset)
    }
  }, [])

  return (
    <>
      {DEMO_MODE && <DemoBar view={view} />}
      {view === 'admin' ? <AdminApp key={`admin-${resetCount}`} /> : <App key={`apply-${resetCount}`} />}
    </>
  )
}

