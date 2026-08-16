import { createContext, useContext, useState, type ReactNode } from 'react'
import { storage } from '../services/storageService'
import { en } from './translations/en'
import { hi } from './translations/hi'
import { mr } from './translations/mr'
import { bn } from './translations/bn'
import { gu } from './translations/gu'
import { ta } from './translations/ta'
import { te } from './translations/te'
import { pa } from './translations/pa'
import { translateCropName } from './cropNames'
import type { Translation } from './translationTypes'

export const languages = [
  ['as', 'অসমীয়া', 'Assamese'], ['bn', 'বাংলা', 'Bengali'], ['brx', 'बड़ो', 'Bodo'], ['doi', 'डोगरी', 'Dogri'],
  ['gu', 'ગુજરાતી', 'Gujarati'], ['hi', 'हिन्दी', 'Hindi'], ['kn', 'ಕನ್ನಡ', 'Kannada'], ['ks', 'کٲشُر', 'Kashmiri'],
  ['kok', 'कोंकणी', 'Konkani'], ['mai', 'मैथिली', 'Maithili'], ['ml', 'മലയാളം', 'Malayalam'], ['mni', 'মৈতৈলোন', 'Manipuri'],
  ['mr', 'मराठी', 'Marathi'], ['ne', 'नेपाली', 'Nepali'], ['or', 'ଓଡ଼ିଆ', 'Odia'], ['pa', 'ਪੰਜਾਬੀ', 'Punjabi'],
  ['sa', 'संस्कृतम्', 'Sanskrit'], ['sat', 'संताली', 'Santali'], ['sd', 'سنڌي', 'Sindhi'], ['ta', 'தமிழ்', 'Tamil'],
  ['te', 'తెలుగు', 'Telugu'], ['ur', 'اردو', 'Urdu'], ['en', 'English', 'English'],
] as const

export type LanguageCode = typeof languages[number][0]
export type SupportedLanguageCode = 'en' | 'hi' | 'mr' | 'bn' | 'gu' | 'ta' | 'te' | 'pa'

export function getTimeGreetingKey(overrideHour?: number): 'goodMorning' | 'goodAfternoon' | 'goodEvening' | 'goodNight' {
  const hour = typeof overrideHour === 'number' ? overrideHour : new Date().getHours()
  if (hour >= 5 && hour < 12) return 'goodMorning'
  if (hour >= 12 && hour < 17) return 'goodAfternoon'
  if (hour >= 17 && hour < 21) return 'goodEvening'
  return 'goodNight'
}

export function getGreeting(t: Translation): string {
  const key = getTimeGreetingKey()
  return t[key] || t.greeting || 'Good morning'
}

const translations: Record<SupportedLanguageCode, Translation> = { en, hi, mr, bn, gu, ta, te, pa }
export const translatedLanguages = new Set<SupportedLanguageCode>(['en', 'hi', 'mr', 'bn', 'gu', 'ta', 'te', 'pa'])
export const isTranslatedLanguage = (code: LanguageCode): code is SupportedLanguageCode => translatedLanguages.has(code as SupportedLanguageCode)

export const translate = (code: LanguageCode): Translation => {
  const langKey = isTranslatedLanguage(code) ? code : 'en'
  const base = translations[langKey] ?? en
  const merged: Translation = { ...en, ...base }
  merged.greeting = getGreeting(merged)
  return merged
}

export { translateCropName }

type Context = { lang: LanguageCode; setLang: (lang: LanguageCode) => void; t: Translation; isFallback: boolean }
const context = createContext<Context>({ lang: 'en', setLang: () => {}, t: translate('en'), isFallback: false })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const saved = storage.language() as LanguageCode
  const initial = languages.some(([id]) => id === saved) ? saved : 'en'
  const [lang, setLangState] = useState<LanguageCode>(initial)
  const setLang = (next: LanguageCode) => { setLangState(next); storage.saveLanguage(next) }
  return <context.Provider value={{ lang, setLang, t: translate(lang), isFallback: !isTranslatedLanguage(lang) }}>{children}</context.Provider>
}

export const useLanguage = () => useContext(context)
