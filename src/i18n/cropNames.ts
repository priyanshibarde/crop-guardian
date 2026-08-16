import type { LanguageCode, SupportedLanguageCode } from './index'

export const cropNames: Record<SupportedLanguageCode, Record<string, string>> = {
  en: { Rice: 'Rice', Wheat: 'Wheat', Maize: 'Maize', Cotton: 'Cotton', Sugarcane: 'Sugarcane', Tomato: 'Tomato', Potato: 'Potato', Onion: 'Onion', Soybean: 'Soybean', Chickpea: 'Chickpea', Groundnut: 'Groundnut', Mustard: 'Mustard', Chilli: 'Chilli', Grapes: 'Grapes', Mango: 'Mango', Banana: 'Banana', Other: 'Other' },
  hi: { Rice: 'चावल', Wheat: 'गेहूँ', Maize: 'मक्का', Cotton: 'कपास', Sugarcane: 'गन्ना', Tomato: 'टमाटर', Potato: 'आलू', Onion: 'प्याज', Soybean: 'सोयाबीन', Chickpea: 'चना', Groundnut: 'मूंगफली', Mustard: 'सरसों', Chilli: 'मिर्च', Grapes: 'अंगूर', Mango: 'आम', Banana: 'केला', Other: 'अन्य' },
  mr: { Rice: 'तांदूळ', Wheat: 'गहू', Maize: 'मका', Cotton: 'कापूस', Sugarcane: 'ऊस', Tomato: 'टोमॅटो', Potato: 'बटाटा', Onion: 'कांदा', Soybean: 'सोयाबीन', Chickpea: 'हरभरा', Groundnut: 'भुईमूग', Mustard: 'मोहरी', Chilli: 'मिरची', Grapes: 'द्राक्षे', Mango: 'आंबा', Banana: 'केळी', Other: 'इतर' },
  bn: { Rice: 'ধান', Wheat: 'গম', Maize: 'ভুট্টা', Cotton: 'তুলা', Sugarcane: 'আখ', Tomato: 'টমেটো', Potato: 'আলু', Onion: 'পেঁয়াজ', Soybean: 'সয়াবিন', Chickpea: 'ছোলা', Groundnut: 'বাদাম', Mustard: 'সরষে', Chilli: 'লঙ্কা', Grapes: 'আঙুর', Mango: 'আম', Banana: 'কলা', Other: 'অন্যান্য' },
  gu: { Rice: 'ચોખા', Wheat: 'ઘઉં', Maize: 'મકાઈ', Cotton: 'કપાસ', Sugarcane: 'શેરડી', Tomato: 'ટામેટા', Potato: 'બટાટા', Onion: 'ડુંગળી', Soybean: 'સોયાબીન', Chickpea: 'ચણા', Groundnut: 'મગફળી', Mustard: 'સરસવ', Chilli: 'મરચું', Grapes: 'દ્રાક્ષ', Mango: 'કેરી', Banana: 'કેળું', Other: 'અન્ય' },
  ta: { Rice: 'நெல்', Wheat: 'கோதுமை', Maize: 'மக்காச்சோளம்', Cotton: 'பருத்தி', Sugarcane: 'கரும்பு', Tomato: 'தக்காளி', Potato: 'உருளைக்கிழங்கு', Onion: 'வெங்காயம்', Soybean: 'சோயாபீன்', Chickpea: 'கொண்டைக்கடலை', Groundnut: 'நிலக்கடலை', Mustard: 'கடுகு', Chilli: 'மிளகாய்', Grapes: 'திராட்சை', Mango: 'மாம்பழம்', Banana: 'வாழை', Other: 'மற்றவை' },
  te: { Rice: 'వరి', Wheat: 'గోధుమ', Maize: 'మొక్కజొన్న', Cotton: 'పత్తి', Sugarcane: 'చెరకు', Tomato: 'టమాటా', Potato: 'బంగాళాదుంప', Onion: 'ఉల్లిపాయ', Soybean: 'సోయాబీన్', Chickpea: 'శనగ', Groundnut: 'వేరుశనగ', Mustard: 'ఆవాలు', Chilli: 'మిరప', Grapes: 'ద్రాక్ష', Mango: 'మామిడి', Banana: 'అరటి', Other: 'ఇతర' },
  pa: { Rice: 'ਚਾਵਲ', Wheat: 'ਕਣਕ', Maize: 'ਮੱਕੀ', Cotton: 'ਕਪਾਹ', Sugarcane: 'ਗੰਨਾ', Tomato: 'ਟਮਾਟਰ', Potato: 'ਆਲੂ', Onion: 'ਪਿਆਜ਼', Soybean: 'ਸੋਯਾਬੀਨ', Chickpea: 'ਛੋਲੇ', Groundnut: 'ਮੂੰਗਫਲੀ', Mustard: 'ਸਰ੍ਹੋਂ', Chilli: 'ਮਿਰਚ', Grapes: 'ਅੰਗੂਰ', Mango: 'ਅੰਬ', Banana: 'ਕੇਲਾ', Other: 'ਹੋਰ' },
}

export function translateCropName(cropName: string, language: LanguageCode): string {
  const key = cropName.trim()
  const languageKey = (['en', 'hi', 'mr', 'bn', 'gu', 'ta', 'te', 'pa'] as const).includes(language as SupportedLanguageCode) ? language as SupportedLanguageCode : 'en'
  return cropNames[languageKey][key] ?? cropName
}
