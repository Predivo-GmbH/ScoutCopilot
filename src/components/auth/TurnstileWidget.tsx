import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react'

// Cloudflare Turnstile site keys are public (safe to ship in the bundle) — but we hold no
// Cloudflare API token anywhere in the fleet, so no key can be minted for ScoutCopilot yet.
// Read it from the environment instead of hardcoding one (see TurnstileWidget in ReplyFlow,
// the reference this component copies, which DOES hardcode its key — deliberately not
// repeated here). When the env var is absent the widget renders nothing and never calls
// onToken, so captchaToken stays undefined everywhere it is threaded — a true no-op.
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (id?: string) => void
  remove: (id: string) => void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export interface TurnstileHandle {
  reset: () => void
}

interface TurnstileWidgetProps {
  /** Called with a token on success, or null on load/expire/error. */
  onToken: (token: string | null) => void
}

/**
 * Cloudflare Turnstile widget (Managed mode — mostly invisible for legit users).
 * Produces a single-use token; call reset() after each use to get a fresh one.
 *
 * Renders nothing when VITE_TURNSTILE_SITE_KEY is not set (no key minted for ScoutCopilot
 * yet) — never throws, never loads the Cloudflare script, never calls onToken.
 */
const TurnstileWidget = forwardRef<TurnstileHandle, TurnstileWidgetProps>(({ onToken }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current)
        } catch {
          /* widget already gone — ignore */
        }
        onToken(null)
      }
    },
  }), [onToken])

  useEffect(() => {
    if (!SITE_KEY) return
    let cancelled = false

    function renderWidget() {
      if (cancelled || !window.turnstile || !containerRef.current || widgetIdRef.current) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onToken(token),
        'error-callback': () => onToken(null),
        'expired-callback': () => onToken(null),
      })
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
      if (!script) {
        script = document.createElement('script')
        script.src = SCRIPT_SRC
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', renderWidget)
    }

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null
      }
    }
  }, [onToken])

  if (!SITE_KEY) return null

  // overflow-x-auto: the Turnstile iframe is a fixed 300px; on narrow phones it would
  // otherwise push the page wider than the viewport (see ReplyFlow's TurnstileWidget, Audit v10 Med #22).
  return <div ref={containerRef} className="min-h-[65px] overflow-x-auto" />
})

TurnstileWidget.displayName = 'TurnstileWidget'
export default TurnstileWidget
