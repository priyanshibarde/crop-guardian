import { BellRing, Check, CheckCheck, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDiagnoses, type BackendDiagnosis } from '../api/client'
import { reminders } from '../services/reminderService'
import { Card, PageHeader, Pill } from '../components/ui/UI'
import { translateCropName, useLanguage } from '../i18n'

export function AlertsPage() {
  const { t, lang } = useLanguage()
  const [localReminders, setLocalReminders] = useState(reminders.list())
  const [diagnoses, setDiagnoses] = useState<BackendDiagnosis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getDiagnoses()
      .then((items) => {
        if (active) setDiagnoses(items)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const complete = (id: string) => {
    reminders.complete(id)
    setLocalReminders(reminders.list())
  }

  const markAllRead = () => {
    localReminders.forEach((r) => reminders.complete(r.id))
    setLocalReminders(reminders.list())
  }

  const activeAlerts = diagnoses.filter(
    (d) => d.status === 'completed' && (d.severity === 'High' || d.severity === 'Moderate')
  )

  return (
    <>
      <PageHeader
        eyebrow={t.stayOneStepAhead}
        title={t.alerts}
        action={
          localReminders.some((r) => !r.completed) ? (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-black text-forest hover:bg-mint transition"
            >
              <CheckCheck size={16} />
              {t.markRead}
            </button>
          ) : undefined
        }
      />

      {/* Reminders section */}
      {localReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 font-black text-lg text-ink">{t.cropReminders}</h2>
          <div className="space-y-3">
            {localReminders.map((reminder) => (
              <Card key={reminder.id} className="flex gap-4 p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint text-forest shadow-xs">
                  <BellRing size={22} />
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-ink">{reminder.title}</h3>
                    <Pill tone={reminder.completed ? 'green' : 'amber'}>
                      {reminder.completed ? t.completed : reminder.kind}
                    </Pill>
                  </div>
                  <p className="mt-1 text-sm text-ink/65">
                    {t.due}{' '}
                    {new Date(reminder.dueAt).toLocaleDateString(lang === 'en' ? 'en-IN' : lang, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  {!reminder.completed && (
                    <button
                      onClick={() => complete(reminder.id)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-black text-forest hover:text-emerald-800 transition"
                    >
                      <Check size={14} />
                      {t.markComplete}
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Diagnosis Alerts */}
      <div>
        <h2 className="mb-3 font-black text-lg text-ink">{t.todaysAlerts}</h2>

        {loading ? (
          <p className="py-8 text-center text-sm font-bold text-ink/40">{t.pleaseWait}</p>
        ) : activeAlerts.length === 0 ? (
          <Card className="text-center py-10 bg-emerald-50/40 border border-emerald-100">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-forest">
              <ShieldCheck size={24} />
            </div>
            <h3 className="mt-3 font-black text-ink">{t.noAlertsYet}</h3>
            <p className="mt-1 text-sm text-ink/60 max-w-sm mx-auto">{t.allClearDescription}</p>
          </Card>
        ) : (
          <div className="space-y-3.5">
            {activeAlerts.map((a) => {
              const cropTitle = a.predictedCrop ? translateCropName(a.predictedCrop, lang) : t.crop
              return (
                <Link key={a.id} to={`/diagnosis/${a.id}`} className="block group">
                  <Card className="flex gap-4 p-5 hover:shadow-md transition">
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                        a.severity === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      <AlertTriangle size={22} />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-black text-ink group-hover:text-forest transition">
                          {cropTitle}: {a.predictedDisease}
                        </h3>
                        <Pill tone={a.severity === 'High' ? 'red' : 'amber'}>
                          {a.severity === 'High' ? t.high : t.moderate}
                        </Pill>
                      </div>
                      <p className="mt-1 text-sm text-ink/65 leading-relaxed">
                        {a.symptoms?.[0] || t.protectCropsEarly}
                      </p>
                      <p className="mt-2 text-xs font-bold text-ink/40">
                        {new Date(a.createdAt).toLocaleDateString(lang === 'en' ? 'en-IN' : lang)}
                      </p>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
