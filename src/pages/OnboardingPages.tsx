import { ArrowLeft, ArrowRight, Check, CheckCircle2, HeartPulse, MapPin, Plus, Search, ShieldCheck, Sprout, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createPet, createUserCrop, getPets, getProfile, getUserCrops, updateProfile, type LoginInput, type RegisterInput } from '../api/client'
import { languages, isTranslatedLanguage, translateCropName, useLanguage, type LanguageCode } from '../i18n'
import { storage } from '../services/storageService'
import type { CropChoice, Pet, UserProfile } from '../types'
import { useAuth } from '../context/AuthContext'

const cropChoices: CropChoice[] = [
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

const draftKey = 'cg-onboarding-draft'
const getDraft = (): Record<string, any> => {
  try {
    return JSON.parse(localStorage.getItem(draftKey) || '{}')
  } catch {
    return {}
  }
}
const saveDraft = (value: Record<string, unknown>) =>
  localStorage.setItem(draftKey, JSON.stringify({ ...getDraft(), ...value }))

const formatStep = (t: Record<string, string>, current: number) => `${t.step} ${current} ${t.of} 6`

const Shell = ({ children }: { children: ReactNode }) => (
  <main className="mx-auto flex min-h-screen max-w-xl flex-col bg-[#f5f7f3] px-5 py-7 sm:justify-center">
    <div className="mb-8 flex items-center gap-3 text-lg font-black text-forest">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-forest text-white shadow-xs">
        <HeartPulse size={22} />
      </span>
      <span>
        CROP
        <br />
        GUARDIAN
      </span>
    </div>
    {children}
  </main>
)

const Step = ({ label }: { label: string }) => (
  <p className="text-xs font-black uppercase tracking-[.16em] text-forest/70">{label}</p>
)

export function WelcomePage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  return (
    <Shell>
      <div className="rounded-[32px] bg-forest p-7 text-white shadow-lg sm:p-9">
        <span className="grid h-16 w-16 place-items-center rounded-3xl bg-white/15 shadow-xs">
          <Sprout size={32} />
        </span>
        <h1 className="mt-7 text-3xl sm:text-4xl font-black leading-tight">Crop Guardian</h1>
        <p className="mt-4 text-base font-bold leading-relaxed text-emerald-100">{t.welcome}</p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">{t.welcomeText}</p>
        <ul className="mt-6 space-y-2.5 text-sm font-bold text-emerald-50">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {t.scanCrop}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {t.diseaseIntelligence}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {t.recommendations}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {t.tracking}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {t.earlyWarning}
          </li>
        </ul>
      </div>

      <div className="mt-6 grid gap-3">
        <button
          onClick={() => navigate('/onboarding/language')}
          className="rounded-2xl bg-coral px-5 py-4 font-black text-white shadow-md hover:bg-orange-600 transition"
        >
          {t.getStarted}
        </button>
        <button
          onClick={() => navigate('/onboarding/auth?mode=login')}
          className="rounded-2xl border-2 border-forest/20 bg-white px-5 py-3.5 font-black text-forest hover:bg-slate-50 transition"
        >
          {t.signIn}
        </button>
      </div>

      <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs font-bold text-ink/45">
        <ShieldCheck size={15} />
        {t.localOnly}
      </p>
    </Shell>
  )
}

export function LanguageSelectionPage() {
  const { lang, setLang, t } = useLanguage()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const list = useMemo(
    () => languages.filter(([, native, name]) => `${native} ${name}`.toLowerCase().includes(query.toLowerCase())),
    [query]
  )
  const choose = (id: LanguageCode) => {
    setLang(id)
    sessionStorage.setItem('cg-pending-language', id)
    saveDraft({ language: id })
    navigate('/onboarding/auth')
  }

  return (
    <Shell>
      <Step label={formatStep(t, 1)} />
      <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-ink">{t.chooseLanguage}</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink/60">{t.chooseNaturalLanguage}</p>

      <label className="mt-5 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xs border border-ink/5">
        <Search size={19} className="text-ink/45" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.searchLanguages}
          className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-ink/40"
        />
      </label>

      <div className="mt-4 grid max-h-[52vh] grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
        {list.map(([id, native, name]) => (
          <button
            key={id}
            onClick={() => choose(id)}
            className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
              lang === id ? 'border-forest bg-mint shadow-xs' : 'border-transparent bg-white hover:border-forest/20'
            }`}
          >
            <span>
              <b className="block text-base font-black text-ink">{native}</b>
              <span className="mt-0.5 block text-xs font-bold text-ink/50">{name}</span>
              {!isTranslatedLanguage(id) && (
                <span className="mt-1 block text-[10px] font-bold text-ink/40">English fallback</span>
              )}
            </span>
            {lang === id && <CheckCircle2 size={20} className="text-forest" />}
          </button>
        ))}
      </div>
    </Shell>
  )
}

export function AuthPage() {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, register, refresh } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>(searchParams.get('mode') === 'login' ? 'login' : 'register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        const input: RegisterInput = { email, password, fullName, languageCode: lang }
        await register(input)
        saveDraft({ name: fullName })
        navigate('/onboarding/setup')
      } else {
        const input: LoginInput = { email, password }
        const profile = await login(input)
        const pendingLanguage = getDraft().language as string | undefined
        if (pendingLanguage && pendingLanguage !== profile.language) {
          await updateProfile({ language: pendingLanguage })
          await refresh()
        }
        sessionStorage.removeItem('cg-pending-language')
        navigate(profile.onboardingCompleted ? '/' : '/onboarding/setup')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.validationRequired)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell>
      <Step label={formatStep(t, 2)} />
      <div className="mt-4 rounded-[32px] bg-forest p-7 text-white shadow-md">
        <span className="grid h-14 w-14 place-items-center rounded-3xl bg-white/15">
          <Sprout size={28} />
        </span>
        <h1 className="mt-6 text-3xl font-black leading-tight">{mode === 'login' ? t.signIn : t.createAccount}</h1>
        <p className="mt-2 text-sm leading-relaxed text-emerald-100">{t.welcomeText}</p>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-3.5 rounded-[28px] bg-white p-6 shadow-sm border border-emerald-950/5">
        {mode === 'register' && (
          <input
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder={t.name}
            className="w-full rounded-2xl bg-sand/60 px-4 py-3.5 text-sm font-bold outline-forest border border-ink/5"
          />
        )}
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t.email}
          className="w-full rounded-2xl bg-sand/60 px-4 py-3.5 text-sm font-bold outline-forest border border-ink/5"
        />
        <input
          required
          minLength={8}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t.password}
          className="w-full rounded-2xl bg-sand/60 px-4 py-3.5 text-sm font-bold outline-forest border border-ink/5"
        />

        {error && <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-coral px-5 py-4 font-black text-white shadow-md hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? t.pleaseWait : mode === 'register' ? t.createAccount : t.signIn}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
          className="w-full py-2 text-sm font-black text-forest hover:underline"
        >
          {mode === 'register' ? t.signIn : t.createAccount}
        </button>
      </form>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-bold text-ink/45">
        <ShieldCheck size={14} />
        {t.localOnly}
      </p>
    </Shell>
  )
}

export function ProfileSetupPage() {
  const { t, lang } = useLanguage()
  const { status, refresh } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [role, setRole] = useState<UserProfile['role']>('farmer')
  const [selected, setSelected] = useState<CropChoice[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [existingCropNames, setExistingCropNames] = useState<string[]>([])
  const [existingPetNames, setExistingPetNames] = useState<string[]>([])
  const [pet, setPet] = useState<Pet>({ id: '', name: '', type: 'Dog', breed: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate('/onboarding/auth', { replace: true })
      return
    }
    if (status !== 'authenticated') return
    let active = true
    Promise.all([getProfile(), getUserCrops(), getPets()])
      .then(([serverProfile, crops, serverPets]) => {
        if (!active) return
        setName(serverProfile.fullName || serverProfile.name || getDraft().name || '')
        setLocation(serverProfile.location || getDraft().location || '')
        setRole(serverProfile.role || getDraft().role || 'farmer')
        setExistingCropNames(crops.map((crop) => crop.customName || crop.name))
        setSelected(
          crops
            .map((crop) => crop.customName || crop.name)
            .filter((crop): crop is CropChoice => cropChoices.includes(crop as CropChoice))
        )
        setExistingPetNames(serverPets.map((item) => item.name))
        setPets(serverPets.map((item) => ({ id: item.id, name: item.name, type: item.type, breed: item.breed })))
        setStep(!serverProfile.fullName && !serverProfile.name ? 0 : !serverProfile.location ? 1 : crops.length === 0 ? 2 : 3)
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
  }, [status, navigate, t.cropServiceUnavailable])

  const toggleCrop = (crop: CropChoice) =>
    setSelected((current) =>
      current.includes(crop) ? current.filter((item) => item !== crop) : [...current, crop]
    )

  const finish = async () => {
    if (!name.trim() || !location.trim() || !selected.length) {
      setError(t.validationRequired)
      return
    }
    setSaving(true)
    setError('')
    try {
      for (const crop of selected.filter((item) => !existingCropNames.includes(item))) {
        await createUserCrop({ name: crop })
      }
      for (const item of pets.filter((value) => value.name.trim() && !existingPetNames.includes(value.name))) {
        await createPet({ name: item.name.trim(), type: item.type.trim() || 'Other', breed: item.breed?.trim() || null })
      }
      const server = await updateProfile({
        fullName: name.trim(),
        location: location.trim(),
        role,
        language: lang,
        onboardingCompleted: true,
      })
      storage.saveProfile({
        ...server,
        name: server.fullName || server.name,
        selectedCrops: selected,
        pets,
        onboardingCompleted: true,
      })
      storage.completeOnboarding()
      localStorage.removeItem(draftKey)
      sessionStorage.removeItem('cg-pending-language')
      await refresh()
      navigate('/', { replace: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.validationRequired)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Shell>
        <p className="py-12 text-center text-sm font-bold text-ink/50">{t.pleaseWait}</p>
      </Shell>
    )
  }

  return (
    <Shell>
      <Step label={formatStep(t, step + 3)} />

      {error && <p className="mt-3 rounded-2xl bg-red-50 p-3.5 text-xs font-bold text-red-700">{error}</p>}

      {step === 0 && (
        <>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-ink">{t.name}</h1>
          <p className="mt-1 text-sm text-ink/60">{t.tellUsGrowingSpace}</p>
          <div className="mt-6 space-y-4 rounded-[28px] bg-white p-6 shadow-sm border border-emerald-950/5">
            <label className="block text-sm font-black text-ink">
              {t.name}
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-2xl bg-sand/60 px-4 py-3.5 text-sm font-bold outline-forest border border-ink/5"
              />
            </label>
            <fieldset>
              <legend className="text-sm font-black text-ink">{t.role}</legend>
              <div className="mt-2.5 grid grid-cols-2 gap-3">
                {([['farmer', t.farmer], ['home-grower', t.homeGrower]] as const).map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setRole(value)}
                    className={`rounded-2xl p-3.5 text-sm font-black transition ${
                      role === value ? 'bg-mint text-forest ring-2 ring-forest shadow-xs' : 'bg-sand/60 text-ink/60 hover:bg-sand'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-ink">{t.location}</h1>
          <label className="mt-6 block rounded-[28px] bg-white p-6 text-sm font-black shadow-sm border border-emerald-950/5">
            <span className="relative block">
              <MapPin className="absolute left-3.5 top-4 text-forest" size={18} />
              <input
                autoFocus
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Pune, Maharashtra"
                className="w-full rounded-2xl bg-sand/60 py-3.5 pl-11 pr-4 text-sm font-bold outline-forest border border-ink/5"
              />
            </span>
          </label>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-ink">{t.chooseCrops}</h1>
          <p className="mt-1 text-sm text-ink/60">{t.selectCropsText}</p>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {cropChoices.map((crop) => (
              <button
                type="button"
                key={crop}
                onClick={() => toggleCrop(crop)}
                className={`rounded-2xl p-3 text-left text-xs font-black transition ${
                  selected.includes(crop) ? 'bg-mint text-forest ring-2 ring-forest shadow-xs' : 'bg-white hover:bg-slate-50 border border-ink/5'
                }`}
              >
                {selected.includes(crop) && <Check size={14} className="mr-1 inline text-forest" />}
                {translateCropName(crop, lang)}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-ink">{t.pets}</h1>
          <p className="mt-1 text-sm text-ink/60">
            {t.noPets} {t.addPet}.
          </p>

          <button
            type="button"
            onClick={() => setPets([])}
            className={`mt-5 w-full rounded-2xl p-4 text-left font-black text-sm transition ${
              pets.length === 0 ? 'bg-mint text-forest ring-2 ring-forest shadow-xs' : 'bg-white border border-ink/5'
            }`}
          >
            {t.noPets}
          </button>

          <div className="mt-4 rounded-[28px] bg-white p-5 shadow-sm border border-emerald-950/5 space-y-3">
            <div className="flex gap-2">
              <input
                value={pet.name}
                onChange={(event) => setPet({ ...pet, name: event.target.value })}
                placeholder={t.petName}
                className="min-w-0 flex-1 rounded-2xl bg-sand/60 px-4 py-3 text-sm font-bold outline-forest border border-ink/5"
              />
              <input
                value={pet.type}
                onChange={(event) => setPet({ ...pet, type: event.target.value })}
                placeholder={t.petType}
                className="w-28 rounded-2xl bg-sand/60 px-3 py-3 text-sm font-bold outline-forest border border-ink/5"
              />
              <button
                type="button"
                onClick={() => {
                  if (pet.name.trim()) {
                    setPets((current) => [...current, { ...pet, id: crypto.randomUUID() }])
                    setPet({ id: '', name: '', type: 'Dog', breed: '' })
                  }
                }}
                className="rounded-2xl bg-forest px-4 text-white shadow-md hover:bg-emerald-800 transition"
              >
                <Plus size={18} />
              </button>
            </div>

            <input
              value={pet.breed || ''}
              onChange={(event) => setPet({ ...pet, breed: event.target.value })}
              placeholder={t.breedOptional}
              className="w-full rounded-2xl bg-sand/60 px-4 py-3 text-sm font-bold outline-forest border border-ink/5"
            />

            {pets.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-mint px-4 py-2.5 text-xs font-bold text-forest">
                <span>
                  {item.name} · {item.type}
                  {item.breed ? ` · ${item.breed}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => setPets((current) => current.filter((value) => value.id !== item.id))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Navigation Buttons */}
      <div className="mt-7 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((value) => value - 1)}
            className="rounded-2xl border-2 border-forest/20 bg-white px-5 py-4 text-forest hover:bg-slate-50 transition"
            aria-label={t.back}
          >
            <ArrowLeft size={18} />
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            disabled={
              (step === 0 && !name.trim()) ||
              (step === 1 && !location.trim()) ||
              (step === 2 && !selected.length)
            }
            onClick={() => setStep((value) => value + 1)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-forest px-5 py-4 font-black text-white shadow-md hover:bg-emerald-800 transition disabled:opacity-40"
          >
            {t.continue}
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={() => void finish()}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-forest px-5 py-4 font-black text-white shadow-md hover:bg-emerald-800 transition disabled:opacity-40"
          >
            {saving ? t.pleaseWait : t.finish}
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </Shell>
  )
}
