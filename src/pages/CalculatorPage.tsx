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
    if (rateUnit === 'g per 100 m²') {
      return {
        quantity: ((areaValue * (areaUnit === 'hectare' ? 100 : 1) * rateValue) / 100).toFixed(2),
        unit: 'g',
      }
    }
    return {
      quantity: (areaValue * (areaUnit === 'm²' ? 0.0001 : 1) * rateValue).toFixed(2),
      unit: 'kg',
    }
  }, [area, areaUnit, rate, rateUnit])

  return (
    <>
      <PageHeader eyebrow={t.simpleFieldTools} title={t.fertilizerCalculator} />

      <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <Card className="bg-forest text-white p-7 shadow-lg flex flex-col justify-between">
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-white shadow-xs">
              <Calculator size={26} />
            </span>
            <h2 className="mt-5 text-2xl font-black">{t.useProductLabel}</h2>
            <p className="mt-3 text-sm leading-relaxed text-emerald-100">{t.calculatorInstruction}</p>
          </div>

          <p className="mt-8 rounded-2xl bg-white/10 p-4 text-xs leading-relaxed text-emerald-100 border border-white/10">
            {t.arithmeticOnlyDisclaimer}
          </p>
        </Card>

        <Card className="p-6 sm:p-7 space-y-5">
          <div>
            <label className="block text-sm font-black text-ink">{t.crop}</label>
            <input
              value={crop}
              onChange={(event) => setCrop(event.target.value)}
              placeholder="e.g. Maize"
              className="mt-2 w-full rounded-2xl bg-sand/60 px-4 py-3.5 text-sm font-bold text-ink outline-forest border border-ink/5"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-ink">{t.fertilizerType}</label>
            <input
              value={fertilizer}
              onChange={(event) => setFertilizer(event.target.value)}
              placeholder={t.productLabelPlaceholder}
              className="mt-2 w-full rounded-2xl bg-sand/60 px-4 py-3.5 text-sm font-bold text-ink outline-forest border border-ink/5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-black text-ink">{t.area}</label>
              <input
                type="number"
                min="0"
                step="any"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                placeholder="0"
                className="mt-2 w-full rounded-2xl bg-sand/60 px-4 py-3.5 text-sm font-bold text-ink outline-forest border border-ink/5"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-ink">{t.areaUnit}</label>
              <select
                value={areaUnit}
                onChange={(event) => setAreaUnit(event.target.value as typeof areaUnit)}
                className="mt-2 w-full rounded-2xl bg-sand/60 px-4 py-3.5 text-sm font-bold text-ink outline-forest border border-ink/5"
              >
                <option value="m²">{t.sqMeters}</option>
                <option value="hectare">{t.hectare}</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-black text-ink">{t.labelRate}</label>
              <input
                type="number"
                min="0"
                step="any"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
                placeholder="0"
                className="mt-2 w-full rounded-2xl bg-sand/60 px-4 py-3.5 text-sm font-bold text-ink outline-forest border border-ink/5"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-ink">{t.rateUnit}</label>
              <select
                value={rateUnit}
                onChange={(event) => setRateUnit(event.target.value as typeof rateUnit)}
                className="mt-2 w-full rounded-2xl bg-sand/60 px-4 py-3.5 text-sm font-bold text-ink outline-forest border border-ink/5"
              >
                <option value="g per 100 m²">{t.gPer100sqm}</option>
                <option value="kg per hectare">{t.kgPerHectare}</option>
              </select>
            </div>
          </div>

          {result ? (
            <div className="mt-6 rounded-2xl bg-mint p-5 border border-emerald-200/60 animate-fadeIn">
              <p className="text-xs font-black uppercase tracking-wider text-forest">{t.result}</p>
              <p className="mt-1 text-3xl sm:text-4xl font-black text-forest">
                {result.quantity} {result.unit}
              </p>
              <p className="mt-2 text-xs font-bold text-forest/80">
                {crop || t.cropNotSpecified} · {fertilizer || t.fertilizerNotSpecified} · {area} {areaUnit} @ {rate}{' '}
                {rateUnit}
              </p>
            </div>
          ) : (
            <p className="mt-6 rounded-2xl bg-sand/70 p-4 text-xs font-bold text-ink/60 text-center">
              {t.enterPositiveArea}
            </p>
          )}
        </Card>
      </div>
    </>
  )
}
