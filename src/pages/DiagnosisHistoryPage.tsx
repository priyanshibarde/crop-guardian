import { CalendarClock, ChevronRight, ClipboardList } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, getDiagnoses, type BackendDiagnosis } from '../api/client'
import { Card, PageHeader, Pill } from '../components/ui/UI'
import { translateCropName, useLanguage } from '../i18n'

function statusFor(item: BackendDiagnosis, t: Record<string, string>) {
  if (item.status === 'completed') return { label: t.completed, tone: 'green' as const }
  if (item.status === 'failed') return { label: t.failed, tone: 'red' as const }
  if (item.availability === 'unavailable') return { label: t.aiUnavailable, tone: 'amber' as const }
  return { label: t.pending, tone: 'amber' as const }
}

export function DiagnosisHistoryPage() {
  const { t, lang } = useLanguage()
  const [diagnoses, setDiagnoses] = useState<BackendDiagnosis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getDiagnoses()
      .then((items) => {
        if (active) setDiagnoses(items)
      })
      .catch((reason) => {
        if (active) setError(reason instanceof ApiError ? reason.message : t.cropServiceUnavailable)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [t.cropServiceUnavailable])

  return (
    <>
      <PageHeader eyebrow={t.scanHistory} title={t.diagnosisHistory} />

      {loading && <p className="py-12 text-center text-sm font-bold text-ink/45">{t.pleaseWait}</p>}

      {!loading && error && (
        <Card className="border border-red-200 bg-red-50 text-sm text-red-800 p-5">
          <p className="font-black">{t.uploadFailed}</p>
          <p className="mt-1">{error}</p>
        </Card>
      )}

      {!loading && !error && diagnoses.length === 0 && (
        <Card className="text-center py-12 px-6 bg-slate-50/60 border-2 border-dashed border-emerald-950/10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint text-forest shadow-xs">
            <ClipboardList size={28} />
          </div>
          <h3 className="mt-4 text-lg font-black text-ink">{t.noDiagnosis}</h3>
          <p className="mt-1 text-sm text-ink/55 max-w-sm mx-auto">{t.noDiagnosisText}</p>
          <Link
            to="/scan"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-forest px-5 py-3 text-sm font-extrabold text-white shadow-md hover:bg-emerald-800 transition"
          >
            {t.startScan}
          </Link>
        </Card>
      )}

      {!loading && !error && diagnoses.length > 0 && (
        <div className="space-y-3.5">
          {diagnoses.map((item) => {
            const status = statusFor(item, t)
            const cropTitle = item.predictedCrop ? translateCropName(item.predictedCrop, lang) : t.scan
            return (
              <Link key={item.id} to={`/diagnosis/${item.id}`} className="block group">
                <Card className="transition hover:-translate-y-0.5 hover:shadow-md p-5 border border-emerald-950/5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-forest">{cropTitle}</p>
                      <h2 className="mt-1 text-lg font-black text-ink group-hover:text-forest transition">
                        {item.predictedDisease ?? status.label}
                      </h2>
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-ink/45">
                        <CalendarClock size={14} className="text-forest" />
                        {new Date(item.createdAt).toLocaleDateString(lang === 'en' ? 'en-IN' : lang, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Pill tone={status.tone}>{status.label}</Pill>
                      <ChevronRight className="text-ink/30 group-hover:text-forest transition" size={20} />
                    </div>
                  </div>
                  {item.confidence !== null && item.status === 'completed' && (
                    <p className="mt-4 text-xs font-black text-forest border-t border-ink/5 pt-2.5">
                      {t.modelConfidence}: {Math.round(item.confidence * 100)}%
                    </p>
                  )}
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
