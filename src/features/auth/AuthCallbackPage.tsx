import { useEffect, useState } from 'react'
import { useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'

/**
 * Handles Supabase auth redirects (magic links, password resets, email confirmations).
 * Tokens arrive as URL hash fragments (#access_token=...&type=...)
 */
export function AuthCallbackPage() {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const [status] = useState(t('auth.processing'))

  async function handleAuthCallback() {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      navigate('/login')
      return
    }

    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const type = params.get('type')

    if (type === 'recovery') {
      navigate('/reset-password')
    } else if (session) {
      const isNewUser = !session.user?.user_metadata?.full_name
      navigate(isNewUser ? '/signup' : '/dashboard')
    } else {
      navigate('/login')
    }
  }

  useEffect(() => {
    handleAuthCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      <div className="text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-md border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-on-surface-variant">{status}</p>
      </div>
    </div>
  )
}
