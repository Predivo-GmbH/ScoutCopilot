import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Logo } from '../../components/shared/Logo'
import { LanguageSelector } from '../../components/shared/LanguageSelector'

export function ImprintPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Helmet>
        <title>{t('legal.imprint.title')} — ScoutCopilot</title>
        <meta name="description" content={t('legal.imprint.metaDescription')} />
        <link rel="canonical" href="https://scoutcopilot.com/imprint" />
        <meta property="og:title" content={`${t('legal.imprint.title')} — ScoutCopilot`} />
        <meta property="og:description" content={t('legal.imprint.metaDescription')} />
        <meta property="og:url" content="https://scoutcopilot.com/imprint" />
      </Helmet>
      <nav className="w-full sticky top-0 z-30 bg-surface border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <Logo size="md" linkTo="/" />
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link to="/login" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors min-h-[44px] flex items-center">{t('common.signIn')}</Link>
            <Link to="/signup" className="text-sm bg-primary text-on-primary px-4 py-2 rounded-md font-medium hover:bg-primary-dark transition-colors min-h-[44px] flex items-center">{t('common.getStarted')}</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 md:px-8 py-16">
        <h1 className="text-3xl font-bold mb-12">{t('legal.imprint.title')}</h1>

        <div className="prose-sm space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.imprint.company')}</h2>
            <p className="text-on-surface-variant">
              Predivo GmbH<br />
              Bahnhofstrasse 55<br />
              6403 Küssnacht am Rigi<br />
              Switzerland
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.imprint.contact')}</h2>
            <p className="text-on-surface-variant">
              Email: <a href="mailto:hello@predivo.ch" className="text-primary-light hover:underline">hello@predivo.ch</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.imprint.commercialRegister')}</h2>
            <p className="text-on-surface-variant">
              {t('legal.imprint.registeredIn')}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.imprint.responsibleForContent')}</h2>
            <p className="text-on-surface-variant">
              Predivo GmbH<br />
              Bahnhofstrasse 55<br />
              6403 Küssnacht am Rigi, Switzerland
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.imprint.disclaimer')}</h2>
            <p className="text-on-surface-variant">
              The content of this website has been prepared with the greatest possible care. However, Predivo GmbH does not guarantee the accuracy, completeness, or timeliness of the content provided. Use of the content is at the user's own risk. Contributions marked by name reflect the opinion of the respective author and not always the opinion of Predivo GmbH.
            </p>
            <p className="text-on-surface-variant mt-3">
              This website contains links to external third-party websites over whose content Predivo GmbH has no influence. Therefore, we cannot accept any liability for this third-party content. The respective provider or operator of the linked pages is always responsible for the content of those pages.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-outline-variant/20 py-8 px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <p>{t('common.copyright')}</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-on-surface transition-colors min-h-[44px] flex items-center">{t('common.terms')}</Link>
            <Link to="/privacy" className="hover:text-on-surface transition-colors min-h-[44px] flex items-center">{t('common.privacy')}</Link>
            <Link to="/imprint" className="hover:text-on-surface transition-colors min-h-[44px] flex items-center">{t('common.imprint')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
