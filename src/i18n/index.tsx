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
const translations: Partial<Record<LanguageCode, Translation>> = { en, hi, mr, bn, gu, ta, te, pa }
export const translatedLanguages = new Set<SupportedLanguageCode>(['en', 'hi', 'mr', 'bn', 'gu', 'ta', 'te', 'pa'])
export const isTranslatedLanguage = (code: LanguageCode): code is SupportedLanguageCode => translatedLanguages.has(code as SupportedLanguageCode)
const statusTranslations: Partial<Record<SupportedLanguageCode, Translation>> = {
  hi: { map:'मानचित्र', analysisPending:'विश्लेषण लंबित', aiUnavailable:'AI निदान उपलब्ध नहीं है', analysisFailed:'विश्लेषण विफल', diagnosisComplete:'निदान पूरा हुआ' },
  mr: { map:'नकाशा', analysisPending:'विश्लेषण प्रलंबित', aiUnavailable:'AI निदान उपलब्ध नाही', analysisFailed:'विश्लेषण अयशस्वी', diagnosisComplete:'निदान पूर्ण' },
  bn: { map:'মানচিত্র', analysisPending:'বিশ্লেষণ অপেক্ষমাণ', aiUnavailable:'AI নির্ণয় উপলব্ধ নয়', analysisFailed:'বিশ্লেষণ ব্যর্থ', diagnosisComplete:'নির্ণয় সম্পূর্ণ' },
  gu: { map:'નકશો', analysisPending:'વિશ્લેષણ બાકી છે', aiUnavailable:'AI નિદાન ઉપલબ્ધ નથી', analysisFailed:'વિશ્લેષણ નિષ્ફળ', diagnosisComplete:'નિદાન પૂર્ણ' },
  ta: { map:'வரைபடம்', analysisPending:'ஆய்வு நிலுவையில் உள்ளது', aiUnavailable:'AI நோயறிதல் கிடைக்கவில்லை', analysisFailed:'ஆய்வு தோல்வியடைந்தது', diagnosisComplete:'நோயறிதல் முடிந்தது' },
  te: { map:'మ్యాప్', analysisPending:'విశ్లేషణ పెండింగ్‌లో ఉంది', aiUnavailable:'AI నిర్ధారణ అందుబాటులో లేదు', analysisFailed:'విశ్లేషణ విఫలమైంది', diagnosisComplete:'నిర్ధారణ పూర్తయింది' },
  pa: { map:'ਨਕਸ਼ਾ', analysisPending:'ਵਿਸ਼ਲੇਸ਼ਣ ਬਕਾਇਆ ਹੈ', aiUnavailable:'AI ਨਿਦਾਨ ਉਪਲਬਧ ਨਹੀਂ', analysisFailed:'ਵਿਸ਼ਲੇਸ਼ਣ ਅਸਫਲ', diagnosisComplete:'ਨਿਦਾਨ ਪੂਰਾ' },
}
const translate = (code: LanguageCode): Translation => ({ ...en, ...(translations[code] ?? {}), ...(statusTranslations[isTranslatedLanguage(code) ? code : 'en'] ?? {}) })
export { translateCropName }

type Context = { lang: LanguageCode; setLang: (lang: LanguageCode) => void; t: Translation; isFallback: boolean }
const context = createContext<Context>({ lang: 'en', setLang: () => {}, t: en, isFallback: false })
export function LanguageProvider({ children }: { children: ReactNode }) {
  const saved = storage.language() as LanguageCode
  const initial = languages.some(([id]) => id === saved) ? saved : 'en'
  const [lang, setLangState] = useState<LanguageCode>(initial)
  const setLang = (next: LanguageCode) => { setLangState(next); storage.saveLanguage(next) }
  return <context.Provider value={{ lang, setLang, t: translate(lang), isFallback: !isTranslatedLanguage(lang) }}>{children}</context.Provider>
}
export const useLanguage = () => useContext(context)
