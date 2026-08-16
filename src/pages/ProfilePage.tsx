import { Check, Globe2, MapPin, RotateCcw, Save, ShieldCheck, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile } from '../api/client'
import { Card, PageHeader } from '../components/ui/UI'
import { languages, translateCropName, useLanguage, type LanguageCode } from '../i18n'
import { useAuth } from '../context/AuthContext'
import { storage } from '../services/storageService'
import type { CropChoice, UserProfile } from '../types'

const choices: CropChoice[] = [
  'Rice',
  'Wheat',
  'Maize',
  'Cotton',
  'Sugarcane',
  'Tomato',
  'Potato',
  'Onion',
  'Soybean',
  'Chickpea',
  'Groundnut',
  'Mustard',
  'Chilli',
  'Grapes',
  'Mango',
  'Banana',
  'Other',
]

export function ProfilePage() {
  const { lang, setLang, t } = useLanguage()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const local = storage.profile()
  const [profile, setProfile] = useState<UserProfile>(
    local ?? {
      name: '',
      location: '',
      role: 'farmer',
      language: lang,
      selectedCrops: [],
      pets: [],
      onboardingCompleted: true,
    }
  )
  const [name, setName] = useState(profile.name)
  const [location, setLocation] = useState(profile.location)
  const [crops, setCrops] = useState<CropChoice[]>(profile.selectedCrops || [])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true
    getProfile()
      .then((server) => {
        if (!active) return
        const merged: UserProfile = {
          ...profile,
          ...server,
          name: server.fullName || server.name,
          language: server.language,
          selectedCrops: profile.selectedCrops || [],
          pets: profile.pets || [],
        }
        setProfile(merged)
        setName(merged.name)
        setLocation(merged.location)
        if (merged.language) setLang(merged.language as LanguageCode)
        storage.saveProfile(merged)
      })
      .catch(() => {
        if (active) setError(t.cropServiceUnavailable)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const toggle = (crop: CropChoice) =>
    setCrops((current) => (current.includes(crop) ? current.filter((item) => item !== crop) : [...current, crop]))

  const save = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const server = await updateProfile({ fullName: name.trim(), location: location.trim(), language: lang })
      const next: UserProfile = {
        ...profile,
        ...server,
        name: server.fullName || name.trim(),
        location: server.location,
        language: server.language || lang,
        selectedCrops: crops,
        pets: profile.pets || [],
        onboardingCompleted: true,
      }
      setProfile(next)
      storage.saveProfile(next)
      setSuccess(t.profileUpdated)
      setTimeout(() => setSuccess(''), 4000)
    } catch {
      setError(t.validationRequired)
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    await logout()
    storage.resetOnboarding()
    localStorage.removeItem('cg-onboarding-draft')
    navigate('/onboarding/language', { replace: true })
  }

  return (
    <>
      <PageHeader eyebrow={t.accountAndPreferences} title={t.profile} />

      {success && (
        <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-800 animate-fadeIn">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-700 animate-fadeIn">
          {error}
        </div>
      )}

      <Card className="flex items-center gap-4 p-6 shadow-sm">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sun text-2xl font-black text-ink shadow-xs">
          {name.charAt(0).toUpperCase() || <User size={24} />}
        </span>
        <div>
          <h2 className="text-xl font-black text-ink">{name || 'Farmer'}</h2>
          <p className="text-sm font-bold text-ink/55">
            {profile.role === 'farmer' ? t.farmer : t.homeGrower}
            {location ? ` · ${location}` : ''}
          </p>
        </div>
      </Card>

      <div className="mt-6 space-y-4">
        {/* Language Selection Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-forest">
                <Globe2 size={20} />
              </span>
              <div>
                <p className="font-black text-ink">{t.language}</p>
                <p className="text-xs text-ink/50">{t.chooseAppLanguage}</p>
              </div>
            </div>
            <select
              disabled={loading}
              value={lang}
              onChange={(event) => setLang(event.target.value as LanguageCode)}
              className="rounded-xl bg-sand px-3 py-2 text-sm font-bold text-ink outline-forest border border-ink/5"
            >
              {languages.map(([id, native, languageName]) => (
                <option key={id} value={id}>
                  {native} ({languageName})
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Profile Form Card */}
        <Card className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-black text-ink">{t.name}</label>
            <input
              disabled={loading}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl bg-sand/60 px-4 py-3 text-sm font-bold text-ink outline-forest border border-ink/5"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-ink">
              <span className="flex items-center gap-1.5">
                <MapPin size={16} className="text-forest" />
                {t.location}
              </span>
            </label>
            <input
              disabled={loading}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="mt-2 w-full rounded-2xl bg-sand/60 px-4 py-3 text-sm font-bold text-ink outline-forest border border-ink/5"
            />
          </div>

          <div>
            <p className="text-sm font-black text-ink">{t.myCrops}</p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {choices.map((crop) => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => toggle(crop)}
                  className={`rounded-xl p-2.5 text-left text-xs font-black transition ${
                    crops.includes(crop) ? 'bg-mint text-forest ring-1 ring-forest' : 'bg-sand/60 text-ink/65 hover:bg-sand'
                  }`}
                >
                  {crops.includes(crop) && <Check size={14} className="inline mr-1 text-forest" />}
                  {translateCropName(crop, lang)}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={saving || loading}
            onClick={() => void save()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-5 py-3.5 font-black text-white shadow-md hover:bg-emerald-800 transition disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? t.saving : t.saveChanges}
          </button>
        </Card>

        {/* Prototype Privacy Card */}
        <Card className="p-5 bg-sand/40">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-forest shadow-xs">
              <ShieldCheck size={20} />
            </span>
            <div>
              <p className="font-black text-sm text-ink">{t.prototypePrivacy}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink/55">{t.secureStorageNote}</p>
            </div>
          </div>
        </Card>

        {/* Reset Onboarding / Sign Out Button */}
        <button
          onClick={() => void reset()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-forest/20 bg-white px-5 py-3.5 text-sm font-black text-forest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
        >
          <RotateCcw size={17} />
          {t.resetOnboarding}
        </button>
      </div>
    </>
  )
}
