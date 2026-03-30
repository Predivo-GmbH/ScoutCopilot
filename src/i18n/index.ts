import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    interpolation: {
      escapeValue: false,
    },
    partialBundledLanguages: true,
    resources: {},
  })

async function loadLanguage(lng: string) {
  if (i18n.hasResourceBundle(lng, 'translation')) return
  const mod = await (lng === 'de' ? import('./de.json') : import('./en.json'))
  i18n.addResourceBundle(lng, 'translation', mod.default, true, true)
}

// Load English by default; LanguageRootLayout syncs the correct language from URL
loadLanguage('en').then(() => {
  i18n.changeLanguage('en')
})

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
  loadLanguage(lng)
})

export default i18n
