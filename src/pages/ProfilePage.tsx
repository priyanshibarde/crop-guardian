import {
  AlertTriangle,
  Bell,
  Globe2,
  Info,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteAccount, getProfile, updateProfile } from '../api/client'
import { Card, PageHeader } from '../components/ui/UI'
import { languages, useLanguage, type LanguageCode } from '../i18n'
import { useAuth } from '../context/AuthContext'
import { storage } from '../services/storageService'
import type { UserProfile } from '../types'

export function ProfilePage() {
  const { lang, setLang, t } = useLanguage()
  const { user, logout } = useAuth()
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
  const [name, setName] = useState(profile.fullName || profile.name)
  const [location, setLocation] = useState(profile.location)
  const [phone, setPhone] = useState(profile.phone || '')
  const [role, setRole] = useState<'farmer' | 'home-grower'>(profile.role || 'farmer')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    let active = true
    getProfile()
      .then((server) => {
        if (!active) return
        const merged: UserProfile = {
          ...profile,
          ...server,
          name: server.fullName || server.name,
          fullName: server.fullName || server.name,
          location: server.location,
          phone: server.phone,
          role: server.role || 'farmer',
          language: server.language,
          selectedCrops: profile.selectedCrops || [],
          pets: profile.pets || [],
        }
        setProfile(merged)
        setName(merged.fullName || merged.name)
        setLocation(merged.location)
        setPhone(merged.phone || '')
        setRole(merged.role || 'farmer')
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

  const save = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const server = await updateProfile({
        fullName: name.trim(),
        location: location.trim(),
        phone: phone.trim() || undefined,
        role,
        language: lang,
      })
      const next: UserProfile = {
        ...profile,
        ...server,
        name: server.fullName || name.trim(),
        fullName: server.fullName || name.trim(),
        location: server.location,
        phone: server.phone,
        role: server.role,
        language: server.language || lang,
        selectedCrops: profile.selectedCrops || [],
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

  const handleSignOut = async () => {
    await logout()
    storage.resetOnboarding()
    localStorage.removeItem('cg-onboarding-draft')
    navigate('/onboarding/welcome', { replace: true })
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    setDeleteError('')
    try {
      await deleteAccount()
      await logout()
      storage.resetOnboarding()
      localStorage.removeItem('cg-onboarding-draft')
      navigate('/onboarding/welcome', { replace: true, state: { message: t.accountDeleted } })
    } catch (err) {
      setDeleteError(t.accountDeleteFailed || 'Failed to delete account. Please try again.')
      setIsDeletingAccount(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow={t.accountAndPreferences} title={t.profile} />

      {success && (
        <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-800 animate-fadeIn">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-700 animate-fadeIn">
          {error}
        </div>
      )}

      {/* User Header Summary Card */}
      <Card className="flex items-center gap-5 p-6 shadow-sm mb-7">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sun text-2xl font-black text-ink shadow-xs">
          {name.charAt(0).toUpperCase() || <User size={26} />}
        </span>
        <div>
          <h2 className="text-xl font-black text-ink">{name || 'Farmer'}</h2>
          <p className="text-sm font-bold text-ink/55">
            {role === 'farmer' ? t.farmer : t.homeGrower}
            {location ? ` · ${location}` : ''}
          </p>
          {user?.email && <p className="text-xs text-ink/40 font-medium mt-0.5">{user.email}</p>}
        </div>
      </Card>

      <div className="space-y-7">
        {/* SECTION 1: ACCOUNT */}
        <section className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-forest px-1">
            {t.account || 'Account'}
          </h3>
          <Card className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-ink/60 mb-1.5">
                {t.name}
              </label>
              <div className="relative">
                <input
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl bg-sand/60 px-4 py-3 text-sm font-bold text-ink outline-forest border border-ink/5 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink/60 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="text-forest" />
                    {t.email || 'Email address'}
                  </span>
                </label>
                <input
                  disabled
                  value={user?.email || 'user@cropguardian.org'}
                  className="w-full rounded-2xl bg-slate-100/70 px-4 py-3 text-sm font-medium text-ink/50 border border-ink/5 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink/60 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} className="text-forest" />
                    {t.phone || 'Phone number'}
                  </span>
                </label>
                <input
                  disabled={loading}
                  value={phone}
                  placeholder={t.phoneOptional || 'Phone number (optional)'}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl bg-sand/60 px-4 py-3 text-sm font-bold text-ink outline-forest border border-ink/5 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink/60 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-forest" />
                    {t.location}
                  </span>
                </label>
                <input
                  disabled={loading}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-2xl bg-sand/60 px-4 py-3 text-sm font-bold text-ink outline-forest border border-ink/5 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink/60 mb-1.5">
                  {t.role || 'Role'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('farmer')}
                    className={`rounded-xl py-3 px-3 text-xs font-black transition text-center ${
                      role === 'farmer' ? 'bg-forest text-white shadow-xs' : 'bg-sand/60 text-ink/60 hover:bg-sand'
                    }`}
                  >
                    {t.farmer}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('home-grower')}
                    className={`rounded-xl py-3 px-3 text-xs font-black transition text-center ${
                      role === 'home-grower' ? 'bg-forest text-white shadow-xs' : 'bg-sand/60 text-ink/60 hover:bg-sand'
                    }`}
                  >
                    {t.homeGrower}
                  </button>
                </div>
              </div>
            </div>

            <button
              disabled={saving || loading}
              onClick={() => void save()}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-5 py-3.5 font-black text-white shadow-md hover:bg-emerald-800 transition disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? t.saving : t.saveChanges}
            </button>
          </Card>
        </section>

        {/* SECTION 2: PREFERENCES */}
        <section className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-forest px-1">
            {t.preferences || 'Preferences'}
          </h3>
          <Card className="p-6 space-y-5">
            {/* Language */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-forest">
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
                className="rounded-xl bg-sand px-3.5 py-2.5 text-sm font-bold text-ink outline-forest border border-ink/5 focus:bg-white"
              >
                {languages.map(([id, native, languageName]) => (
                  <option key={id} value={id}>
                    {native} ({languageName})
                  </option>
                ))}
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between gap-4 border-t border-ink/5 pt-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
                  <Bell size={20} />
                </span>
                <div>
                  <p className="font-black text-ink">{t.notifications || 'Notifications'}</p>
                  <p className="text-xs text-ink/50">{t.notificationsDesc || 'Receive weather advisories and disease risk updates'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notificationsEnabled ? 'bg-forest' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={notificationsEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </Card>
        </section>

        {/* SECTION 3: PRIVACY & SECURITY */}
        <section className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-forest px-1">
            {t.privacyAndSecurity || 'Privacy & Security'}
          </h3>
          <Card className="p-6 space-y-4">
            <div className="flex items-start gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
              <ShieldCheck size={22} className="text-forest shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-ink/75">
                <p className="font-black text-forest text-sm mb-1">{t.privacyNotice || 'Privacy & Data Protection'}</p>
                <p>{t.privacyNoticeDesc || 'Your personal data, uploaded photos, and farm diagnostics are strictly private to your account and never shared with third parties.'}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => void handleSignOut()}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-ink/15 bg-white px-5 py-3 text-sm font-bold text-ink hover:bg-slate-50 transition"
              >
                <LogOut size={16} />
                {t.signOut || 'Sign out'}
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/50 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-100 hover:text-red-700 transition"
              >
                <Trash2 size={16} />
                {t.deleteAccount || 'Delete account'}
              </button>
            </div>
          </Card>
        </section>

        {/* SECTION 4: APP INFORMATION */}
        <section className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-forest px-1">
            {t.appInformation || 'App Information'}
          </h3>
          <Card className="p-6 space-y-3 bg-slate-50/60 border">
            <div className="flex items-center justify-between text-xs font-bold text-ink/70">
              <span className="flex items-center gap-1.5">
                <Info size={15} className="text-forest" />
                {t.appVersion || 'App version'}
              </span>
              <span className="font-mono font-black text-forest">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-ink/70 border-t border-ink/5 pt-3">
              <span>{t.modelInfo || 'Model information'}</span>
              <span className="text-ink/60">{t.modelInfoTitle || 'MobileNetV2 (38 classes)'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-ink/50 border-t border-ink/5 pt-3">
              {t.modelOutputDisclaimer}
            </p>
          </Card>
        </section>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center gap-3 text-red-600">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-red-100">
                <AlertTriangle size={24} />
              </span>
              <h3 className="text-lg font-black text-ink">{t.deleteAccountTitle || 'Permanently delete account?'}</h3>
            </div>
            <p className="mt-3 text-sm text-ink/75 leading-relaxed font-bold">
              {t.deleteAccountConfirm || 'Are you sure you want to delete your Crop Guardian account? This action is permanent and cannot be undone.'}
            </p>
            <p className="mt-2 text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 leading-relaxed">
              {t.deleteAccountWarning || 'This will permanently remove your account, profile, all registered crops, scan history, AI diagnoses, uploaded images, and personal data.'}
            </p>
            {deleteError && <p className="mt-2 text-xs font-bold text-red-600">{deleteError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-ink/10 px-4 py-2.5 text-sm font-bold text-ink/70 hover:bg-slate-50 transition"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => void handleDeleteAccount()}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeletingAccount ? t.deleting || 'Deleting…' : t.deleteAccount || 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
