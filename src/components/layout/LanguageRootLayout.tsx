import { useEffect } from 'react'
import { useParams, Outlet, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { loadLanguage } from '../../i18n'

const SUPPORTED_LOCALES = ['en', 'de'] as const
type Locale = (typeof SUPPORTED_LOCALES)[number]

export function LanguageRootLayout() {
  const { lang } = useParams<{ lang: string }>()
  const { i18n } = useTranslation()
  const location = useLocation()
  const isValid = SUPPORTED_LOCALES.includes(lang as Locale)

  useEffect(() => {
    if (isValid && i18n.language !== lang) {
      loadLanguage(lang!).then(() => i18n.changeLanguage(lang!))
    }
  }, [lang, isValid, i18n])

  if (!isValid) {
    const rest = location.pathname.replace(/^\/[^/]+/, '')
    return <Navigate to={`/en${rest}${location.search}`} replace />
  }

  return <Outlet />
}
