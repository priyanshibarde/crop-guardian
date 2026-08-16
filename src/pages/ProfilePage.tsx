import { Globe2, MapPin, RotateCcw, Save, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile } from '../api/client'
import { Card, PageHeader } from '../components/ui/UI'
import { languages, useLanguage, type LanguageCode } from '../i18n'
import { useAuth } from '../context/AuthContext'
import { storage } from '../services/storageService'
import type { CropChoice, UserProfile } from '../types'

const choices: CropChoice[] = ['Rice','Wheat','Maize','Cotton','Sugarcane','Tomato','Potato','Onion','Soybean','Chickpea','Groundnut','Mustard','Chilli','Grapes','Mango','Banana','Other']

export function ProfilePage() {
  const { lang, setLang, t } = useLanguage()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const local = storage.profile()
  const [profile, setProfile] = useState<UserProfile>(local ?? { name: '', location: '', role: 'farmer', language: lang, selectedCrops: [], pets: [], onboardingCompleted: true })
  const [name, setName] = useState(profile.name)
  const [location, setLocation] = useState(profile.location)
  const [crops, setCrops] = useState<CropChoice[]>(profile.selectedCrops || [])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getProfile().then((server) => {
      if (!active) return
      const merged: UserProfile = { ...profile, ...server, name: server.fullName || server.name, language: server.language, selectedCrops: profile.selectedCrops || [], pets: profile.pets || [] }
      setProfile(merged)
      setName(merged.name)
      setLocation(merged.location)
      setLang(merged.language as LanguageCode)
      storage.saveProfile(merged)
    }).catch(() => { if (active) setError('Profile service is unavailable. Showing locally saved information.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const toggle = (crop: CropChoice) => setCrops((current) => current.includes(crop) ? current.filter((item) => item !== crop) : [...current, crop])
  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const server = await updateProfile({ fullName: name.trim(), location: location.trim(), language: lang })
      const next: UserProfile = { ...profile, ...server, name: server.fullName || name.trim(), location: server.location, language: server.language || lang, selectedCrops: crops, pets: profile.pets || [], onboardingCompleted: true }
      setProfile(next)
      storage.saveProfile(next)
    } catch { setError('Unable to save your profile. Please try again.') } finally { setSaving(false) }
  }
  const reset = async () => { await logout(); storage.resetOnboarding(); localStorage.removeItem('cg-onboarding-draft'); navigate('/onboarding/language', { replace: true }) }

  return <><PageHeader eyebrow="Account & preferences" title={t.profile}/>{error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Card className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-full bg-sun text-xl font-black">{name.charAt(0).toUpperCase()}</span><div><h2 className="text-xl font-black">{name}</h2><p className="text-sm text-ink/55">{profile.role === 'farmer' ? t.farmer : t.homeGrower} · {location}</p></div></Card><div className="mt-5 space-y-3"><Card><div className="flex items-center gap-3"><Globe2 className="text-forest"/><div className="flex-1"><p className="font-extrabold">{t.language}</p><p className="text-sm text-ink/50">Choose your app language</p></div><select disabled={loading} value={lang} onChange={(event) => setLang(event.target.value as LanguageCode)} className="max-w-32 rounded-lg bg-sand px-2 py-2 text-sm font-bold outline-none">{languages.map(([id, native, languageName]) => <option key={id} value={id}>{native} — {languageName}</option>)}</select></div></Card><Card><label className="block text-sm font-bold">{t.name}<input disabled={loading} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl bg-sand px-4 py-3 outline-forest"/></label><label className="mt-4 block text-sm font-bold"><span className="flex items-center gap-2"><MapPin size={16}/>{t.location}</span><input disabled={loading} value={location} onChange={(event) => setLocation(event.target.value)} className="mt-2 w-full rounded-xl bg-sand px-4 py-3 outline-forest"/></label><p className="mt-4 text-sm font-bold">{t.myCrops}</p><div className="mt-2 grid grid-cols-2 gap-2">{choices.map((crop) => <button key={crop} onClick={() => toggle(crop)} className={`rounded-lg p-2 text-left text-xs font-bold ${crops.includes(crop) ? 'bg-mint text-forest' : 'bg-sand text-ink/60'}`}>{crop}</button>)}</div><button disabled={saving || loading} onClick={() => void save()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-4 py-3 font-extrabold text-white disabled:opacity-50"><Save size={17}/>{saving ? 'Saving…' : t.saveChanges}</button></Card><Card><div className="flex items-center gap-3"><ShieldCheck className="text-forest"/><div><p className="font-extrabold">Prototype privacy</p><p className="text-sm text-ink/50">Your crop data is stored only in this browser.</p></div></div></Card><button onClick={() => void reset()} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-forest/20 bg-white px-4 py-4 text-sm font-extrabold text-forest"><RotateCcw size={17}/>{t.resetOnboarding}</button></div></>
}
