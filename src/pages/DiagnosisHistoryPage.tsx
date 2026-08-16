import { CalendarClock, ChevronRight, ClipboardList } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, getDiagnoses, type BackendDiagnosis } from '../api/client'
import { Card, PageHeader, Pill } from '../components/ui/UI'

function dateLabel(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function statusFor(item: BackendDiagnosis) {
  if (item.status === 'completed') return { label: 'Completed', tone: 'green' as const }
  if (item.status === 'failed') return { label: 'Failed', tone: 'red' as const }
  if (item.availability === 'unavailable') return { label: 'AI unavailable', tone: 'amber' as const }
  return { label: 'Pending', tone: 'amber' as const }
}

export function DiagnosisHistoryPage() {
  const [diagnoses, setDiagnoses] = useState<BackendDiagnosis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getDiagnoses().then((items) => { if (active) setDiagnoses(items) }).catch((reason) => { if (active) setError(reason instanceof ApiError ? reason.message : 'Diagnosis history is unavailable.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return <>
    <PageHeader eyebrow="Your scan history" title="Diagnosis History" />
    {loading && <p className="py-10 text-center text-sm text-ink/55">Loading diagnosis history…</p>}
    {!loading && error && <Card className="border border-red-100 bg-red-50 text-sm text-red-800"><p className="font-extrabold">Could not load diagnosis history</p><p className="mt-1">{error}</p></Card>}
    {!loading && !error && diagnoses.length === 0 && <Card className="text-center"><ClipboardList className="mx-auto text-forest" size={30}/><p className="mt-3 font-extrabold">No uploaded diagnoses yet</p><p className="mt-1 text-sm text-ink/55">Your real uploaded scans will appear here. Demo scans remain available from the scanner.</p><Link to="/scan" className="mt-5 inline-flex rounded-xl bg-forest px-4 py-3 text-sm font-extrabold text-white">Start a scan</Link></Card>}
    {!loading && !error && diagnoses.length > 0 && <div className="space-y-3">{diagnoses.map((item) => { const status = statusFor(item); return <Link key={item.id} to={`/diagnosis/${item.id}`} className="block"><Card className="transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-ink/40">{item.predictedCrop ?? 'Uploaded scan'}</p><h2 className="mt-1 text-lg font-black">{item.predictedDisease ?? status.label}</h2><p className="mt-2 flex items-center gap-1 text-xs text-ink/50"><CalendarClock size={14}/>{dateLabel(item.createdAt)}</p></div><div className="flex items-center gap-2"><Pill tone={status.tone}>{status.label}</Pill><ChevronRight className="text-forest" size={18}/></div></div>{item.confidence !== null && item.status === 'completed' && <p className="mt-4 text-sm font-bold text-forest">Model confidence: {Math.round(item.confidence * 100)}%</p>}</Card></Link>})}</div>}
  </>
}
