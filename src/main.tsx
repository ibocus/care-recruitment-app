import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Root from './Root.tsx'
import { BRAND, DEMO_MODE } from './brand'
import { installMockApi } from './demo/mockApi'
import './demo/demo.css'

if (DEMO_MODE) installMockApi()
document.title = `Care Worker Application — ${BRAND.name}`

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
