import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'sc-lang',
      caches: ['localStorage'],
    },
    partialBundledLanguages: true,
    resources: {},
  })

async function loadLanguage(lng: string) {
  if (i18n.hasResourceBundle(lng, 'translation')) return
  const mod = await (lng === 'de' ? import('./de.json') : import('./en.json'))
  i18n.addResourceBundle(lng, 'translation', mod.default, true, true)
}

// Load the detected/current language immediately
loadLanguage(i18n.language || 'en').then(() => {
  i18n.changeLanguage(i18n.language || 'en')
})

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
  loadLanguage(lng)
})

export default i18n
