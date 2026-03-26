import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Logo } from '../../components/shared/Logo'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Helmet>
        <title>Privacy Policy — ScoutCopilot</title>
        <meta name="description" content="ScoutCopilot privacy policy. Learn how Predivo GmbH handles your data, GDPR rights, and security measures." />
      </Helmet>
      <nav className="w-full sticky top-0 z-30 bg-surface border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <Logo size="md" linkTo="/" />
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Sign In</Link>
            <Link to="/signup" className="text-sm bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-dark transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 md:px-8 py-16">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-on-surface-variant text-sm mb-12">Last updated: 24 March 2026</p>

        <div className="prose-sm space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Controller</h2>
            <p className="text-on-surface-variant">
              Predivo GmbH, Bahnhofstrasse 55, 6403 Küssnacht am Rigi, Switzerland ("we", "us")
              is the data controller for the processing of personal data described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Data We Collect</h2>
            <ul className="list-disc pl-5 text-on-surface-variant space-y-2">
              <li><strong className="text-on-surface">Account data:</strong> email address, full name, role, and organization name provided during registration.</li>
              <li><strong className="text-on-surface">API credentials:</strong> Wyscout or StatsBomb API credentials you provide during onboarding. These are encrypted at rest using AES-256-GCM in Supabase Vault and are never stored in plaintext.</li>
              <li><strong className="text-on-surface">Usage data:</strong> search queries, report generations, comparison requests, and watchlist configurations created within the application.</li>
              <li><strong className="text-on-surface">Payment data:</strong> processed exclusively by Stripe Inc. We do not store credit card numbers or bank details on our servers.</li>
              <li><strong className="text-on-surface">Technical data:</strong> IP address, browser type, and device information collected automatically when you access the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Purpose & Legal Basis</h2>
            <ul className="list-disc pl-5 text-on-surface-variant space-y-2">
              <li><strong className="text-on-surface">Contract performance (Art. 6(1)(b) GDPR):</strong> providing the ScoutCopilot service, processing payments, and managing your account.</li>
              <li><strong className="text-on-surface">Legitimate interest (Art. 6(1)(f) GDPR):</strong> improving the service, preventing fraud, and ensuring security.</li>
              <li><strong className="text-on-surface">Consent (Art. 6(1)(a) GDPR):</strong> sending marketing communications (only if you opt in).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Third-Party Services</h2>
            <ul className="list-disc pl-5 text-on-surface-variant space-y-2">
              <li><strong className="text-on-surface">Supabase Inc.</strong> — authentication, database hosting, and serverless functions (EU region). <a href="https://supabase.com/privacy" className="text-primary-light hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a>.</li>
              <li><strong className="text-on-surface">Stripe Inc.</strong> — payment processing (PCI DSS Level 1 compliant). <a href="https://stripe.com/privacy" className="text-primary-light hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a>.</li>
              <li><strong className="text-on-surface">Fonts</strong> — all fonts (Inter, JetBrains Mono) are self-hosted. No third-party requests are made for font delivery.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Data Retention</h2>
            <p className="text-on-surface-variant">
              We retain your personal data for as long as your account is active. Usage data (search history, reports, comparisons) is retained according to your subscription tier: Scout — 3 months, Pro — 6 months, Club — 24 months. After account deletion, all personal data is permanently removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Your Rights (GDPR)</h2>
            <p className="text-on-surface-variant mb-3">Under the GDPR and Swiss Data Protection Act (nDSG), you have the right to:</p>
            <ul className="list-disc pl-5 text-on-surface-variant space-y-2">
              <li><strong className="text-on-surface">Access</strong> — request a copy of your personal data.</li>
              <li><strong className="text-on-surface">Rectification</strong> — correct inaccurate data in your account settings.</li>
              <li><strong className="text-on-surface">Erasure</strong> — delete your account and all associated data.</li>
              <li><strong className="text-on-surface">Data portability</strong> — export your data in a machine-readable format.</li>
              <li><strong className="text-on-surface">Restriction</strong> — restrict processing under certain conditions.</li>
              <li><strong className="text-on-surface">Objection</strong> — object to processing based on legitimate interest.</li>
            </ul>
            <p className="text-on-surface-variant mt-3">To exercise any of these rights, contact us at <a href="mailto:hello@predivo.ch" className="text-primary-light hover:underline">hello@predivo.ch</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Cookies</h2>
            <p className="text-on-surface-variant">
              ScoutCopilot uses only essential cookies required for authentication and session management (set by Supabase Auth). We do not use tracking cookies, analytics cookies, or advertising cookies. No cookie consent banner is required for strictly necessary cookies under ePrivacy Directive Art. 5(3).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Security</h2>
            <p className="text-on-surface-variant">
              All data is transmitted over TLS 1.3. API credentials are encrypted at rest with AES-256-GCM. Database access is protected by Row-Level Security (RLS) policies. We conduct regular security reviews and follow OWASP best practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Contact</h2>
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

      <footer className="border-t border-outline-variant/20 py-8 px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <p>&copy; 2026 Predivo GmbH. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-on-surface transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-on-surface transition-colors">Privacy</Link>
            <Link to="/imprint" className="hover:text-on-surface transition-colors">Imprint</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
