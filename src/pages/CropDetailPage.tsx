import { Activity, AlertTriangle, CalendarDays, ChevronLeft, ScanLine, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError, deleteUserCrop, getUserCropDetail } from '../api/client'
import { getCropGuidance } from '../data/cropGuidance'
import { getRecommendations } from '../services/recommendationService'
import type { UserCropDetail } from '../types'
import { Card, Modal, PageHeader, Pill } from '../components/ui/UI'
import { translateCropName, useLanguage } from '../i18n'

function statusFor(detail: UserCropDetail, t: Record<string, string>) {
  if (!detail.latestDiagnosis) return { label: t.noDiagnosis, tone: 'amber' as const }
  if (detail.latestDiagnosis.availability === 'unsupported_crop') return { label: t.unavailable || 'Unsupported', tone: 'amber' as const }
  if (detail.latestDiagnosis.availability === 'unavailable') return { label: t.aiUnavailable, tone: 'amber' as const }
  if (detail.latestDiagnosis.status === 'pending') return { label: t.analysisPending, tone: 'amber' as const }
  if (detail.latestDiagnosis.status === 'failed') return { label: t.analysisFailed, tone: 'red' as const }
  return { label: t.diagnosisComplete, tone: 'green' as const }
}

export function CropDetailPage() {
  const { t, lang } = useLanguage()
  const { id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<UserCropDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Crop delete state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let active = true
    if (!id) return
    getUserCropDetail(id)
      .then((value) => {
        if (active) setDetail(value)
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof ApiError && reason.status === 404
              ? t.diagnosisNotFoundText
              : t.cropServiceUnavailable
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id, t.cropServiceUnavailable, t.diagnosisNotFoundText])

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    setError('')
    try {
      await deleteUserCrop(id)
      navigate('/crops', { replace: true })
    } catch {
      setError(t.cropDeleteFailed)
      setIsDeleting(false)
    }
  }

  if (loading) return <p className="py-12 text-center text-sm font-bold text-ink/45">{t.loadingCrops}</p>

  if (error || !detail) {
    return (
      <Card className="text-center py-12">
        <p className="font-extrabold text-ink">{error || t.cropServiceUnavailable}</p>
        <Link
          to="/crops"
          className="mt-5 inline-flex rounded-2xl bg-forest px-5 py-3 text-sm font-extrabold text-white"
        >
          {t.allCrops}
        </Link>
      </Card>
    )
  }

  const crop = detail.crop
  const guidance = getCropGuidance(crop.name)
  const status = statusFor(detail, t)
  const recommendations = getRecommendations({
    cropName: crop.name,
    cropStage: crop.stage,
    diagnosis: detail.latestDiagnosis,
  })

  const cropTitle = crop.customName || translateCropName(crop.name, lang)

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/crops"
          className="inline-flex items-center gap-1 text-sm font-extrabold text-forest hover:text-emerald-800 transition"
        >
          <ChevronLeft size={18} />
          {t.allCrops}
        </Link>
        <button
          onClick={() => setIsConfirmingDelete(true)}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold text-red-600 hover:bg-red-50 transition border border-red-200/50"
        >
          <Trash2 size={14} />
          {t.deleteCrop}
        </button>
      </div>

      <PageHeader
        eyebrow={t.cropMonitoring}
        title={cropTitle}
        action={
          <Link
            to={`/scan?userCropId=${encodeURIComponent(crop.id)}`}
            className="flex items-center gap-2 rounded-2xl bg-forest px-4 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-emerald-800 transition"
          >
            <ScanLine size={16} />
            {t.newScan}
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-ink/40">
                  {detail.catalog?.scientificName || crop.variety || t.cropInformation}
                </p>
                <h2 className="mt-1 text-2xl font-black text-ink">{cropTitle}</h2>
              </div>
              <Pill tone={status.tone}>{status.label}</Pill>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-ink/70 sm:grid-cols-2">
              {crop.stage && (
                <p>
                  <span className="font-extrabold text-ink">{t.growthStage}:</span> {crop.stage}
                </p>
              )}
              {crop.plantedAt && (
                <p className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-forest" />
                  <span>
                    {t.planted} {crop.plantedAt}
                  </span>
                </p>
              )}
              {crop.area && (
                <p>
                  <span className="font-extrabold text-ink">{t.area}:</span> {crop.area}{' '}
                  {crop.areaUnit || ''}
                </p>
              )}
              {crop.notes && (
                <p className="sm:col-span-2">
                  <span className="font-extrabold text-ink">{t.notes}:</span> {crop.notes}
                </p>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 font-black text-lg text-ink">
              <Activity size={20} className="text-forest" />
              {t.diagnosisHistory}
            </h2>
            {detail.diagnoses.length === 0 ? (
              <p className="mt-4 text-sm text-ink/55">{t.noDiagnosisText}</p>
            ) : (
              <div className="mt-4 space-y-3">
                {detail.diagnoses.map((diagnosis) => (
                  <Link
                    key={diagnosis.id}
                    to={`/diagnosis/${diagnosis.id}`}
                    className="flex items-center justify-between rounded-2xl bg-sand/60 p-3.5 text-sm hover:bg-sand transition"
                  >
                    <div>
                      <span className="font-bold text-ink">
                        {diagnosis.status === 'completed'
                          ? diagnosis.predictedDisease
                          : diagnosis.availability === 'unavailable'
                          ? t.aiUnavailable
                          : diagnosis.status === 'failed'
                          ? t.analysisFailed
                          : t.analysisPending}
                      </span>
                      <span className="ml-2 text-xs text-ink/45">
                        {new Date(diagnosis.createdAt).toLocaleDateString(lang === 'en' ? 'en-IN' : lang)}
                      </span>
                    </div>
                    <Pill
                      tone={
                        diagnosis.status === 'failed'
                          ? 'red'
                          : diagnosis.status === 'completed'
                          ? 'green'
                          : 'amber'
                      }
                    >
                      {diagnosis.status === 'completed'
                        ? t.completed
                        : diagnosis.status === 'failed'
                        ? t.failed
                        : t.pending}
                    </Pill>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {guidance && (
            <Card className="bg-mint/40 border border-emerald-200/50">
              <h2 className="font-black text-base text-ink">
                {t.generalCareFor} {translateCropName(guidance.cropName, lang)}
              </h2>
              <div className="mt-4 space-y-4 text-sm text-ink/75">
                <div>
                  <p className="font-extrabold text-forest">{t.care}</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5">
                    {guidance.generalCare.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-extrabold text-forest">{t.watering}</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5">
                    {guidance.watering.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                {crop.stage && guidance.growthStages[crop.stage] && (
                  <p>
                    <span className="font-extrabold text-forest">{t.stageNote}:</span>{' '}
                    {guidance.growthStages[crop.stage]}
                  </p>
                )}
              </div>
            </Card>
          )}

          {recommendations.status === 'available' && (
            <Card className="bg-sand/70">
              <h2 className="font-black text-base text-ink">{t.safeNextChecks}</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink/75">
                {recommendations.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-ink/50 leading-relaxed border-t border-ink/5 pt-3">
                {recommendations.disclaimer}
              </p>
            </Card>
          )}

          <Card>
            <h2 className="font-black text-base text-ink">{t.cropTimeline}</h2>
            {detail.timeline.length === 0 ? (
              <p className="mt-3 text-sm text-ink/55">{t.noTimelineEvents}</p>
            ) : (
              <div className="mt-4 space-y-4">
                {detail.timeline.map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-forest" />
                    <div>
                      <p className="text-sm font-extrabold text-ink">
                        {event.label === 'Crop added'
                          ? t.cropAdded
                          : event.label === 'Scan uploaded'
                          ? t.scanUploaded
                          : event.label === 'Diagnosis completed'
                          ? t.diagnosisCompleted
                          : event.label}
                      </p>
                      <p className="text-xs text-ink/45">
                        {new Date(event.occurredAt).toLocaleString(lang === 'en' ? 'en-IN' : lang)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Crop Modal */}
      <Modal
        isOpen={isConfirmingDelete}
        onClose={() => !isDeleting && setIsConfirmingDelete(false)}
        title={t.deleteCropTitle}
      >
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={28} />
          </div>
          <h4 className="mt-4 text-base font-black text-ink">{t.deleteCropConfirm}</h4>
          <p className="mt-2 text-sm text-ink/60">{cropTitle}</p>
          <p className="mt-1 text-xs text-ink/45">{t.deleteCropWarning}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setIsConfirmingDelete(false)}
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
