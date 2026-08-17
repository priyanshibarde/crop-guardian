import { CalendarDays, ChevronRight, Plus, ScanLine, Trash2, AlertTriangle, Sprout } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteUserCrop, getUserCropDetail, getUserCrops } from '../api/client'
import { translateCropName, useLanguage } from '../i18n'
import type { UserCrop, UserCropDetail } from '../types'
import { Card, Modal, PageHeader, Pill } from '../components/ui/UI'

function diagnosisStatus(detail: UserCropDetail | undefined, t: Record<string, string>) {
  const diagnosis = detail?.latestDiagnosis
  if (!diagnosis) return { label: t.noDiagnosis, tone: 'amber' as const }
  if (diagnosis.availability === 'unsupported_crop') return { label: t.unavailable || 'Unsupported', tone: 'amber' as const }
  if (diagnosis.availability === 'unavailable') return { label: t.aiUnavailable, tone: 'amber' as const }
  if (diagnosis.status === 'pending') return { label: t.analysisPending, tone: 'amber' as const }
  if (diagnosis.status === 'failed') return { label: t.analysisFailed, tone: 'red' as const }
  return { label: diagnosis.predictedDisease ?? t.diagnosisComplete, tone: 'green' as const }
}

export function CropsPage() {
  const { t, lang } = useLanguage()
  const [crops, setCrops] = useState<UserCrop[]>([])
  const [details, setDetails] = useState<Record<string, UserCropDetail>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Crop deletion state
  const [cropToDelete, setCropToDelete] = useState<UserCrop | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadCrops = async () => {
    try {
      const items = await getUserCrops()
      setCrops(items)
      const loaded = await Promise.all(
        items.map(async (item) => {
          try {
            return await getUserCropDetail(item.id)
          } catch {
            return null
          }
        })
      )
      setDetails(
        Object.fromEntries(
          loaded.filter((item): item is UserCropDetail => Boolean(item)).map((item) => [item.crop.id, item])
        )
      )
    } catch {
      setError(t.cropServiceUnavailable)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCrops()
  }, [])

  const handleDelete = async () => {
    if (!cropToDelete) return
    setIsDeleting(true)
    setError('')
    try {
      await deleteUserCrop(cropToDelete.id)
      setCrops((prev) => prev.filter((c) => c.id !== cropToDelete.id))
      setSuccessMessage(t.cropDeleted)
      setTimeout(() => setSuccessMessage(''), 4000)
      setCropToDelete(null)
    } catch {
      setError(t.cropDeleteFailed)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={t.growingSpace}
        title={t.myCrops}
        action={
          <Link
            to="/onboarding/setup"
            className="inline-flex items-center gap-2 rounded-2xl bg-forest px-4 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-emerald-800 transition"
            aria-label={t.addCrop}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">{t.addCrop}</span>
          </Link>
        }
      />

      {successMessage && (
        <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-800 animate-fadeIn">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-700 animate-fadeIn">
          {error}
        </div>
      )}

      {loading && <p className="py-12 text-center text-sm font-bold text-ink/45">{t.loadingCrops}</p>}

      {!loading && crops.length === 0 && (
        <Card className="text-center py-12 px-6 bg-slate-50/60 border-2 border-dashed border-emerald-950/10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint text-forest shadow-xs">
            <Sprout size={28} />
          </div>
          <h3 className="mt-4 text-lg font-black text-ink">{t.noCrops}</h3>
          <p className="mt-1 text-sm text-ink/60 max-w-md mx-auto">{t.completeOnboarding}</p>
          <Link
            to="/onboarding/setup"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-forest px-5 py-3 text-sm font-extrabold text-white shadow-md hover:bg-emerald-800 transition"
          >
            <Plus size={18} />
            {t.addCrop}
          </Link>
        </Card>
      )}

      {!loading && crops.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {crops.map((crop) => {
            const detail = details[crop.id]
            const status = diagnosisStatus(detail, t)
            const cropTitle = crop.customName || translateCropName(crop.name, lang)

            return (
              <Card key={crop.id} className="p-6 hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div
                      className={`grid h-14 w-14 place-items-center rounded-2xl ${crop.color || 'bg-emerald-100'} text-2xl shadow-xs`}
                    >
                      {String.fromCodePoint(127793)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill tone={status.tone}>{status.label}</Pill>
                      <button
                        onClick={() => setCropToDelete(crop)}
                        className="rounded-xl p-2 text-ink/35 hover:bg-red-50 hover:text-red-600 transition"
                        title={t.deleteCrop}
                        aria-label={`${t.deleteCrop} ${cropTitle}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <h2 className="mt-4 text-xl font-black text-ink">{cropTitle}</h2>
                  <p className="text-sm font-bold text-ink/50">{crop.variety || t.cropMonitoring}</p>

                  <div className="mt-5 grid gap-2.5 text-sm text-ink/70">
                    {crop.stage && (
                      <p className="flex items-center gap-2">
                        <span className="font-extrabold text-ink">{t.stage}:</span>
                        <span className="bg-slate-100 px-2.5 py-0.5 rounded-lg text-xs font-bold">{crop.stage}</span>
                      </p>
                    )}
                    {crop.plantedAt && (
                      <p className="flex items-center gap-2 text-ink/60">
                        <CalendarDays size={16} className="text-forest" />
                        <span>
                          {t.planted} {crop.plantedAt}
                        </span>
                      </p>
                    )}
                    {detail?.latestDiagnosis?.status === 'completed' && detail.latestDiagnosis.predictedDisease && (
                      <p className="flex items-center gap-2">
                        <span className="font-extrabold text-ink">{t.latestDiagnosis}:</span>
                        <span className="text-forest font-bold">{detail.latestDiagnosis.predictedDisease}</span>
                      </p>
                    )}
                    {crop.nextTask && (
                      <p className="text-xs text-ink/60 bg-sand/60 p-2.5 rounded-xl">
                        <span className="font-extrabold text-ink/80">{t.monitoringNote}:</span> {crop.nextTask}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-ink/5 pt-4 flex items-center justify-between">
                  <Link
                    to={`/scan?userCropId=${encodeURIComponent(crop.id)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-black text-forest hover:text-emerald-800 transition"
                  >
                    <ScanLine size={17} />
                    {t.scan}
                  </Link>
                  <Link
                    to={`/crops/${crop.id}`}
                    className="inline-flex items-center gap-1 text-sm font-black text-forest hover:text-emerald-800 transition"
                  >
                    {t.cropDetails}
                    <ChevronRight size={17} />
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Crop Confirmation Modal */}
      <Modal
        isOpen={Boolean(cropToDelete)}
        onClose={() => !isDeleting && setCropToDelete(null)}
        title={t.deleteCropTitle}
      >
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={28} />
          </div>
          <h4 className="mt-4 text-base font-black text-ink">
            {t.deleteCropConfirm}
          </h4>
          <p className="mt-2 text-sm text-ink/60 leading-relaxed">
            {cropToDelete?.customName || (cropToDelete ? translateCropName(cropToDelete.name, lang) : '')}
          </p>
          <p className="mt-1 text-xs text-ink/45">
            {t.deleteCropWarning}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setCropToDelete(null)}
              className="rounded-2xl border border-ink/15 bg-white py-3 text-sm font-extrabold text-ink/70 hover:bg-slate-50 transition disabled:opacity-50"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
              className="rounded-2xl bg-red-600 py-3 text-sm font-extrabold text-white shadow-md hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t.deleting}
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  {t.delete}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
