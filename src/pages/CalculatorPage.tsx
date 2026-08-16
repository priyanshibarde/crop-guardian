import { Calculator } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card, PageHeader } from '../components/ui/UI'
import { useLanguage } from '../i18n'

export function CalculatorPage() {
  const { t } = useLanguage()
  const [crop, setCrop] = useState('')
  const [area, setArea] = useState('')
  const [areaUnit, setAreaUnit] = useState<'m²' | 'hectare'>('m²')
  const [fertilizer, setFertilizer] = useState('')
  const [rate, setRate] = useState('')
  const [rateUnit, setRateUnit] = useState<'g per 100 m²' | 'kg per hectare'>('g per 100 m²')
  const result = useMemo(() => {
    const areaValue = Number(area)
    const rateValue = Number(rate)
    if (!Number.isFinite(areaValue) || areaValue <= 0 || !Number.isFinite(rateValue) || rateValue <= 0) return null
    if (rateUnit === 'g per 100 m²') return { quantity: (areaValue * (areaUnit === 'hectare' ? 100 : 1) * rateValue / 100).toFixed(2), unit: 'g' }
    return { quantity: (areaValue * (areaUnit === 'm²' ? 0.0001 : 1) * rateValue).toFixed(2), unit: 'kg' }
  }, [area, areaUnit, rate, rateUnit])
  return <><PageHeader eyebrow="Simple field tools" title={t.fertilizerCalculator}/><div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><Card className="bg-forest text-white"><Calculator size={28}/><h2 className="mt-4 text-xl font-black">Use the product label</h2><p className="mt-2 text-sm leading-6 text-emerald-50">Enter the crop, area, fertilizer, and rate exactly as shown on your product label.</p><p className="mt-6 rounded-xl bg-white/10 p-3 text-xs text-emerald-100">This tool performs arithmetic only. It does not provide crop-specific rates or fertilizer advice.</p></Card><Card><label className="block text-sm font-bold">{t.crop}<input value={crop} onChange={(event) => setCrop(event.target.value)} placeholder="e.g. Tomato" className="mt-2 w-full rounded-xl border border-ink/10 p-3 outline-forest"/></label><label className="mt-4 block text-sm font-bold">Fertilizer type<input value={fertilizer} onChange={(event) => setFertilizer(event.target.value)} placeholder="Name on product label" className="mt-2 w-full rounded-xl border border-ink/10 p-3 outline-forest"/></label><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="block text-sm font-bold">{t.area}<input type="number" min="0" value={area} onChange={(event) => setArea(event.target.value)} className="mt-2 w-full rounded-xl border border-ink/10 p-3 outline-forest"/></label><label className="block text-sm font-bold">Area unit<select value={areaUnit} onChange={(event) => setAreaUnit(event.target.value as typeof areaUnit)} className="mt-2 w-full rounded-xl border border-ink/10 p-3 outline-forest"><option>m²</option><option>hectare</option></select></label></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="block text-sm font-bold">Label rate<input type="number" min="0" value={rate} onChange={(event) => setRate(event.target.value)} className="mt-2 w-full rounded-xl border border-ink/10 p-3 outline-forest"/></label><label className="block text-sm font-bold">Rate unit<select value={rateUnit} onChange={(event) => setRateUnit(event.target.value as typeof rateUnit)} className="mt-2 w-full rounded-xl border border-ink/10 p-3 outline-forest"><option>g per 100 m²</option><option>kg per hectare</option></select></label></div>{result ? <div className="mt-6 rounded-2xl bg-mint p-5"><p className="text-sm font-bold text-forest">{t.result}</p><p className="mt-1 text-4xl font-black text-forest">{result.quantity} {result.unit}</p><p className="mt-1 text-sm text-forest/70">{crop || 'Crop not specified'} · {fertilizer || 'Fertilizer not specified'} · {area} {areaUnit} at {rate} {rateUnit}</p></div> : <p className="mt-6 rounded-2xl bg-sand p-4 text-sm text-ink/60">Enter a positive area and the rate from your product label to calculate a quantity.</p>}</Card></div></>
}
