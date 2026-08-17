import type { LanguageCode, SupportedLanguageCode } from './index'

export const cropNames: Record<SupportedLanguageCode, Record<string, string>> = {
  en: {
    Rice: 'Rice', Wheat: 'Wheat', Maize: 'Maize', Corn: 'Corn', 'Corn (maize)': 'Corn (Maize)', Cotton: 'Cotton', Sugarcane: 'Sugarcane',
    Tomato: 'Tomato', Potato: 'Potato', Onion: 'Onion', Soybean: 'Soybean', Chickpea: 'Chickpea', Groundnut: 'Groundnut',
    Mustard: 'Mustard', Chilli: 'Chilli', Pepper: 'Pepper', 'Pepper, bell': 'Bell Pepper', Grapes: 'Grapes', Grape: 'Grape',
    Mango: 'Mango', Banana: 'Banana', Apple: 'Apple', Blueberry: 'Blueberry', Cherry: 'Cherry', Orange: 'Orange',
    Peach: 'Peach', Raspberry: 'Raspberry', Squash: 'Squash', Strawberry: 'Strawberry', Other: 'Other'
  },
  hi: {
    Rice: 'चावल', Wheat: 'गेहूँ', Maize: 'मक्का', Corn: 'मक्का', 'Corn (maize)': 'मक्का', Cotton: 'कपास', Sugarcane: 'गन्ना',
    Tomato: 'टमाटर', Potato: 'आलू', Onion: 'प्याज', Soybean: 'सोयाबीन', Chickpea: 'चना', Groundnut: 'मूंगफली',
    Mustard: 'सरसों', Chilli: 'मिर्च', Pepper: 'शिमला मिर्च', 'Pepper, bell': 'शिमला मिर्च', Grapes: 'अंगूर', Grape: 'अंगूर',
    Mango: 'आम', Banana: 'केला', Apple: 'सेब', Blueberry: 'ब्लूबेरी', Cherry: 'चेरी', Orange: 'संतरा',
    Peach: 'आड़ू', Raspberry: 'रास्पबेरी', Squash: 'कद्दू', Strawberry: 'स्ट्रॉबेरी', Other: 'अन्य'
  },
  mr: {
    Rice: 'तांदूळ', Wheat: 'गहू', Maize: 'मका', Corn: 'मका', 'Corn (maize)': 'मका', Cotton: 'कापूस', Sugarcane: 'ऊस',
    Tomato: 'टोमॅटो', Potato: 'बटाटा', Onion: 'कांदा', Soybean: 'सोयाबीन', Chickpea: 'हरभरा', Groundnut: 'भुईमूग',
    Mustard: 'मोहरी', Chilli: 'मिरची', Pepper: 'ढोबळी मिरची', 'Pepper, bell': 'ढोबळी मिरची', Grapes: 'द्राक्षे', Grape: 'द्राक्षे',
    Mango: 'आंबा', Banana: 'केळी', Apple: 'सफरचंद', Blueberry: 'ब्लूबेरी', Cherry: 'चेरी', Orange: 'संत्रे',
    Peach: 'पीच', Raspberry: 'रासबेरी', Squash: 'भोपळा', Strawberry: 'स्ट्रॉबेरी', Other: 'इतर'
  },
  bn: {
    Rice: 'ধান', Wheat: 'গম', Maize: 'ভুট্টা', Corn: 'ভুট্টা', 'Corn (maize)': 'ভুট্টা', Cotton: 'তুলা', Sugarcane: 'আখ',
    Tomato: 'টমেটো', Potato: 'আলু', Onion: 'পেঁয়াজ', Soybean: 'সয়াবিন', Chickpea: 'ছোলা', Groundnut: 'বাদাম',
    Mustard: 'সরষে', Chilli: 'লঙ্কা', Pepper: 'ক্যাপসিকাম', 'Pepper, bell': 'ক্যাপসিকাম', Grapes: 'আঙুর', Grape: 'আঙুর',
    Mango: 'আম', Banana: 'কলা', Apple: 'আপেল', Blueberry: 'ব্লুবেরি', Cherry: 'চেরি', Orange: 'কমলালেবু',
    Peach: 'পীচ', Raspberry: 'রাস্পবেরি', Squash: 'মিষ্টি কুমড়া', Strawberry: 'স্ট্রবেরি', Other: 'অন্যান্য'
  },
  gu: {
    Rice: 'ચોખા', Wheat: 'ઘઉં', Maize: 'મકાઈ', Corn: 'મકાઈ', 'Corn (maize)': 'મકાઈ', Cotton: 'કપાસ', Sugarcane: 'શેરડી',
    Tomato: 'ટામેટા', Potato: 'બટાટા', Onion: 'ડુંગળી', Soybean: 'સોયાબીન', Chickpea: 'ચણા', Groundnut: 'મગફળી',
    Mustard: 'સરસવ', Chilli: 'મરચું', Pepper: 'કેપ્સિકમ', 'Pepper, bell': 'કેપ્સિકમ', Grapes: 'દ્રાક્ષ', Grape: 'દ્રાક્ષ',
    Mango: 'કેરી', Banana: 'કેળું', Apple: 'સફરજન', Blueberry: 'બ્લૂબેરી', Cherry: 'ચેરી', Orange: 'નારંગી',
    Peach: 'પીચ', Raspberry: 'રાસ્પબેરી', Squash: 'કોળું', Strawberry: 'સ્ટ્રોબેરી', Other: 'અન્ય'
  },
  ta: {
    Rice: 'நெல்', Wheat: 'கோதுமை', Maize: 'மக்காச்சோளம்', Corn: 'மக்காச்சோளம்', 'Corn (maize)': 'மக்காச்சோளம்', Cotton: 'பருத்தி', Sugarcane: 'கரும்பு',
    Tomato: 'தக்காளி', Potato: 'உருளைக்கிழங்கு', Onion: 'வெங்காயம்', Soybean: 'சோயாபீன்', Chickpea: 'கொண்டைக்கடலை', Groundnut: 'நிலக்கடலை',
    Mustard: 'கடுகு', Chilli: 'மிளகாய்', Pepper: 'குடைமிளகாய்', 'Pepper, bell': 'குடைமிளகாய்', Grapes: 'திராட்சை', Grape: 'திராட்சை',
    Mango: 'மாம்பழம்', Banana: 'வாழை', Apple: 'ஆப்பிள்', Blueberry: 'புளூபெர்ரி', Cherry: 'செர்ரி', Orange: 'ஆரஞ்சு',
    Peach: 'பீச்', Raspberry: 'ராஸ்பெர்ரி', Squash: 'பூசணி', Strawberry: 'ஸ்ட்ராபெர்ரி', Other: 'மற்றவை'
  },
  te: {
    Rice: 'వరి', Wheat: 'గోధుమ', Maize: 'మొక్కజొన్న', Corn: 'మొక్కజొన్న', 'Corn (maize)': 'మొక్కజొన్న', Cotton: 'పత్తి', Sugarcane: 'చెరకు',
    Tomato: 'టమాటా', Potato: 'బంగాళాదుంప', Onion: 'ఉల్లిపాయ', Soybean: 'సోయాబీన్', Chickpea: 'శనగ', Groundnut: 'వేరుశనగ',
    Mustard: 'ఆవాలు', Chilli: 'మిరప', Pepper: 'క్యాప్సికమ్', 'Pepper, bell': 'క్యాప్సికమ్', Grapes: 'ద్రాక్ష', Grape: 'ద్రాక్ష',
    Mango: 'మామిడి', Banana: 'అరటి', Apple: 'యాపిల్', Blueberry: 'బ్లూబెర్రీ', Cherry: 'చెర్రీ', Orange: 'నారింజ',
    Peach: 'పీచ్', Raspberry: 'రాస్ప్బెర్రీ', Squash: 'గుమ్మడి', Strawberry: 'స్ట్రాబెర్రీ', Other: 'ఇతర'
  },
  pa: {
    Rice: 'ਚਾਵਲ', Wheat: 'ਕਣਕ', Maize: 'ਮੱਕੀ', Corn: 'ਮੱਕੀ', 'Corn (maize)': 'ਮੱਕੀ', Cotton: 'ਕਪਾਹ', Sugarcane: 'ਗੰਨਾ',
    Tomato: 'ਟਮਾਟਰ', Potato: 'ਆਲੂ', Onion: 'ਪਿਆਜ਼', Soybean: 'ਸੋਯਾਬੀਨ', Chickpea: 'ਛੋਲੇ', Groundnut: 'ਮੂੰਗਫਲੀ',
    Mustard: 'ਸਰ੍ਹੋਂ', Chilli: 'ਮਿਰਚ', Pepper: 'ਸ਼ਿਮਲਾ ਮਿਰਚ', 'Pepper, bell': 'ਸ਼ਿਮਲਾ ਮਿਰਚ', Grapes: 'ਅੰਗੂਰ', Grape: 'ਅੰਗੂਰ',
    Mango: 'ਅੰਬ', Banana: 'ਕੇਲਾ', Apple: 'ਸੇਬ', Blueberry: 'ਬਲੂਬੇਰੀ', Cherry: 'ਚੈਰੀ', Orange: 'ਸੰਤਰਾ',
    Peach: 'ਆੜੂ', Raspberry: 'ਰਸਬੇਰੀ', Squash: 'ਕੱਦੂ', Strawberry: 'ਸਟ੍ਰਾਬੇਰੀ', Other: 'ਹੋਰ'
  },
}

export function translateCropName(cropName: string, language: LanguageCode): string {
  const key = cropName.trim()
  const languageKey = (['en', 'hi', 'mr', 'bn', 'gu', 'ta', 'te', 'pa'] as const).includes(language as SupportedLanguageCode) ? language as SupportedLanguageCode : 'en'
  return cropNames[languageKey][key] ?? cropName
}
