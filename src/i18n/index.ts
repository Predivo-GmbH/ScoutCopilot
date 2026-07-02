import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
// Default language (en) is bundled SYNCHRONOUSLY so translations are ready on the
// very first render. Previously en was loaded async (import('./en.json')), which
// raced with startup: components rendered before it resolved saw raw keys, and
// t(..., {returnObjects:true}) returned a string → ".map is not a function".
// This lets public pages be eager-imported safely. de stays code-split (on demand).
import en from './en.json'

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    interpolation: {
      escapeValue: false,
    },
    partialBundledLanguages: true,
    resources: { en: { translation: en } },
  })

async function loadLanguage(lng: string) {
  // en is bundled synchronously at init; only de is code-split (loaded on demand).
  if (lng === 'en' || i18n.hasResourceBundle(lng, 'translation')) return
  const mod = await import('./de.json')
  i18n.addResourceBundle(lng, 'translation', mod.default, true, true)
}

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

export { loadLanguage }
export default i18n
