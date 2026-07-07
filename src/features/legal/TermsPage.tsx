import { useTranslation } from 'react-i18next'
import { PublicNav } from '../../components/layout/PublicNav'
import { PublicFooter } from '../../components/layout/PublicFooter'

export function TermsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language || 'en'

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* React 19 native document metadata (hoisted to <head>) — not react-helmet-async */}
      <title>{`${t('legal.terms.title')} — ScoutCopilot`}</title>
      <meta name="description" content={t('legal.terms.metaDescription')} />
      <link rel="canonical" href={`https://scoutcopilot.com/${lang}/terms`} />
      <link rel="alternate" hrefLang="en" href="https://scoutcopilot.com/en/terms" />
      <link rel="alternate" hrefLang="de" href="https://scoutcopilot.com/de/terms" />
      <link rel="alternate" hrefLang="x-default" href="https://scoutcopilot.com/en/terms" />
      <meta property="og:title" content={`${t('legal.terms.title')} — ScoutCopilot`} />
      <meta property="og:description" content={t('legal.terms.metaDescription')} />
      <meta property="og:url" content={`https://scoutcopilot.com/${lang}/terms`} />
      <meta property="og:locale" content={lang === 'de' ? 'de_DE' : 'en_US'} />

      <PublicNav />

      <main className="max-w-3xl mx-auto px-6 md:px-8 pt-32 pb-16">
        <h1 className="text-[2.25rem] md:text-[3rem] font-bold leading-[1.1] tracking-[-0.02em] mb-2">{t('legal.terms.title')}</h1>
        <p className="text-on-surface-variant text-sm mb-12">{t('legal.terms.lastUpdated')}</p>

        <div className="prose-sm space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.terms.agreement')}</h2>
            <p className="text-on-surface-variant">
              By creating an account or using ScoutCopilot ("the Service"), you agree to these Terms of Service. The Service is operated by Predivo GmbH, Bahnhofstrasse 55, 6403 Küssnacht am Rigi, Switzerland. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.terms.serviceDescription')}</h2>
            <p className="text-on-surface-variant">
              ScoutCopilot is an AI-powered scouting assistant that connects to third-party football data APIs (Wyscout, StatsBomb) using credentials you provide. The Service generates player shortlists, scouting reports, and comparisons based on that data. ScoutCopilot does not guarantee the accuracy, completeness, or timeliness of any output. All scouting decisions remain your responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.terms.accounts')}</h2>
            <ul className="list-disc pl-5 text-on-surface-variant space-y-2">
              <li>You must provide accurate information when registering.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>One account per individual. Organization accounts may have multiple seats as permitted by their subscription tier.</li>
              <li>You must be at least 18 years old to use the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.terms.subscriptions')}</h2>
            <ul className="list-disc pl-5 text-on-surface-variant space-y-2">
              <li>Free trials last 14 days. No credit card is required to start a trial.</li>
              <li>Paid subscriptions are billed monthly or annually via Stripe. Prices are listed on the pricing page and may change with 30 days notice.</li>
              <li>You may upgrade or downgrade your plan at any time. Upgrades take effect immediately; downgrades apply at the end of the current billing cycle.</li>
              <li><strong className="text-on-surface">{t('legal.terms.moneyBackGuarantee')}</strong> request a full refund within 30 days of your first payment by contacting hello@predivo.ch. No questions asked.</li>
              <li>After the 30-day guarantee period, refunds are not available for partial billing periods.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.terms.acceptableUse')}</h2>
            <p className="text-on-surface-variant mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 text-on-surface-variant space-y-2">
              <li>Use the Service to violate any applicable law or third-party rights.</li>
              <li>Share, resell, or redistribute AI-generated reports or data outside your organization without authorization.</li>
              <li>Attempt to reverse-engineer, scrape, or extract the AI models or algorithms.</li>
              <li>Use automated scripts or bots to access the Service beyond normal API usage.</li>
              <li>Upload malicious content or attempt to compromise the Service's security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.terms.thirdPartyData')}</h2>
            <p className="text-on-surface-variant">
              ScoutCopilot accesses Wyscout, StatsBomb, or other data providers using API credentials you supply. You are responsible for ensuring you have valid licenses for those services. We are not affiliated with, endorsed by, or a reseller of Wyscout, StatsBomb, or any data provider.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.terms.intellectualProperty')}</h2>
            <p className="text-on-surface-variant">
              The ScoutCopilot software, branding, and AI models are the property of Predivo GmbH. AI-generated reports produced from your data are yours to use within your organization. You may not claim ownership of the ScoutCopilot platform or its underlying technology.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.terms.liability')}</h2>
            <p className="text-on-surface-variant">
              To the maximum extent permitted by law, Predivo GmbH shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim. The Service is provided "as is" without warranties of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.terms.termination')}</h2>
            <p className="text-on-surface-variant">
              You may delete your account at any time from account settings. We may suspend or terminate accounts that violate these terms with reasonable notice. Upon termination, your data will be deleted within 30 days in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.terms.governingLaw')}</h2>
            <p className="text-on-surface-variant">
              These terms are governed by the laws of Switzerland. Any disputes shall be subject to the exclusive jurisdiction of the courts of the Canton of Schwyz, Switzerland.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">{t('legal.terms.contact')}</h2>
            <p className="text-on-surface-variant">
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
