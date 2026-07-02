import { useTranslation } from 'react-i18next'
import { PublicNav } from '../../components/layout/PublicNav'
import { PublicFooter } from '../../components/layout/PublicFooter'

export function ImprintPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language || 'en'

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* React 19 native document metadata (hoisted to <head>) — not react-helmet-async */}
      <title>{t('legal.imprint.title')} — ScoutCopilot</title>
      <meta name="description" content={t('legal.imprint.metaDescription')} />
      <link rel="canonical" href={`https://scoutcopilot.com/${lang}/imprint`} />
      <link rel="alternate" hrefLang="en" href="https://scoutcopilot.com/en/imprint" />
      <link rel="alternate" hrefLang="de" href="https://scoutcopilot.com/de/imprint" />
      <link rel="alternate" hrefLang="x-default" href="https://scoutcopilot.com/en/imprint" />
      <meta property="og:title" content={`${t('legal.imprint.title')} — ScoutCopilot`} />
      <meta property="og:description" content={t('legal.imprint.metaDescription')} />
      <meta property="og:url" content={`https://scoutcopilot.com/${lang}/imprint`} />
      <meta property="og:locale" content={lang === 'de' ? 'de_DE' : 'en_US'} />

      <PublicNav />

      <main className="max-w-3xl mx-auto px-6 md:px-8 pt-32 pb-16">
        <h1 className="text-[2.25rem] md:text-[3rem] font-bold leading-[1.1] tracking-[-0.02em] mb-12">{t('legal.imprint.title')}</h1>

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

      <PublicFooter />
    </div>
  )
}
