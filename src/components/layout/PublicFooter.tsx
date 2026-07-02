import { useTranslation } from 'react-i18next'
import { Shield } from 'lucide-react'
import { Link, useLocalizedNavigate } from '../shared/LocalizedLink'
import { Logo } from '../shared/Logo'
import { FOR_PAGES, GUIDE_PAGES } from '../../features/marketing/pages'

interface PublicFooterProps {
  /** When true, Features/Pricing/FAQ links scroll to sections on the current page */
  onLandingPage?: boolean
}

/** Shared site footer — brand block + organised link columns + legal bottom bar. */
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

  const linkClass = 'cursor-pointer text-sm text-on-surface-variant transition-colors hover:text-on-surface'
  const headingClass = 'text-xs font-semibold uppercase tracking-wider text-on-surface-variant'

  return (
    <footer className="border-t border-outline-variant/20">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="col-span-2 space-y-3 md:col-span-1">
            <Logo size="sm" linkTo="/" />
            <p className="max-w-xs text-xs leading-relaxed text-on-surface-variant">
              {t('landing.footer.tagline')}
            </p>
            <p className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
              <Shield className="h-3 w-3 shrink-0" aria-hidden="true" />
              Swiss-made
            </p>
          </div>

          {/* Product */}
          <nav aria-label="Product" className="flex flex-col gap-4">
            <h3 className={headingClass}>Product</h3>
            <ul className="flex flex-col gap-3">
              <li><button onClick={() => handleNavClick('features')} className={linkClass}>{t('common.features')}</button></li>
              <li><Link to="/pricing" className={linkClass}>{t('common.pricing')}</Link></li>
              <li><button onClick={() => handleNavClick('faq')} className={linkClass}>{t('common.faq')}</button></li>
            </ul>
          </nav>

          {/* For [audience] */}
          <nav aria-label="For" className="flex flex-col gap-4">
            <h3 className={headingClass}>For</h3>
            <ul className="flex flex-col gap-3">
              {FOR_PAGES.map((p) => (
                <li key={p.slug}><Link to={`/for/${p.slug}`} className={linkClass}>{p.navLabel}</Link></li>
              ))}
            </ul>
          </nav>

          {/* Guides */}
          <nav aria-label="Guides" className="flex flex-col gap-4">
            <h3 className={headingClass}>Guides</h3>
            <ul className="flex flex-col gap-3">
              {GUIDE_PAGES.map((p) => (
                <li key={p.slug}><Link to={`/guides/${p.slug}`} className={linkClass}>{p.navLabel}</Link></li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="my-10 border-t border-outline-variant/20" />

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-on-surface-variant">{t('common.copyright')}</p>
          <div className="flex gap-5">
            <Link to="/privacy" className={linkClass}>{t('common.privacy')}</Link>
            <Link to="/terms" className={linkClass}>{t('common.terms')}</Link>
            <Link to="/imprint" className={linkClass}>{t('common.imprint')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
