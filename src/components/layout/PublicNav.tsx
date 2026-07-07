import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu, XIcon } from 'lucide-react'
import { useLocalizedNavigate } from '../shared/LocalizedLink'
import { Logo } from '../shared/Logo'
import { ThemeToggle } from '../shared/ThemeToggle'
import { LanguageSelector } from '../shared/LanguageSelector'
import { Button } from '../ui/Button'
import { useWaitlist } from '../../features/waitlist/useWaitlist'

interface PublicNavProps {
  /** When true, Features/Pricing/FAQ links scroll to sections on the current page */
  onLandingPage?: boolean
  /** Optional: highlight a nav item as active (e.g. 'pricing') */
  activeItem?: 'features' | 'pricing' | 'faq'
}

export function PublicNav({ onLandingPage, activeItem }: PublicNavProps) {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const { openWaitlist } = useWaitlist()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleNavClick(id: string) {
    setMobileMenuOpen(false)
    if (onLandingPage) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(`/#${id}`)
    }
  }

  const navLinkClass = (item?: string) =>
    `text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-current after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left pb-0.5${
      activeItem === item ? ' text-on-surface after:scale-x-100' : ''
    }`

  return (
    <header>
      <nav
        className={`fixed top-0 w-full z-30 transition-colors duration-[150ms] ${
          scrolled
            ? 'bg-surface-container-low border-b border-outline-variant/40'
            : 'bg-transparent'
        }`}
      >
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <Logo size="md" linkTo="/" />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => handleNavClick('features')} className={navLinkClass('features')}>
              {t('common.features')}
            </button>
            <button onClick={() => handleNavClick('pricing')} className={navLinkClass('pricing')}>
              {t('common.pricing')}
            </button>
            <button onClick={() => handleNavClick('faq')} className={navLinkClass('faq')}>
              {t('common.faq')}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            <ThemeToggle className="p-2" />
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              {t('common.logIn')}
            </Button>
            <Button size="sm" onClick={() => openWaitlist('nav')}>
              {t('common.getStarted')}
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-on-surface-variant min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t('common.toggleMenu')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <XIcon size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[64px] z-20 bg-surface/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-surface-container-low border-b border-outline-variant/40 px-6 pb-4 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => handleNavClick('features')} className="text-sm text-on-surface-variant text-left py-3 min-h-[44px]">{t('common.features')}</button>
              <button onClick={() => handleNavClick('pricing')} className="text-sm text-on-surface-variant text-left py-3 min-h-[44px]">{t('common.pricing')}</button>
              <button onClick={() => handleNavClick('faq')} className="text-sm text-on-surface-variant text-left py-3 min-h-[44px]">{t('common.faq')}</button>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <LanguageSelector />
                <ThemeToggle className="p-2" />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>{t('common.logIn')}</Button>
                <Button size="sm" onClick={() => { setMobileMenuOpen(false); openWaitlist('nav') }}>{t('common.getStarted')}</Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
