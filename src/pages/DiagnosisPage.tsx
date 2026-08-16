import { ArrowRight, CheckCircle2, ChevronLeft, CircleHelp, MapPinned, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { storage } from '../services/storageService'
import { PageHeader, Pill } from '../components/ui/UI'
import { useLanguage } from '../i18n'

function formattedAssessmentDate(date: string) {
  if (['today', 'just now'].includes(date.trim().toLowerCase())) return 'TODAY'
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime())
    ? date.toUpperCase()
    : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed).toUpperCase()
}

export function DiagnosisPage() {
  const { id } = useParams()
  const { t } = useLanguage()
  const d = storage.diagnoses().find((item) => item.id === id) || storage.diagnoses()[0]
  const assessmentDate = formattedAssessmentDate(d.date)

  return <>
    <Link to="/scan" className="mb-5 inline-flex items-center gap-1 text-sm font-bold text-forest"><ChevronLeft size={17}/>New scan</Link>
    <PageHeader eyebrow={`AI assessment · ${assessmentDate}`} title={`${d.crop}: ${d.disease}`}/>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <div className="space-y-5">
        <section className="overflow-hidden rounded-[28px] bg-white">
          <div className="relative h-44 bg-gradient-to-br from-red-100 to-amber-50 p-5">
            {d.image ? <img src={d.image} className="absolute inset-0 h-full w-full object-cover"/> : <span className="text-7xl">🍅</span>}
            <Pill tone={d.severity === 'High' ? 'red' : 'amber'}>{d.severity} risk</Pill>
          </div>
          <div className="p-5"><div className="flex justify-between"><div><h2 className="text-xl font-black">Likely {d.disease}</h2><p className="text-sm italic text-ink/50">{d.scientific}</p></div><div className="text-right"><b className="text-2xl text-forest">{d.confidence}%</b><p className="text-xs text-ink/45">match</p></div></div><p className="mt-4 text-sm text-ink/65">This is an AI-assisted preliminary assessment. Confirm serious outbreaks with a local agricultural expert.</p></div>
        </section>
        <section className="rounded-[28px] bg-white p-5"><h2 className="flex items-center gap-2 font-extrabold"><CircleHelp size={19} className="text-forest"/>What we noticed</h2><ul className="mt-4 space-y-3">{d.symptoms.map((symptom) => <li key={symptom} className="flex gap-3 text-sm text-ink/70"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral"/>{symptom}</li>)}</ul></section>
      </div>
      <div className="space-y-5">
        <section className="rounded-[28px] bg-forest p-6 text-white"><h2 className="flex items-center gap-2 text-lg font-black"><ShieldCheck/> {t.actions}</h2><ol className="mt-5 space-y-4">{d.actions.map((action, index) => <li key={action} className="flex gap-3 text-sm text-emerald-50"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-black">{index + 1}</span>{action}</li>)}</ol></section>
        <section className="rounded-[28px] bg-sand p-5"><h2 className="flex gap-2 font-extrabold"><CheckCircle2 className="text-forest"/>Prevention</h2><p className="mt-3 text-sm text-ink/65">{d.prevention}</p></section>
        <Link to="/crops" className="flex items-center justify-between rounded-2xl bg-white p-5 font-extrabold shadow-sm"><span><span className="block text-xs uppercase tracking-widest text-ink/45">Next</span>{t.tracking}</span><ArrowRight className="text-forest"/></Link>
        <Link to="/hotspots" className="flex items-center gap-2 text-sm font-bold text-forest"><MapPinned size={18}/>Check regional outbreak activity</Link>
      </div>
    </div>
  </>
}
