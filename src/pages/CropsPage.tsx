import { CalendarDays, ChevronRight, Plus, ScanLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserCropDetail, getUserCrops } from '../api/client'
import { storage } from '../services/storageService'
import { translateCropName, useLanguage } from '../i18n'
import type { UserCrop, UserCropDetail } from '../types'
import { Card, PageHeader, Pill } from '../components/ui/UI'

function diagnosisStatus(detail: UserCropDetail | undefined, t: Record<string, string>) {
  const diagnosis = detail?.latestDiagnosis
  if (!diagnosis) return { label: t.noDiagnosis, tone: 'amber' as const }
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
  useEffect(() => { let active = true; getUserCrops().then(async (items) => { if (!active) return; setCrops(items); const loaded = await Promise.all(items.map(async (item) => { try { return await getUserCropDetail(item.id) } catch { return null } })); if (active) setDetails(Object.fromEntries(loaded.filter((item): item is UserCropDetail => Boolean(item)).map((item) => [item.crop.id, item]))) }).catch(() => { if (!active) return; setError(t.cropServiceUnavailable); setCrops(storage.crops().map((crop) => ({ id: crop.id, userId: '', cropId: null, name: crop.name, customName: null, variety: crop.variety, stage: crop.stage, plantedAt: null, area: null, areaUnit: null, notes: null, health: 0, nextTask: crop.nextTask, color: crop.color, createdAt: '', updatedAt: '' }))) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [t.cropServiceUnavailable])
  return <><PageHeader eyebrow={t.growingSpace} title={t.myCrops} action={<Link to="/onboarding/setup" className="rounded-xl bg-forest p-3 text-white" aria-label={t.addCrop}><Plus size={18}/></Link>}/>{error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{loading && <p className="py-8 text-center text-sm text-ink/50">{t.loadingCrops}</p>}{!loading && !crops.length && <Card className="text-center"><p className="font-extrabold">{t.noCrops}</p><p className="mt-1 text-sm text-ink/55">{t.completeOnboarding}</p></Card>}{!loading && crops.length > 0 && <div className="grid gap-4 md:grid-cols-2">{crops.map((crop) => { const detail = details[crop.id]; const status = diagnosisStatus(detail, t); return <Card key={crop.id} className="p-5"><div className="flex items-start justify-between"><div className={`grid h-13 w-13 place-items-center rounded-2xl ${crop.color} text-2xl`}>{String.fromCodePoint(127793)}</div><Pill tone={status.tone}>{status.label}</Pill></div><h2 className="mt-4 text-xl font-black">{crop.customName || translateCropName(crop.name, lang)}</h2><p className="text-sm text-ink/50">{crop.variety || t.cropMonitoring}</p><div className="mt-5 grid gap-2 text-sm text-ink/65">{crop.stage && <p><span className="font-bold">{t.stage}:</span> {crop.stage}</p>}{crop.plantedAt && <p className="flex items-center gap-2"><CalendarDays size={15}/><span>{t.planted} {crop.plantedAt}</span></p>}{detail?.latestDiagnosis?.status === 'completed' && detail.latestDiagnosis.predictedDisease && <p><span className="font-bold">{t.latestDiagnosis}:</span> {detail.latestDiagnosis.predictedDisease}</p>}{crop.nextTask && <p><span className="font-bold">{t.monitoringNote}:</span> {crop.nextTask}</p>}</div><div className="mt-5 flex items-center justify-between"><Link to={`/scan?userCropId=${encodeURIComponent(crop.id)}`} className="flex items-center gap-2 text-sm font-extrabold text-forest"><ScanLine size={16}/>{t.scan}</Link><Link to={`/crops/${crop.id}`} className="flex items-center gap-1 text-sm font-extrabold text-forest">{t.cropDetails} <ChevronRight size={16}/></Link></div></Card>})}</div>}</>
}
