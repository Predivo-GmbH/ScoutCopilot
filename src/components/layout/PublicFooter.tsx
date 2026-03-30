import { useTranslation } from 'react-i18next'
import { Link, useLocalizedNavigate } from '../shared/LocalizedLink'
import { Logo } from '../shared/Logo'

interface PublicFooterProps {
  /** When true, Features/Pricing/FAQ links scroll to sections on the current page */
  onLandingPage?: boolean
}

export function PublicFooter({ onLandingPage }: PublicFooterProps) {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()

  function handleNavClick(id: string) {
    if (onLandingPage) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(`/#${id}`)
    }
  }

  return (
    <footer className="border-t border-outline-variant/20 py-12 px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <Logo size="sm" linkTo="/" />
          <p className="text-on-surface-variant text-xs mt-1">{t('landing.footer.tagline')}</p>
        </div>
        <nav className="grid grid-cols-3 sm:flex sm:flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-on-surface-variant text-center">
          <button onClick={() => handleNavClick('features')} className="hover:text-on-surface transition-colors py-2 min-h-[44px] flex items-center justify-center">
            {t('common.features')}
          </button>
          <button onClick={() => handleNavClick('pricing')} className="hover:text-on-surface transition-colors py-2 min-h-[44px] flex items-center justify-center">
            {t('common.pricing')}
          </button>
          <button onClick={() => handleNavClick('faq')} className="hover:text-on-surface transition-colors py-2 min-h-[44px] flex items-center justify-center">
            {t('common.faq')}
          </button>
          <Link to="/terms" className="hover:text-on-surface transition-colors py-2 min-h-[44px] flex items-center justify-center">{t('common.terms')}</Link>
          <Link to="/privacy" className="hover:text-on-surface transition-colors py-2 min-h-[44px] flex items-center justify-center">{t('common.privacy')}</Link>
          <Link to="/imprint" className="hover:text-on-surface transition-colors py-2 min-h-[44px] flex items-center justify-center">{t('common.imprint')}</Link>
        </nav>
        <p className="text-on-surface-variant text-xs">{t('common.copyright')}</p>
      </div>
    </footer>
  )
}
