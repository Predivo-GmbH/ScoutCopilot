import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './components/shared/ThemeProvider'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { initSentry } from './lib/sentry'
import './i18n'
import './index.css'
import App from './App'

// Initialize error monitoring FIRST, before any other init runs, so exceptions
// thrown during startup are captured. No-ops unless VITE_SENTRY_DSN is set.
initSentry()

// Stale-chunk recovery: after a deploy, hashed chunk filenames rotate and old ones 404. Vite fires
// `vite:preloadError` on window when a lazy chunk fails to load — reload once per failing chunk to
// pull the fresh build (guards against loops via sessionStorage).
window.addEventListener('vite:preloadError', (event) => {
  // Deliberately NO event.preventDefault(): Vite's __vitePreload only rethrows the failed
  // import `if (!e.defaultPrevented)`. Cancelling the event makes the failed dynamic import
  // RESOLVE WITH undefined, so React 19's lazyInitializer throws "Cannot read properties of
  // undefined (reading 'default')" — a message isChunkLoadError() cannot recognise, so the
  // ErrorBoundary's stale-chunk recovery never runs and the user gets "Something went wrong"
  // after a deploy. Let the event run its course; the reload below stays as the global net.
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
