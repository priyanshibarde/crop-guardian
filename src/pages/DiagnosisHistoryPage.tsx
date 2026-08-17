import { CalendarClock, ChevronRight, ClipboardList, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, deleteDiagnosis, getDiagnoses, type BackendDiagnosis } from '../api/client'
import { Card, PageHeader, Pill } from '../components/ui/UI'
import { translateCropName, useLanguage } from '../i18n'

function statusFor(item: BackendDiagnosis, t: Record<string, string>) {
  if (item.availability === 'unsupported_crop') return { label: t.unavailable || 'Unsupported', tone: 'amber' as const }
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
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [targetToDelete, setTargetToDelete] = useState<BackendDiagnosis | null>(null)

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

  const confirmDelete = async () => {
    if (!targetToDelete) return
    setDeletingId(targetToDelete.id)
    try {
      await deleteDiagnosis(targetToDelete.id)
      setDiagnoses((prev) => prev.filter((d) => d.id !== targetToDelete.id))
      setTargetToDelete(null)
    } catch {
      // Keep state
    } finally {
      setDeletingId(null)
    }
  }

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
              <div key={item.id} className="relative group/item">
                <Card className="transition hover:-translate-y-0.5 hover:shadow-md p-5 border border-emerald-950/5">
                  <div className="flex items-start justify-between gap-4">
                    <Link to={`/diagnosis/${item.id}`} className="grow">
                      <p className="text-xs font-black uppercase tracking-widest text-forest">{cropTitle}</p>
                      <h2 className="mt-1 text-lg font-black text-ink group-hover/item:text-forest transition">
                        {item.availability === 'unsupported_crop'
                          ? cropTitle
                          : item.predictedDisease ?? status.label}
                      </h2>
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-ink/45">
                        <CalendarClock size={14} className="text-forest" />
                        {new Date(item.createdAt).toLocaleDateString(lang === 'en' ? 'en-IN' : lang, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </Link>
                    <div className="flex items-center gap-3">
                      <Pill tone={status.tone}>{status.label}</Pill>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setTargetToDelete(item)
                        }}
                        className="grid h-9 w-9 place-items-center rounded-xl text-ink/40 hover:text-red-600 hover:bg-red-50 transition"
                        title={t.deleteScan || 'Delete scan'}
                      >
                        <Trash2 size={16} />
                      </button>
                      <Link to={`/diagnosis/${item.id}`}>
                        <ChevronRight className="text-ink/30 group-hover/item:text-forest transition" size={20} />
                      </Link>
                    </div>
                  </div>
                  {item.confidence !== null && item.status === 'completed' && item.availability !== 'unsupported_crop' && (
                    <p className="mt-4 text-xs font-black text-forest border-t border-ink/5 pt-2.5">
                      {t.modelConfidence}: {Math.round(item.confidence * 100)}%
                    </p>
                  )}
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {targetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center gap-3 text-red-600">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-red-100">
                <Trash2 size={20} />
              </span>
              <h3 className="text-lg font-black text-ink">{t.deleteScanTitle || 'Delete scan?'}</h3>
            </div>
            <p className="mt-3 text-sm text-ink/70 leading-relaxed">
              {t.deleteScanConfirm || 'Are you sure you want to delete this scan and diagnosis history? This action cannot be undone.'}
            </p>
            <p className="mt-2 text-xs text-ink/50">
              {t.deleteScanWarning || 'This permanently removes the uploaded leaf photo, AI diagnosis, and recommendations.'}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setTargetToDelete(null)}
                className="rounded-xl border border-ink/10 px-4 py-2.5 text-sm font-bold text-ink/70 hover:bg-slate-50 transition"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => void confirmDelete()}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition disabled:opacity-50"
              >
                {deletingId ? t.deleting || 'Deleting…' : t.delete || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
