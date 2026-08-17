import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, ChevronLeft, CircleHelp, MapPinned, ShieldCheck, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError, deleteDiagnosis, getDiagnosis, type BackendDiagnosis } from '../api/client'
import { storage } from '../services/storageService'
import type { Diagnosis } from '../types'
import { Card, PageHeader, Pill } from '../components/ui/UI'
import { translateCropName, useLanguage } from '../i18n'

function formattedAssessmentDate(date: string, lang: string) {
  if (!date) return 'TODAY'
  if (['today', 'just now'].includes(date.trim().toLowerCase())) return 'TODAY'
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime())
    ? date.toUpperCase()
    : new Intl.DateTimeFormat(lang === 'en' ? 'en-IN' : lang, { day: 'numeric', month: 'short', year: 'numeric' })
        .format(parsed)
        .toUpperCase()
}

function isBackendId(id: string | undefined) {
  return Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))
}

function DeleteModal({
  open,
  onClose,
  onConfirm,
  isDeleting,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}) {
  const { t } = useLanguage()
  if (!open) return null

  return (
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
            disabled={isDeleting}
            onClick={onClose}
            className="rounded-xl border border-ink/10 px-4 py-2.5 text-sm font-bold text-ink/70 hover:bg-slate-50 transition"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition disabled:opacity-50"
          >
            {isDeleting ? t.deleting || 'Deleting…' : t.delete || 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PendingDiagnosis({
  diagnosis,
  onDelete,
}: {
  diagnosis: BackendDiagnosis
  onDelete: () => void
}) {
  const { t } = useLanguage()
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const failed = diagnosis.status === 'failed'
  const unavailable = diagnosis.availability === 'unavailable'

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteDiagnosis(diagnosis.id)
      onDelete()
    } catch {
      setDeleting(false)
      setShowDelete(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <PageHeader
          eyebrow="Crop Guardian"
          title={failed ? t.diagnosisUnavailable : unavailable ? t.aiUnavailable : t.analysisPending}
        />
        <button
          onClick={() => setShowDelete(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
          title={t.deleteScan || 'Delete scan'}
        >
          <Trash2 size={15} />
          {t.delete || 'Delete'}
        </button>
      </div>

      <section className="rounded-[32px] bg-white p-6 sm:p-8 shadow-sm">
        <div className="grid min-h-56 place-items-center rounded-3xl bg-mint/40 text-center p-6">
          <div>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-forest shadow-md">
              <ShieldCheck size={32} />
            </span>
            <h2 className="mt-5 text-xl font-black text-ink">
              {failed ? t.analysisFailed : unavailable ? t.aiUnavailable : t.analysisPending}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/65">
              {failed ? t.analysisFailed : unavailable ? t.imageUploadedNoModel : t.pleaseWait}
            </p>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-ink/40">
              {t.status}: {diagnosis.status === 'failed' ? t.failed : diagnosis.status === 'completed' ? t.completed : t.pending}
            </p>
          </div>
        </div>
        <Link
          to="/scan"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-forest px-5 py-3 text-sm font-extrabold text-white shadow-md hover:bg-emerald-800 transition"
        >
          <ChevronLeft size={18} />
          {t.returnToScanner}
        </Link>
      </section>

      <DeleteModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => void handleDelete()}
        isDeleting={deleting}
      />
    </>
  )
}

function CompletedDiagnosis({
  diagnosis,
  onDelete,
}: {
  diagnosis: BackendDiagnosis
  onDelete: () => void
}) {
  const { t, lang } = useLanguage()
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const confidence = diagnosis.confidence === null ? null : Math.round(diagnosis.confidence * 100)
  const cropDisplay = diagnosis.predictedCrop ? translateCropName(diagnosis.predictedCrop, lang) : t.crop
  const isUnsupported = diagnosis.availability === 'unsupported_crop'
  const isUncertain = diagnosis.availability === 'uncertain'

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteDiagnosis(diagnosis.id)
      onDelete()
    } catch {
      setDeleting(false)
      setShowDelete(false)
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/scan"
          className="inline-flex items-center gap-1 text-sm font-extrabold text-forest hover:text-emerald-800 transition"
        >
          <ChevronLeft size={18} />
          {t.newScan}
        </Link>
        <button
          onClick={() => setShowDelete(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
        >
          <Trash2 size={15} />
          {t.deleteScan || 'Delete scan'}
        </button>
      </div>

      <PageHeader
        eyebrow={`${t.aiAssistedAssessment} · ${formattedAssessmentDate(diagnosis.createdAt, lang)}`}
        title={isUnsupported ? `${cropDisplay}` : `${cropDisplay}: ${diagnosis.predictedDisease ?? t.diagnosis}`}
      />

      {/* Unsupported Crop Notice */}
      {isUnsupported && (
        <div className="mb-6 rounded-[28px] border-2 border-amber-300 bg-amber-50 p-6 text-amber-950 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700">
              <AlertCircle size={26} />
            </span>
            <div>
              <h2 className="text-lg font-black text-amber-950">
                {t.unsupportedCropNotice || 'AI model does not currently support reliable diagnosis for this crop.'}
              </h2>
              <p className="mt-2 text-sm text-amber-900/85 leading-relaxed">
                {t.unsupportedCropAdvice || 'Our AI model currently recognizes leaf diseases for 14 crops (Tomato, Potato, Corn, Apple, Grape, Chilli, etc.). For unsupported crops, please consult your local Krishi Vigyan Kendra (KVK) or agricultural extension officer.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Uncertainty Notice */}
      {isUncertain && !isUnsupported && (
        <div className="mb-6 rounded-[28px] border-2 border-amber-200 bg-amber-50/80 p-5 text-amber-900 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertTriangle className="shrink-0 text-amber-600 mt-0.5" size={22} />
            <div>
              <h3 className="font-black text-amber-950 text-sm">{t.predictionUncertain || 'Prediction uncertain'}</h3>
              <p className="mt-1 text-xs text-amber-900/80 leading-relaxed">
                {t.predictionUncertainNotice || 'The model confidence is low. Please take a clear, close-up photo of the leaf in bright, natural light.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-[32px] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="rounded-3xl bg-mint/40 p-6">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-forest">
                <Sparkles size={15} /> {t.aiAssistedAssessment}
              </span>
              <Pill tone={isUnsupported ? 'amber' : diagnosis.severity === 'High' ? 'red' : diagnosis.severity === 'Moderate' ? 'amber' : 'green'}>
                {isUnsupported ? t.unavailable || 'Unsupported' : diagnosis.severity || t.completed}
              </Pill>
            </div>

            <h2 className="mt-4 text-2xl font-black text-ink">
              {isUnsupported ? `${cropDisplay}` : diagnosis.predictedDisease ?? t.diagnosis}
            </h2>
            {diagnosis.scientificName && (
              <p className="mt-1 text-sm italic font-medium text-ink/55">{diagnosis.scientificName}</p>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-emerald-950/10 pt-4">
              <div>
                <p className="text-xs font-bold text-ink/50">{t.modelConfidence}</p>
                <p className="text-2xl font-black text-forest">
                  {confidence === null ? t.notSpecified : `${confidence}%`}
                </p>
              </div>
              {diagnosis.severity && (
                <div className="text-right">
                  <p className="text-xs font-bold text-ink/50">{t.severity}</p>
                  <p className="text-lg font-black text-ink">{diagnosis.severity}</p>
                </div>
              )}
            </div>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-ink/50 border-t border-ink/5 pt-4">
            {t.modelOutputDisclaimer}
          </p>
        </section>

        <section className="space-y-5">
          <div className="rounded-[32px] bg-forest p-6 text-white shadow-md">
            <h2 className="text-base font-black tracking-wide">{t.modelInfo}</h2>
            <p className="mt-2 text-sm text-emerald-100 font-bold">{diagnosis.modelName ?? 'Plant disease classifier'}</p>
            <p className="mt-0.5 text-xs text-emerald-100/70">
              {t.version}: {diagnosis.modelVersion ?? 'v1.0'}
            </p>
          </div>

          {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
            <Card className="p-5">
              <h2 className="font-black text-base text-ink flex items-center gap-2">
                <CircleHelp size={18} className="text-forest" />
                {t.whatWeNoticed}
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-ink/75">
                {diagnosis.symptoms.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-coral font-black">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {diagnosis.actions && diagnosis.actions.length > 0 && (
            <Card className="bg-sand/70 p-5">
              <h2 className="font-black text-base text-ink flex items-center gap-2">
                <ShieldCheck size={18} className="text-forest" />
                {t.availableActions}
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-ink/75">
                {diagnosis.actions.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-forest font-black">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {diagnosis.prevention && diagnosis.prevention.length > 0 && (
            <Card className="p-5">
              <h2 className="font-black text-base text-ink flex items-center gap-2">
                <CheckCircle2 size={18} className="text-forest" />
                {t.prevention}
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-ink/75">
                {diagnosis.prevention.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-forest font-black">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Link
            to="/crops"
            className="flex items-center justify-between rounded-2xl bg-white p-5 font-black text-sm text-ink shadow-sm hover:shadow-md transition"
          >
            <span>{t.myCrops}</span>
            <ArrowRight className="text-forest" size={18} />
          </Link>
        </section>
      </div>

      <DeleteModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => void handleDelete()}
        isDeleting={deleting}
      />
    </>
  )
}

function DemoDiagnosis({ d }: { d: Diagnosis }) {
  const { t, lang } = useLanguage()
  const assessmentDate = formattedAssessmentDate(d.date, lang)
  const cropDisplay = translateCropName(d.crop, lang)

  return (
    <>
      <Link
        to="/scan"
        className="mb-4 inline-flex items-center gap-1 text-sm font-extrabold text-forest hover:text-emerald-800 transition"
      >
        <ChevronLeft size={18} />
        {t.newScan}
      </Link>

      <PageHeader eyebrow={`${t.aiAssistedAssessment} · ${assessmentDate}`} title={`${cropDisplay}: ${d.disease}`} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-[32px] bg-white shadow-sm">
            <div className="relative h-44 bg-gradient-to-br from-red-100 to-amber-50 p-5">
              {d.image ? (
                <img src={d.image} alt="Diagnosis" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="text-7xl">🌿</span>
              )}
              <Pill tone={d.severity === 'High' ? 'red' : 'amber'}>{d.severity}</Pill>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-ink">
                    {t.likely} {d.disease}
                  </h2>
                  <p className="text-sm italic font-medium text-ink/50">{d.scientific}</p>
                </div>
                <div className="text-right">
                  <b className="text-2xl font-black text-forest">{d.confidence}%</b>
                  <p className="text-xs font-bold text-ink/45">{t.match}</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ink/55 border-t border-ink/5 pt-3">
                {t.modelOutputDisclaimer}
              </p>
            </div>
          </section>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-black text-base text-ink">
              <CircleHelp size={18} className="text-forest" />
              {t.whatWeNoticed}
            </h2>
            <ul className="mt-4 space-y-3">
              {d.symptoms.map((symptom) => (
                <li key={symptom} className="flex gap-3 text-sm text-ink/75">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral" />
                  {symptom}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-5">
          <section className="rounded-[32px] bg-forest p-6 text-white shadow-md">
            <h2 className="flex items-center gap-2 text-base font-black">
              <ShieldCheck size={19} /> {t.actions}
            </h2>
            <ol className="mt-4 space-y-3">
              {d.actions.map((action, index) => (
                <li key={action} className="flex gap-3 text-sm text-emerald-50 leading-relaxed">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/20 text-xs font-black">
                    {index + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ol>
          </section>

          <Card className="bg-sand/70 p-5">
            <h2 className="flex items-center gap-2 font-black text-base text-ink">
              <CheckCircle2 size={18} className="text-forest" />
              {t.prevention}
            </h2>
            <p className="mt-3 text-sm text-ink/75 leading-relaxed">{d.prevention}</p>
          </Card>

          <Link
            to="/crops"
            className="flex items-center justify-between rounded-2xl bg-white p-5 font-black text-sm text-ink shadow-sm hover:shadow-md transition"
          >
            <span>{t.myCrops}</span>
            <ArrowRight className="text-forest" size={18} />
          </Link>

          <Link
            to="/hotspots"
            className="flex items-center gap-2 text-sm font-black text-forest hover:text-emerald-800 transition px-1"
          >
            <MapPinned size={18} />
            {t.checkOutbreakActivity}
          </Link>
        </div>
      </div>
    </>
  )
}

export function DiagnosisPage() {
  const { t } = useLanguage()
  const { id } = useParams()
  const nav = useNavigate()
  const [backendDiagnosis, setBackendDiagnosis] = useState<BackendDiagnosis | null>(null)
  const [backendError, setBackendError] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(isBackendId(id))

  useEffect(() => {
    if (!isBackendId(id)) {
      setLoading(false)
      return
    }
    let active = true
    let timer: number | undefined
    const load = async () => {
      try {
        const result = await getDiagnosis(id!)
        if (active) {
          setBackendDiagnosis(result)
          setBackendError(false)
          setNotFound(false)
          if (result.status === 'pending' && result.availability !== 'unavailable') {
            timer = window.setTimeout(() => void load(), 4000)
          }
        }
      } catch (error) {
        if (active) {
          setNotFound(error instanceof ApiError && error.status === 404)
          setBackendError(!(error instanceof ApiError && error.status === 404))
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [id])

  const handleDeleted = () => {
    nav('/diagnoses')
  }

  if (loading) return <p className="py-12 text-center text-sm font-bold text-ink/45">{t.pleaseWait}</p>

  if (isBackendId(id)) {
    if (backendDiagnosis?.status === 'completed') {
      return <CompletedDiagnosis diagnosis={backendDiagnosis} onDelete={handleDeleted} />
    }
    if (backendDiagnosis) {
      return <PendingDiagnosis diagnosis={backendDiagnosis} onDelete={handleDeleted} />
    }
    if (notFound) {
      return (
        <Card className="text-center py-12">
          <p className="font-black text-lg text-ink">{t.diagnosisNotFound}</p>
          <p className="mt-1 text-sm text-ink/55">{t.diagnosisNotFoundText}</p>
          <Link
            to="/diagnoses"
            className="mt-5 inline-flex rounded-2xl bg-forest px-5 py-3 text-sm font-extrabold text-white shadow-md"
          >
            {t.backToHistory}
          </Link>
        </Card>
      )
    }
    return (
      <PendingDiagnosis
        diagnosis={{
          id: id!,
          scanId: '',
          status: 'failed',
          availability: null,
          predictedCrop: null,
          predictedDisease: null,
          scientificName: null,
          severity: null,
          confidence: null,
          modelName: null,
          modelVersion: null,
          symptoms: [],
          actions: [],
          prevention: [],
          createdAt: '',
          updatedAt: '',
          errorMessage: backendError ? 'unavailable' : undefined,
        }}
        onDelete={handleDeleted}
      />
    )
  }

  const demo = storage.diagnoses().find((item) => item.id === id) || storage.diagnoses()[0]
  return <DemoDiagnosis d={demo} />
}
