import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { MapPinOff } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useLocalizedNavigate } from '../../components/shared/LocalizedLink'

export function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()

  return (
    <>
      <Helmet>
        <title>{t('errors.notFound')} — ScoutCopilot</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container">
          <MapPinOff className="h-8 w-8 text-on-surface-variant" />
        </div>
        <h1 className="text-2xl font-semibold text-on-surface">
          {t('errors.notFound')}
        </h1>
        <p className="mt-2 max-w-md text-sm text-on-surface-variant">
          {t('errors.notFoundDescription')}
        </p>
        <div className="mt-8 flex gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            {t('errors.goBack')}
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            {t('errors.goToDashboard')}
          </Button>
        </div>
      </div>
    </>
  )
}
