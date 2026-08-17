import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  FileText,
  HeartPulse,
  Languages,
  MapPin,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  Trash2,
} from 'lucide-react'
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
  const { t, lang, setLang } = useLanguage()
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-[#f5f7f3] text-ink selection:bg-mint selection:text-forest">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#f5f7f3]/90 backdrop-blur-md border-b border-emerald-950/5">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-forest text-white shadow-xs">
              <HeartPulse size={22} />
            </span>
            <span className="font-black text-lg text-forest tracking-tight leading-none">
              CROP<br />GUARDIAN
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LanguageCode)}
              aria-label="Language selector"
              className="rounded-xl border border-ink/10 bg-white px-3 py-1.5 text-xs font-black text-ink shadow-xs focus:outline-none"
            >
              {languages.map(([id, native, name]) => (
                <option key={id} value={id}>
                  {native} ({name})
                </option>
              ))}
            </select>
            <button
              onClick={() => navigate('/onboarding/auth?mode=login')}
              className="rounded-xl border border-forest/20 bg-white px-4 py-2 text-xs font-black text-forest hover:bg-slate-50 transition shadow-xs"
            >
              {t.signIn}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-5 pt-10 pb-16 lg:pt-16 lg:pb-20">
        <div className="grid lg:grid-cols-[1.2fr_.9fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-3.5 py-1.5 text-xs font-extrabold text-forest">
              <Sparkles size={14} />
              {t.aiAssistedAssessment}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black text-ink leading-[1.1] tracking-tight">
              {t.heroTitle || 'AI-powered crop health assistant for smarter farming.'}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-ink/70 leading-relaxed max-w-xl">
              {t.heroSubtitle || 'Scan leaf photos, detect diseases early, understand symptoms, and get actionable agricultural guidance.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/onboarding/language')}
                className="rounded-2xl bg-coral px-8 py-4 text-base font-black text-white shadow-lg hover:bg-orange-600 hover:shadow-xl transition-all transform active:scale-95"
              >
                {t.getStarted}
              </button>
              <button
                onClick={() => navigate('/onboarding/auth?mode=register')}
                className="rounded-2xl border-2 border-forest/20 bg-white px-7 py-4 text-base font-black text-forest hover:bg-slate-50 transition shadow-sm"
              >
                {t.createAccount || 'Create account'}
              </button>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs font-bold text-ink/55">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-forest" />
                14+ Supported Crops
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-forest" />
                8 Indian Languages
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-forest" />
                100% Private & Secure
              </span>
            </div>
          </div>

          {/* Hero Banner Card */}
          <div className="relative rounded-[36px] bg-gradient-to-br from-forest to-emerald-950 p-8 text-white shadow-2xl overflow-hidden">
            <span className="absolute -right-12 -top-12 h-56 w-56 rounded-full border-[32px] border-emerald-300/15" />
            <div className="relative z-10">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white shadow-xs">
                <Sprout size={28} />
              </div>
              <h2 className="mt-6 text-2xl sm:text-3xl font-black">{t.welcome}</h2>
              <p className="mt-3 text-sm text-emerald-100/85 leading-relaxed">{t.welcomeText}</p>

              <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur-xs border border-white/15">
                <div className="flex items-center justify-between text-xs font-black text-emerald-200 uppercase tracking-wider">
                  <span>Leaf Disease Detection</span>
                  <span>Active Model</span>
                </div>
                <p className="mt-1 font-black text-white text-base">MobileNetV2 Plant Classifier</p>
                <p className="text-xs text-emerald-100/70 mt-0.5">38 Health & Disease Classes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 border-y border-emerald-950/5">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-forest">Simple 4-Step Process</span>
            <h2 className="mt-2 text-3xl font-black text-ink">{t.howItWorks || 'How it works'}</h2>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: t.step1Title || '1. Add your crop', desc: t.step1Desc || 'Add crops you grow to personalize your health monitoring.' },
              { num: '02', title: t.step2Title || '2. Take or upload photo', desc: t.step2Desc || 'Capture a clear, close-up photo of any diseased leaf.' },
              { num: '03', title: t.step3Title || '3. AI analyzes image', desc: t.step3Desc || 'Our model evaluates spots, lesions, and symptoms in seconds.' },
              { num: '04', title: t.step4Title || '4. Review guidance', desc: t.step4Desc || 'Get clear explanations, treatment steps, and prevention tips.' },
            ].map((step) => (
              <div key={step.num} className="rounded-3xl bg-[#f5f7f3] p-6 border border-emerald-950/5 relative flex flex-col justify-between">
                <span className="text-2xl font-black text-forest/30 font-mono">{step.num}</span>
                <div className="mt-4">
                  <h3 className="text-lg font-black text-ink">{step.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink/65">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-forest">Features & Capabilities</span>
          <h2 className="mt-2 text-3xl font-black text-ink">{t.featuresTitle || 'Comprehensive Crop Protection'}</h2>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Camera, title: t.feat1Title || 'AI Crop Diagnosis', desc: t.feat1Desc || 'Instant detection of diseases with severity indicators and confidence scoring.' },
            { icon: Sprout, title: t.feat2Title || 'Crop Tracking', desc: t.feat2Desc || 'Track plant growth stages, health scores, and scheduled farming tasks.' },
            { icon: Activity, title: t.feat3Title || 'Disease History', desc: t.feat3Desc || 'Maintain photo records and diagnosis logs for every field and season.' },
            { icon: FileText, title: t.feat4Title || 'Agricultural Recommendations', desc: t.feat4Desc || 'Practical organic and chemical treatment advice tailored for farmers.' },
            { icon: Languages, title: t.feat5Title || 'Multilingual Support', desc: t.feat5Desc || 'Available in 8 Indian languages with localized crop terminology.' },
            { icon: Shield, title: t.feat6Title || 'Privacy-Focused Account', desc: t.feat6Desc || 'Full control over your data with secure storage and single-click account deletion.' },
          ].map((feat, i) => (
            <div key={i} className="rounded-3xl bg-white p-6 shadow-sm border border-emerald-950/5 hover:-translate-y-1 hover:shadow-md transition">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-forest shadow-xs">
                <feat.icon size={22} />
              </span>
              <h3 className="mt-4 text-base font-black text-ink">{feat.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink/60">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 rounded-[36px] bg-forest p-8 sm:p-12 text-center text-white shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black max-w-lg mx-auto leading-tight">
            {t.welcome}
          </h2>
          <p className="mt-3 text-sm text-emerald-100/80 max-w-md mx-auto">
            {t.welcomeText}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate('/onboarding/language')}
              className="rounded-2xl bg-coral px-8 py-4 text-sm font-black text-white shadow-lg hover:bg-orange-600 transition"
            >
              {t.getStarted}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-950/5 py-8 text-center text-xs font-bold text-ink/40">
        <p>© 2026 Crop Guardian. Built for resilient and informed farming.</p>
      </footer>
    </main>
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
