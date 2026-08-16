import { ArrowUpRight, Bell, Camera, CloudSun, Plus, ShieldCheck, Sprout, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDiagnoses, getUserCrops, type BackendDiagnosis } from '../api/client'
import { translateCropName, useLanguage } from '../i18n'
import { storage } from '../services/storageService'
import { useAuth } from '../context/AuthContext'
import type { UserCrop } from '../types'
import { Card, LinkArrow, PageHeader, Pill } from '../components/ui/UI'

export function HomePage() {
  const { t, lang } = useLanguage()
  const { profile: authProfile } = useAuth()
  const profile = authProfile ?? storage.profile()

  const [crops, setCrops] = useState<UserCrop[]>([])
  const [diagnoses, setDiagnoses] = useState<BackendDiagnosis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      getUserCrops().catch(() => []),
      getDiagnoses().catch(() => []),
    ]).then(([userCrops, userDiagnoses]) => {
      if (!active) return
      setCrops(userCrops)
      setDiagnoses(userDiagnoses)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  // Check if any recent diagnosis has high or moderate severity
  const activeAlertDiagnoses = diagnoses.filter(
    (d) => d.status === 'completed' && (d.severity === 'High' || d.severity === 'Moderate')
  )
  const topAlert = activeAlertDiagnoses[0]

  return (
    <>
      <PageHeader
        eyebrow={t.companion}
        title={`${t.greeting}, ${profile?.fullName || profile?.name || 'Farmer'}`}
        action={
          <Link
            to="/alerts"
            className="relative grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm border border-emerald-950/5 hover:bg-slate-50 transition"
            aria-label={t.alerts}
          >
            <Bell size={20} className="text-ink/70" />
            {activeAlertDiagnoses.length > 0 && (
              <i className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-coral animate-pulse" />
            )}
          </Link>
        }
      />

      {profile?.location && (
        <p className="-mt-4 mb-6 text-sm font-extrabold text-ink/50">
          {t.growingIn} {profile.location}
        </p>
      )}

      {/* Hero CTA & Weather Grid */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_.9fr]">
        <Link
          to="/scan"
          className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-forest to-emerald-900 p-7 text-white shadow-lg transition-all duration-300 hover:shadow-xl sm:p-8"
        >
          <span className="absolute -right-8 -top-8 h-44 w-44 rounded-full border-[28px] border-emerald-300/15 group-hover:scale-105 transition-transform duration-500" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-emerald-100 backdrop-blur-sm">
            <ShieldCheck size={14} />
            {t.aiAssistedAssessment}
          </span>
          <h2 className="mt-4 max-w-sm text-2xl sm:text-3xl font-black leading-tight">
            {t.healthierCrop}
          </h2>
          <p className="mt-2 text-sm text-emerald-100/80 max-w-md">
            {t.helpSpotWrong}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-forest shadow-md transition group-hover:bg-emerald-50">
            <Camera size={18} />
            {t.scan}
            <ArrowUpRight size={16} />
          </span>
        </Link>

        <Card className="bg-sand/80 flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sun shadow-sm">
                <CloudSun size={24} />
              </span>
              {profile?.location && (
                <Pill tone="amber">{profile.location.split(',')[0].trim()}</Pill>
              )}
            </div>
            <h3 className="mt-5 text-lg font-black text-ink">{t.humidDay}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">
              {t.generalWeatherAdvisory}
            </p>
          </div>
          <div className="mt-4 border-t border-ink/5 pt-3 flex items-center justify-between text-xs font-bold text-ink/40">
            <span>{t.weather}</span>
            <span>{t.today}</span>
          </div>
        </Card>
      </div>

      {/* My Crops & Early Warning Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_.9fr]">
        {/* User's Real Crops */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-ink">{t.myCrops}</h2>
            <Link to="/crops">
              <LinkArrow>{t.viewAll}</LinkArrow>
            </Link>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm font-bold text-ink/40">{t.loadingCrops}</p>
          ) : crops.length === 0 ? (
            <Card className="text-center py-8 px-6 bg-slate-50/70 border-dashed border-2 border-emerald-950/10">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-mint text-forest">
                <Sprout size={24} />
              </div>
              <h3 className="mt-3 font-extrabold text-ink">{t.noCrops}</h3>
              <p className="mt-1 text-sm text-ink/55 max-w-sm mx-auto">
                {t.noCropsDescription}
              </p>
              <Link
                to="/onboarding/setup"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-800 transition"
              >
                <Plus size={16} />
                {t.addCrop}
              </Link>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {crops.slice(0, 6).map((c) => (
                <Link key={c.id} to={`/crops/${c.id}`} className="block group">
                  <Card className="h-full p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div
                        className={`grid h-11 w-11 place-items-center rounded-2xl ${c.color || 'bg-emerald-100'} text-xl shadow-xs`}
                      >
                        {String.fromCodePoint(127793)}
                      </div>
                      {c.stage && (
                        <span className="text-[11px] font-bold text-ink/50 bg-slate-100 px-2 py-0.5 rounded-full">
                          {c.stage}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-black text-ink text-base group-hover:text-forest transition">
                      {c.customName || translateCropName(c.name, lang)}
                    </h3>
                    <p className="text-xs text-ink/55 truncate">
                      {c.variety || t.cropMonitoring}
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <i
                        className="block h-full rounded-full bg-forest transition-all"
                        style={{ width: `${Math.max(c.health || 85, 20)}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs font-bold text-forest flex items-center justify-between">
                      <span>{c.health > 0 ? `${c.health}% ${t.healthy}` : `${t.healthy}`}</span>
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Real Early Warning / Outbreak Status */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-ink">{t.warning}</h2>
            <Link to="/hotspots">
              <LinkArrow>{t.map}</LinkArrow>
            </Link>
          </div>

          {topAlert ? (
            <Card className="border-l-4 border-red-500 p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600">
                  <AlertTriangle size={22} />
                </span>
                <div>
                  <Pill tone={topAlert.severity === 'High' ? 'red' : 'amber'}>
                    {topAlert.severity === 'High' ? t.high : t.moderate}
                  </Pill>
                  <h3 className="mt-2 text-base font-black text-ink">
                    {topAlert.predictedCrop ? translateCropName(topAlert.predictedCrop, lang) : t.crop}: {topAlert.predictedDisease}
                  </h3>
                  <p className="mt-1 text-sm text-ink/65 leading-relaxed">
                    {topAlert.symptoms?.[0] || t.protectCropsEarly}
                  </p>
                </div>
              </div>
              <Link
                to={`/diagnosis/${topAlert.id}`}
                className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-extrabold text-forest hover:bg-mint transition"
              >
                <span>{t.cropDetails}</span>
                <ArrowUpRight size={14} />
              </Link>
            </Card>
          ) : (
            <Card className="p-6 bg-emerald-50/40 border border-emerald-100">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-forest">
                  <ShieldCheck size={22} />
                </span>
                <div>
                  <Pill tone="green">{t.allClear}</Pill>
                  <h3 className="mt-2 text-base font-black text-ink">{t.noCropAlertsYet}</h3>
                  <p className="mt-1 text-sm text-ink/60 leading-relaxed">
                    {t.allClearDescription}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs font-bold text-forest/80 border-t border-emerald-100 pt-3">
                {t.protectCropsEarly}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Today's Alerts / Recent Scan Activity */}
      <div className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-ink">{t.todaysAlerts}</h2>
          <Link to="/alerts">
            <LinkArrow>{t.seeAll}</LinkArrow>
          </Link>
        </div>

        {diagnoses.length === 0 ? (
          <Card className="text-center py-8 bg-slate-50/60 border-dashed border">
            <p className="font-extrabold text-ink">{t.noAlertsYet}</p>
            <p className="mt-1 text-sm text-ink/55">
              {t.allClearDescription}
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {diagnoses.slice(0, 3).map((item) => (
              <Link key={item.id} to={`/diagnosis/${item.id}`} className="block group">
                <Card className="h-full p-4 border border-emerald-950/5 hover:-translate-y-0.5 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <Pill
                      tone={
                        item.status === 'completed'
                          ? item.severity === 'High'
                            ? 'red'
                            : item.severity === 'Moderate'
                            ? 'amber'
                            : 'green'
                          : item.status === 'failed'
                          ? 'red'
                          : 'amber'
                      }
                    >
                      {item.status === 'completed'
                        ? item.severity || t.completed
                        : item.status === 'failed'
                        ? t.failed
                        : t.pending}
                    </Pill>
                    <span className="text-xs text-ink/40">
                      {new Date(item.createdAt).toLocaleDateString(lang === 'en' ? 'en-IN' : lang)}
                    </span>
                  </div>
                  <p className="mt-3 font-black text-ink group-hover:text-forest transition">
                    {item.predictedCrop ? `${translateCropName(item.predictedCrop, lang)}: ` : ''}
                    {item.predictedDisease || t.aiDiagnosis}
                  </p>
                  <p className="mt-1 text-xs text-ink/55 line-clamp-2">
                    {item.symptoms?.[0] || (item.status === 'completed' ? t.diagnosisComplete : t.analysisPending)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
