import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { PublicNav } from '../../components/layout/PublicNav'
import { PublicFooter } from '../../components/layout/PublicFooter'

export function PrivacyPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language || 'en'

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Helmet>
        <title>{t('legal.privacy.title')} — ScoutCopilot</title>
        <meta name="description" content={t('legal.privacy.metaDescription')} />
        <link rel="canonical" href={`https://scoutcopilot.com/${lang}/privacy`} />
        <link rel="alternate" hrefLang="en" href="https://scoutcopilot.com/en/privacy" />
        <link rel="alternate" hrefLang="de" href="https://scoutcopilot.com/de/privacy" />
        <link rel="alternate" hrefLang="x-default" href="https://scoutcopilot.com/en/privacy" />
        <meta property="og:title" content={`${t('legal.privacy.title')} — ScoutCopilot`} />
        <meta property="og:description" content={t('legal.privacy.metaDescription')} />
        <meta property="og:url" content={`https://scoutcopilot.com/${lang}/privacy`} />
        <meta property="og:locale" content={lang === 'de' ? 'de_DE' : 'en_US'} />
      </Helmet>

      <PublicNav />

      <main className="max-w-3xl mx-auto px-6 md:px-8 pt-32 pb-16">
        <h1 className="text-[2.25rem] md:text-[3rem] font-bold leading-[1.1] tracking-[-0.02em] mb-2">{t('legal.privacy.title')}</h1>
        <p className="text-on-surface-variant text-sm mb-12">{t('legal.privacy.lastUpdated')}</p>

        <div className="prose-sm space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.privacy.controller')}</h2>
            <p className="text-on-surface-variant">
              Predivo GmbH, Bahnhofstrasse 55, 6403 Küssnacht am Rigi, Switzerland ("we", "us")
              is the data controller for the processing of personal data described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.privacy.dataCollect')}</h2>
            <ul className="list-disc pl-5 text-on-surface-variant space-y-2">
              <li><strong className="text-on-surface">{t('legal.privacy.accountData')}</strong> email address, full name, role, and organization name provided during registration.</li>
              <li><strong className="text-on-surface">{t('legal.privacy.apiCredentials')}</strong> Wyscout or StatsBomb API credentials you provide during onboarding. These are encrypted at rest using AES-256-GCM in Supabase Vault and are never stored in plaintext.</li>
              <li><strong className="text-on-surface">{t('legal.privacy.usageData')}</strong> search queries, report generations, comparison requests, and watchlist configurations created within the application.</li>
              <li><strong className="text-on-surface">{t('legal.privacy.paymentData')}</strong> processed exclusively by Stripe Inc. We do not store credit card numbers or bank details on our servers.</li>
              <li><strong className="text-on-surface">{t('legal.privacy.technicalData')}</strong> IP address, browser type, and device information collected automatically when you access the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.privacy.purpose')}</h2>
            <ul className="list-disc pl-5 text-on-surface-variant space-y-2">
              <li><strong className="text-on-surface">{t('legal.privacy.contractPerformance')}</strong> providing the ScoutCopilot service, processing payments, and managing your account.</li>
              <li><strong className="text-on-surface">{t('legal.privacy.legitimateInterest')}</strong> improving the service, preventing fraud, and ensuring security.</li>
              <li><strong className="text-on-surface">{t('legal.privacy.consent')}</strong> sending marketing communications (only if you opt in).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.privacy.thirdParty')}</h2>
            <ul className="list-disc pl-5 text-on-surface-variant space-y-2">
              <li><strong className="text-on-surface">Supabase Inc.</strong> — authentication, database hosting, and serverless functions (EU region). <a href="https://supabase.com/privacy" className="text-primary-light hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a>.</li>
              <li><strong className="text-on-surface">Stripe Inc.</strong> — payment processing (PCI DSS Level 1 compliant). <a href="https://stripe.com/privacy" className="text-primary-light hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a>.</li>
              <li><strong className="text-on-surface">Fonts</strong> — all fonts (Inter, JetBrains Mono) are self-hosted. No third-party requests are made for font delivery.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.privacy.retention')}</h2>
            <p className="text-on-surface-variant">
              We retain your personal data for as long as your account is active. Usage data (search history, reports, comparisons) is retained according to your subscription tier: Scout — 3 months, Pro — 6 months, Club — 24 months. After account deletion, all personal data is permanently removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.privacy.rights')}</h2>
            <p className="text-on-surface-variant mb-3">Under the GDPR and Swiss Data Protection Act (nDSG), you have the right to:</p>
            <ul className="list-disc pl-5 text-on-surface-variant space-y-2">
              <li><strong className="text-on-surface">{t('legal.privacy.access')}</strong> — request a copy of your personal data.</li>
              <li><strong className="text-on-surface">{t('legal.privacy.rectification')}</strong> — correct inaccurate data in your account settings.</li>
              <li><strong className="text-on-surface">{t('legal.privacy.erasure')}</strong> — delete your account and all associated data.</li>
              <li><strong className="text-on-surface">{t('legal.privacy.portability')}</strong> — export your data in a machine-readable format.</li>
              <li><strong className="text-on-surface">{t('legal.privacy.restriction')}</strong> — restrict processing under certain conditions.</li>
              <li><strong className="text-on-surface">{t('legal.privacy.objection')}</strong> — object to processing based on legitimate interest.</li>
            </ul>
            <p className="text-on-surface-variant mt-3">To exercise any of these rights, contact us at <a href="mailto:hello@predivo.ch" className="text-primary-light hover:underline">hello@predivo.ch</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.privacy.cookies')}</h2>
            <p className="text-on-surface-variant">
              ScoutCopilot uses only essential cookies required for authentication and session management (set by Supabase Auth). We do not use tracking cookies, analytics cookies, or advertising cookies. No cookie consent banner is required for strictly necessary cookies under ePrivacy Directive Art. 5(3).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.privacy.security')}</h2>
            <p className="text-on-surface-variant">
              All data is transmitted over TLS 1.3. API credentials are encrypted at rest with AES-256-GCM. Database access is protected by Row-Level Security (RLS) policies. We conduct regular security reviews and follow OWASP best practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.privacy.contact')}</h2>
            <p className="text-on-surface-variant">
              For privacy-related inquiries, contact:<br />
              Predivo GmbH<br />
              Bahnhofstrasse 55<br />
              6403 Küssnacht am Rigi, Switzerland<br />
              <a href="mailto:hello@predivo.ch" className="text-primary-light hover:underline">hello@predivo.ch</a>
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
