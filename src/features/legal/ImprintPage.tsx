import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export function ImprintPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Helmet>
        <title>Imprint — ScoutCopilot</title>
        <meta name="description" content="Legal imprint for ScoutCopilot by Predivo GmbH, Küssnacht am Rigi, Switzerland." />
      </Helmet>
      <nav className="w-full sticky top-0 z-30 bg-surface border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <Link to="/" className="text-xl font-bold tracking-tight">ScoutCopilot</Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Sign In</Link>
            <Link to="/signup" className="text-sm bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-dark transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 md:px-8 py-16">
        <h1 className="text-3xl font-bold mb-12">Imprint</h1>

        <div className="prose-sm space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-3">Company</h2>
            <p className="text-on-surface-variant">
              Predivo GmbH<br />
              Bahnhofstrasse 55<br />
              6403 Küssnacht am Rigi<br />
              Switzerland
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Contact</h2>
            <p className="text-on-surface-variant">
              Email: <a href="mailto:hello@predivo.ch" className="text-primary-light hover:underline">hello@predivo.ch</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Commercial Register</h2>
            <p className="text-on-surface-variant">
              Registered in the Commercial Register of the Canton of Schwyz, Switzerland.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Responsible for Content</h2>
            <p className="text-on-surface-variant">
              Predivo GmbH<br />
              Bahnhofstrasse 55<br />
              6403 Küssnacht am Rigi, Switzerland
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Disclaimer</h2>
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
