import { ArrowRight, CheckCircle2, ChevronLeft, CircleHelp, MapPinned, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, getDiagnosis, type BackendDiagnosis } from '../api/client'
import { storage } from '../services/storageService'
import type { Diagnosis } from '../types'
import { Card, PageHeader, Pill } from '../components/ui/UI'
import { translateCropName, useLanguage } from '../i18n'

function formattedAssessmentDate(date: string) {
  if (['today', 'just now'].includes(date.trim().toLowerCase())) return 'TODAY'
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? date.toUpperCase() : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed).toUpperCase()
}

function isBackendId(id: string | undefined) { return Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) }

function PendingDiagnosis({ diagnosis }: { diagnosis: BackendDiagnosis }) {
  const failed = diagnosis.status === 'failed'
  const unavailable = diagnosis.availability === 'unavailable'
  return <>
    <PageHeader eyebrow="Uploaded scan" title={failed ? 'Diagnosis unavailable' : unavailable ? 'AI diagnosis unavailable' : 'Scan received'} />
    <section className="rounded-[28px] bg-white p-6 sm:p-8">
      <div className="grid min-h-52 place-items-center rounded-3xl bg-mint/50 text-center">
        <div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-forest shadow-sm"><ShieldCheck size={30}/></span><h2 className="mt-4 text-xl font-black">{failed ? 'The diagnosis could not be completed.' : unavailable ? 'AI diagnosis is currently unavailable.' : 'Your image is waiting for AI analysis.'}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink/60">{failed ? 'We could not analyze this image.' : unavailable ? 'Your image was uploaded successfully, but the prediction model is not configured yet. No disease prediction has been generated.' : 'Your image is uploaded and waiting for AI analysis.'}</p><p className="mt-4 text-xs font-bold uppercase tracking-widest text-ink/40">Status: {diagnosis.status}</p></div>
      </div>
      <Link to="/scan" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-extrabold text-white"><ChevronLeft size={17}/>Return to scanner</Link>
    </section>
  </>
}

function CompletedDiagnosis({ diagnosis }: { diagnosis: BackendDiagnosis }) {
  const { lang } = useLanguage()
  const confidence = diagnosis.confidence === null ? null : Math.round(diagnosis.confidence * 100)
  const cropDisplay = diagnosis.predictedCrop ? translateCropName(diagnosis.predictedCrop, lang) : 'Crop'
  return <>
    <Link to="/scan" className="mb-5 inline-flex items-center gap-1 text-sm font-bold text-forest"><ChevronLeft size={17}/>New scan</Link>
    <PageHeader eyebrow={`Model assessment · ${formattedAssessmentDate(diagnosis.createdAt)}`} title={`${cropDisplay}: ${diagnosis.predictedDisease ?? 'Prediction'}`}/>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-[28px] bg-white p-6"><div className="rounded-3xl bg-mint/50 p-6"><p className="text-sm font-bold text-forest">Uploaded image diagnosis</p><h2 className="mt-3 text-2xl font-black">{diagnosis.predictedDisease}</h2>{diagnosis.scientificName && <p className="mt-1 text-sm italic text-ink/50">{diagnosis.scientificName}</p>}<p className="mt-5 text-sm text-ink/65">Model confidence: {confidence === null ? 'Not available' : `${confidence}%`}</p>{diagnosis.severity && <p className="mt-2 text-sm text-ink/65">Severity: <span className="font-bold">{diagnosis.severity}</span></p>}<p className="mt-5 text-xs text-ink/45">This is a model output from a pretrained plant-disease classifier. Real-world performance may vary.</p></div></section>
      <section className="space-y-5">
        <div className="rounded-[28px] bg-forest p-6 text-white"><h2 className="text-lg font-black">Model information</h2><p className="mt-3 text-sm text-emerald-50">{diagnosis.modelName ?? 'Plant disease model'}</p><p className="mt-1 text-sm text-emerald-50/75">Version: {diagnosis.modelVersion ?? 'Not specified'}</p></div>
        {diagnosis.symptoms.length > 0 && <section className="rounded-[28px] bg-white p-5"><h2 className="font-extrabold">What we noticed</h2><ul className="mt-4 space-y-2 text-sm text-ink/70">{diagnosis.symptoms.map((item) => <li key={item}>• {item}</li>)}</ul></section>}
        {diagnosis.actions.length > 0 && <section className="rounded-[28px] bg-sand p-5"><h2 className="font-extrabold">Available actions</h2><ul className="mt-3 space-y-2 text-sm text-ink/70">{diagnosis.actions.map((item) => <li key={item}>• {item}</li>)}</ul></section>}
        {diagnosis.prevention.length > 0 && <section className="rounded-[28px] bg-white p-5"><h2 className="font-extrabold">Prevention</h2><ul className="mt-3 space-y-2 text-sm text-ink/70">{diagnosis.prevention.map((item) => <li key={item}>• {item}</li>)}</ul></section>}
      </section>
    </div>
  </>
}

function DemoDiagnosis({ d }: { d: Diagnosis }) {
  const { t } = useLanguage()
  const assessmentDate = formattedAssessmentDate(d.date)
  return <>
    <Link to="/scan" className="mb-5 inline-flex items-center gap-1 text-sm font-bold text-forest"><ChevronLeft size={17}/>New scan</Link>
    <PageHeader eyebrow={`AI assessment · ${assessmentDate}`} title={`${d.crop}: ${d.disease}`}/>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <div className="space-y-5">
        <section className="overflow-hidden rounded-[28px] bg-white"><div className="relative h-44 bg-gradient-to-br from-red-100 to-amber-50 p-5">{d.image ? <img src={d.image} className="absolute inset-0 h-full w-full object-cover"/> : <span className="text-7xl">🍅</span>}<Pill tone={d.severity === 'High' ? 'red' : 'amber'}>{d.severity} risk</Pill></div><div className="p-5"><div className="flex justify-between"><div><h2 className="text-xl font-black">Likely {d.disease}</h2><p className="text-sm italic text-ink/50">{d.scientific}</p></div><div className="text-right"><b className="text-2xl text-forest">{d.confidence}%</b><p className="text-xs text-ink/45">match</p></div></div><p className="mt-4 text-sm text-ink/65">This is an AI-assisted preliminary assessment. Confirm serious outbreaks with a local agricultural expert.</p></div></section>
        <section className="rounded-[28px] bg-white p-5"><h2 className="flex items-center gap-2 font-extrabold"><CircleHelp size={19} className="text-forest"/>What we noticed</h2><ul className="mt-4 space-y-3">{d.symptoms.map((symptom) => <li key={symptom} className="flex gap-3 text-sm text-ink/70"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral"/>{symptom}</li>)}</ul></section>
      </div>
      <div className="space-y-5"><section className="rounded-[28px] bg-forest p-6 text-white"><h2 className="flex items-center gap-2 text-lg font-black"><ShieldCheck/> {t.actions}</h2><ol className="mt-5 space-y-4">{d.actions.map((action, index) => <li key={action} className="flex gap-3 text-sm text-emerald-50"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-black">{index + 1}</span>{action}</li>)}</ol></section><section className="rounded-[28px] bg-sand p-5"><h2 className="flex gap-2 font-extrabold"><CheckCircle2 className="text-forest"/>Prevention</h2><p className="mt-3 text-sm text-ink/65">{d.prevention}</p></section><Link to="/crops" className="flex items-center justify-between rounded-2xl bg-white p-5 font-extrabold shadow-sm"><span><span className="block text-xs uppercase tracking-widest text-ink/45">Next</span>{t.tracking}</span><ArrowRight className="text-forest"/></Link><Link to="/hotspots" className="flex items-center gap-2 text-sm font-bold text-forest"><MapPinned size={18}/>Check regional outbreak activity</Link></div>
    </div>
  </>
}

export function DiagnosisPage() {
  const { id } = useParams()
  const [backendDiagnosis, setBackendDiagnosis] = useState<BackendDiagnosis | null>(null)
  const [backendError, setBackendError] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(isBackendId(id))

  useEffect(() => {
    if (!isBackendId(id)) { setLoading(false); return }
    let active = true
    let timer: number | undefined
    const load = async () => {
      try {
        const result = await getDiagnosis(id!)
        if (active) {
          setBackendDiagnosis(result)
          setBackendError(false)
          setNotFound(false)
          if (result.status === 'pending' && result.availability !== 'unavailable') timer = window.setTimeout(() => void load(), 5000)
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
    return () => { active = false; if (timer !== undefined) window.clearTimeout(timer) }
  }, [id])

  if (loading) return <p className="py-12 text-center text-sm text-ink/55">Loading scan status…</p>
  if (isBackendId(id)) {
    if (backendDiagnosis?.status === 'completed') return <CompletedDiagnosis diagnosis={backendDiagnosis}/>
    if (backendDiagnosis) return <PendingDiagnosis diagnosis={backendDiagnosis}/>
    if (notFound) return <Card className="text-center"><p className="font-extrabold">Diagnosis not found</p><p className="mt-1 text-sm text-ink/55">This diagnosis does not exist or is not available for your account.</p><Link to="/diagnoses" className="mt-5 inline-flex rounded-xl bg-forest px-4 py-3 text-sm font-extrabold text-white">Back to history</Link></Card>
    return <PendingDiagnosis diagnosis={{ id: id!, scanId: '', status: 'failed', availability: null, predictedCrop: null, predictedDisease: null, scientificName: null, severity: null, confidence: null, modelName: null, modelVersion: null, symptoms: [], actions: [], prevention: [], createdAt: '', updatedAt: '', errorMessage: backendError ? 'unavailable' : undefined }}/>
  }
  const demo = storage.diagnoses().find((item) => item.id === id) || storage.diagnoses()[0]
  return <DemoDiagnosis d={demo}/>
}
