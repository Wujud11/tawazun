import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { normalizeAppEntryUrl } from '@/lib/app-entry'
import '@/styles/globals.css'

// MUST run before App/router modules load. ES module imports are hoisted, so
// App is loaded via dynamic import after we rewrite a restored /netting URL.
normalizeAppEntryUrl()

const { default: App } = await import('@/App')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
