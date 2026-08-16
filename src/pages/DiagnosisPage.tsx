import { ArrowRight, CheckCircle2, ChevronLeft, CircleHelp, MapPinned, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDiagnosis, type BackendDiagnosis } from '../api/client'
import { storage } from '../services/storageService'
import type { Diagnosis } from '../types'
import { PageHeader, Pill } from '../components/ui/UI'
import { useLanguage } from '../i18n'

function formattedAssessmentDate(date: string) {
  if (['today', 'just now'].includes(date.trim().toLowerCase())) return 'TODAY'
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? date.toUpperCase() : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed).toUpperCase()
}

function isBackendId(id: string | undefined) { return Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) }

function PendingDiagnosis({ diagnosis }: { diagnosis: BackendDiagnosis }) {
  const failed = diagnosis.status === 'failed'
  return <>
    <PageHeader eyebrow="Uploaded scan" title={failed ? 'Diagnosis unavailable' : 'Scan received'} />
    <section className="rounded-[28px] bg-white p-6 sm:p-8">
      <div className="grid min-h-52 place-items-center rounded-3xl bg-mint/50 text-center">
        <div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-forest shadow-sm"><ShieldCheck size={30}/></span><h2 className="mt-4 text-xl font-black">{failed ? 'The diagnosis could not be completed.' : 'AI diagnosis is unavailable'}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink/60">{failed ? 'Your uploaded image is safe, but a diagnosis was not produced.' : 'Your image was uploaded successfully, but a live AI model is not connected yet. No disease prediction has been generated.'}</p><p className="mt-4 text-xs font-bold uppercase tracking-widest text-ink/40">Status: {diagnosis.status}</p></div>
      </div>
      <Link to="/scan" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-extrabold text-white"><ChevronLeft size={17}/>Return to scanner</Link>
    </section>
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
  const [loading, setLoading] = useState(isBackendId(id))

  useEffect(() => {
    if (!isBackendId(id)) { setLoading(false); return }
    let active = true
    const load = async () => { try { const result = await getDiagnosis(id!); if (active) { setBackendDiagnosis(result); setBackendError(false) } } catch { if (active) setBackendError(true) } finally { if (active) setLoading(false) } }
    void load()
    const timer = window.setInterval(() => { if (backendDiagnosis?.status === 'pending') void load() }, 5000)
    return () => { active = false; window.clearInterval(timer) }
  }, [id, backendDiagnosis?.status])

  if (loading) return <p className="py-12 text-center text-sm text-ink/55">Loading scan status…</p>
  if (isBackendId(id)) {
    if (backendDiagnosis) return <PendingDiagnosis diagnosis={backendDiagnosis}/>
    return <PendingDiagnosis diagnosis={{ id: id!, scanId: '', status: 'failed', predictedCrop: null, predictedDisease: null, scientificName: null, severity: null, confidence: null, modelName: null, modelVersion: null, symptoms: [], actions: [], prevention: [], createdAt: '', updatedAt: '', errorMessage: backendError ? 'unavailable' : undefined }}/>
  }
  const demo = storage.diagnoses().find((item) => item.id === id) || storage.diagnoses()[0]
  return <DemoDiagnosis d={demo}/>
}
