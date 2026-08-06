import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './components/shared/ThemeProvider'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import './i18n'
import './index.css'
import App from './App'

// Stale-chunk recovery: after a deploy, hashed chunk filenames rotate and old ones 404. Vite fires
// `vite:preloadError` on window when a lazy chunk fails to load — reload once per failing chunk to
// pull the fresh build (guards against loops via sessionStorage).
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  const err = (event as unknown as { payload?: unknown }).payload
  const msg = err instanceof Error ? err.message : String(err ?? '')
  const key = 'chunk_reload:' + (msg.match(/https?:\/\/\S+\.js/)?.[0] ?? msg.slice(0, 120))
  try {
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch { return }
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
