import { Activity, CalendarDays, ChevronLeft, ScanLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, getUserCropDetail } from '../api/client'
import { getCropGuidance } from '../data/cropGuidance'
import { getRecommendations } from '../services/recommendationService'
import type { UserCropDetail } from '../types'
import { Card, PageHeader, Pill } from '../components/ui/UI'
import { translateCropName, useLanguage } from '../i18n'

function statusFor(detail: UserCropDetail) {
  if (!detail.latestDiagnosis) return { label: 'No diagnosis yet', tone: 'amber' as const }
  if (detail.latestDiagnosis.availability === 'unavailable') return { label: 'AI diagnosis unavailable', tone: 'amber' as const }
  if (detail.latestDiagnosis.status === 'pending') return { label: 'Analysis pending', tone: 'amber' as const }
  if (detail.latestDiagnosis.status === 'failed') return { label: 'Analysis failed', tone: 'red' as const }
  return { label: 'Diagnosis completed', tone: 'green' as const }
}

export function CropDetailPage() {
  const { lang } = useLanguage()
  const { id } = useParams()
  const [detail, setDetail] = useState<UserCropDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { let active = true; if (!id) return; getUserCropDetail(id).then((value) => { if (active) setDetail(value) }).catch((reason) => { if (active) setError(reason instanceof ApiError && reason.status === 404 ? 'This crop was not found.' : 'Crop details are unavailable.') }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [id])
  if (loading) return <p className="py-12 text-center text-sm text-ink/55">Loading crop details...</p>
  if (error || !detail) return <Card className="text-center"><p className="font-extrabold">{error || 'Crop details are unavailable.'}</p><Link to="/crops" className="mt-5 inline-flex rounded-xl bg-forest px-4 py-3 text-sm font-extrabold text-white">Back to crops</Link></Card>
  const crop = detail.crop
  const guidance = getCropGuidance(crop.name)
  const status = statusFor(detail)
  const recommendations = getRecommendations({ cropName: crop.name, cropStage: crop.stage, diagnosis: detail.latestDiagnosis })
  return <>
    <Link to="/crops" className="mb-5 inline-flex items-center gap-1 text-sm font-bold text-forest"><ChevronLeft size={17}/>All crops</Link>
    <PageHeader eyebrow="Crop monitoring" title={crop.customName || translateCropName(crop.name, lang)} action={<Link to={`/scan?userCropId=${encodeURIComponent(crop.id)}`} className="flex items-center gap-2 rounded-xl bg-forest px-3 py-2 text-sm font-extrabold text-white"><ScanLine size={16}/>New scan</Link>}/>
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <div className="space-y-5"><Card><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-ink/55">{detail.catalog?.scientificName || crop.variety || 'Crop information'}</p><h2 className="mt-2 text-2xl font-black">{crop.customName || translateCropName(crop.name, lang)}</h2></div><Pill tone={status.tone}>{status.label}</Pill></div><div className="mt-5 grid gap-3 text-sm text-ink/65 sm:grid-cols-2">{crop.stage && <p><span className="font-bold">Growth stage:</span> {crop.stage}</p>}{crop.plantedAt && <p className="flex items-center gap-2"><CalendarDays size={15}/><span>Planted {crop.plantedAt}</span></p>}{crop.area && <p><span className="font-bold">Area:</span> {crop.area} {crop.areaUnit || 'units'}</p>}{crop.notes && <p className="sm:col-span-2"><span className="font-bold">Notes:</span> {crop.notes}</p>}</div></Card><Card><h2 className="flex items-center gap-2 font-extrabold"><Activity size={18} className="text-forest"/>Diagnosis history</h2>{detail.diagnoses.length === 0 && <p className="mt-4 text-sm text-ink/55">No diagnosis yet. Upload a scan to begin a real crop history.</p>}{detail.diagnoses.length > 0 && <div className="mt-4 space-y-3">{detail.diagnoses.map((diagnosis) => <Link key={diagnosis.id} to={`/diagnosis/${diagnosis.id}`} className="flex items-center justify-between rounded-2xl bg-sand p-3 text-sm"><span>{diagnosis.status === 'completed' ? diagnosis.predictedDisease : diagnosis.availability === 'unavailable' ? 'AI diagnosis unavailable' : diagnosis.status === 'failed' ? 'Analysis failed' : 'Analysis pending'}<span className="ml-2 text-xs text-ink/45">{new Date(diagnosis.createdAt).toLocaleDateString('en-IN')}</span></span><Pill tone={diagnosis.status === 'failed' ? 'red' : diagnosis.status === 'completed' ? 'green' : 'amber'}>{diagnosis.status}</Pill></Link>)}</div>}</Card></div>
      <div className="space-y-5">{guidance && <Card className="bg-mint/50"><h2 className="font-extrabold">General care for {guidance.cropName}</h2><div className="mt-4 space-y-4 text-sm text-ink/70"><div><p className="font-bold text-forest">Care</p><ul className="mt-1 list-disc space-y-1 pl-5">{guidance.generalCare.map((item) => <li key={item}>{item}</li>)}</ul></div><div><p className="font-bold text-forest">Watering</p><ul className="mt-1 list-disc space-y-1 pl-5">{guidance.watering.map((item) => <li key={item}>{item}</li>)}</ul></div>{crop.stage && guidance.growthStages[crop.stage] && <p><span className="font-bold text-forest">Stage note:</span> {guidance.growthStages[crop.stage]}</p>}</div></Card>}{recommendations.status === 'available' && <Card className="bg-sand"><h2 className="font-extrabold">Safe next checks</h2><ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink/70">{recommendations.recommendations.map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-3 text-xs text-ink/50">{recommendations.disclaimer}</p></Card>}<Card><h2 className="font-extrabold">Crop timeline</h2>{detail.timeline.length === 0 && <p className="mt-3 text-sm text-ink/55">No stored crop events yet.</p>}<div className="mt-4 space-y-4">{detail.timeline.map((event) => <div key={event.id} className="flex gap-3"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-forest"/><div><p className="text-sm font-bold">{event.label}</p><p className="text-xs text-ink/45">{new Date(event.occurredAt).toLocaleString('en-IN')}</p></div></div>)}</div></Card></div>
    </div>
  </>
}
