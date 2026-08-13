import { Component, type ReactNode, type ErrorInfo } from 'react'
import i18n from 'i18next'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { captureException } from '../../lib/sentry'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
    captureException(error, { componentStack: errorInfo.componentStack })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const t = (key: string) => i18n.t(key)

    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-error-container flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-error" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-on-surface">
              {t('errors.boundary.title')}
            </h1>
            <p className="text-sm text-on-surface-variant">
              {t('errors.boundary.description')}
            </p>
          </div>
          <button
            onClick={this.handleReload}
            className="inline-flex items-center justify-center gap-2 h-10 min-h-[44px] px-4 text-[0.875rem] font-medium rounded-md bg-primary text-on-primary hover:brightness-110 active:brightness-90 transition-colors duration-[150ms] ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
          >
            <RefreshCw size={18} strokeWidth={1.5} />
            {t('errors.boundary.reload')}
          </button>
        </div>
      </div>
    )
  }
}
