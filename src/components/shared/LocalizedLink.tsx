/* eslint-disable react-refresh/only-export-components */
import { forwardRef } from 'react'
import { Link as RouterLink, useNavigate, type LinkProps, type NavigateOptions } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function prefixPath(to: string, lang: string): string {
  if (to.startsWith('http') || to.startsWith('mailto:') || to.startsWith('#')) return to
  if (/^\/(en|de)(\/|$|\?)/.test(to)) return to
  if (to === '/') return `/${lang}`
  return to.startsWith('/') ? `/${lang}${to}` : `/${lang}/${to}`
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function LocalizedLink({ to, ...props }, ref) {
    const { i18n } = useTranslation()
    const lang = i18n.language || 'en'

    if (typeof to === 'string') {
      return <RouterLink ref={ref} to={prefixPath(to, lang)} {...props} />
    }

    return <RouterLink ref={ref} to={to} {...props} />
  }
)

export function useLocalizedNavigate() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()

  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === 'number') {
      navigate(to)
      return
    }
    navigate(prefixPath(to, i18n.language || 'en'), options)
  }
}
