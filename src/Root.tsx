import { useEffect, useState } from 'react'
import App from './App.tsx'
import AdminApp from './admin/AdminApp.tsx'
import { DEMO_MODE } from './brand'
import { DemoBar } from './demo/DemoBar'

// The staff panel lives at /admin; #/admin and ?view=admin also work, so the
// demo can be hosted as a single static page.
function currentView(): 'apply' | 'admin' {
  const { pathname, hash, search } = window.location
  if (pathname.startsWith('/admin') || hash.startsWith('#/admin')) return 'admin'
  if (new URLSearchParams(search).get('view') === 'admin') return 'admin'
  return 'apply'
}

export default function Root() {
  const [view, setView] = useState(currentView)
  useEffect(() => {
    const onHash = () => setView(currentView())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      {DEMO_MODE && <DemoBar view={view} />}
      {view === 'admin' ? <AdminApp /> : <App key="apply" />}
    </>
  )
}

