import { Navigate, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './useAuth'

function LoadingSkeleton() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-background flex items-center justify-center" role="status">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-md animate-spin" />
        <p className="text-sm text-on-surface-variant">{t('common.loading')}</p>
      </div>
    </div>
  )
}

/** Wraps routes that require authentication */
export function AuthGuard() {
  const { user, organization, isLoading } = useAuth()

  if (isLoading) return <LoadingSkeleton />
  if (!user) return <Navigate to="/login" replace />
  if (!organization) return <Navigate to="/onboarding" replace />

  return <Outlet />
}

/** Wraps onboarding — needs auth but no org check */
export function AuthOnlyGuard() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <LoadingSkeleton />
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}
