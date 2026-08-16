import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import type { ComponentType } from 'react'
import { MapPinned, TrendingUp } from 'lucide-react'
import { hotspots } from '../data/mockData'
import { Card, PageHeader, Pill } from '../components/ui/UI'
import { storage } from '../services/storageService'
import { useLanguage } from '../i18n'

const MapAny = MapContainer as unknown as ComponentType<any>
const TileAny = TileLayer as unknown as ComponentType<any>
const CircleAny = CircleMarker as unknown as ComponentType<any>
const PopupAny = Popup as unknown as ComponentType<any>

const color = (s: string) => (s === 'High' ? '#ed725c' : s === 'Moderate' ? '#f1be45' : '#176b4d')

export function HotspotsPage() {
  const { t } = useLanguage()
  const profile = storage.profile()

  return (
    <>
      <PageHeader eyebrow={t.communityPoweredMonitoring} title={t.diseaseIntelligence} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="overflow-hidden rounded-[32px] border-4 border-white shadow-md">
          <MapAny center={[21.2, 78.4]} zoom={4} scrollWheelZoom={false} className="h-[390px] w-full">
            <TileAny
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {hotspots.map((h) => (
              <CircleAny
                key={h.id}
                center={h.position}
                radius={h.severity === 'High' ? 18 : 13}
                pathOptions={{ color: color(h.severity), fillColor: color(h.severity), fillOpacity: 0.55 }}
              >
                <PopupAny>
                  <b>
                    {h.district}, {h.state}
                  </b>
                  <br />
                  {h.disease}
                  <br />
                  {h.reports} {t.reports}
                </PopupAny>
              </CircleAny>
            ))}
          </MapAny>
        </div>

        <div className="rounded-[32px] bg-forest p-7 text-white shadow-md flex flex-col justify-between">
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-white">
              <MapPinned size={24} />
            </span>
            <h2 className="mt-5 text-2xl font-black">{t.catchOutbreaks}</h2>
            <p className="mt-3 text-sm leading-relaxed text-emerald-50">
              {t.hotspotsExplanation} {profile?.location ? `${t.growingIn} ${profile.location}.` : ''}
            </p>
          </div>

          <div className="mt-6 border-t border-white/15 pt-5">
            <p className="text-sm font-black text-white">{t.howEarlyWarningWorks}</p>
            <p className="mt-1.5 text-xs text-emerald-100/80 leading-relaxed">{t.earlyWarningDetail}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-black text-ink">{t.activeReports}</h2>
        <div className="grid gap-3.5 md:grid-cols-2">
          {hotspots.map((h) => (
            <Card key={h.id} className="flex items-center justify-between p-5">
              <div>
                <div className="flex items-center gap-2">
                  <Pill tone={h.severity === 'High' ? 'red' : h.severity === 'Moderate' ? 'amber' : 'green'}>
                    {h.severity === 'High' ? t.high : h.severity === 'Moderate' ? t.moderate : t.low}
                  </Pill>
                  <span className="text-xs font-bold text-ink/45">{h.state}</span>
                </div>
                <h3 className="mt-2 font-black text-ink text-base">{h.disease}</h3>
                <p className="text-sm text-ink/55">
                  {h.district} · {h.reports} {t.reports}
                </p>
              </div>
              <div className="text-right text-sm font-black text-forest">
                <TrendingUp className="ml-auto mb-1" size={18} />
                {h.trend > 0 ? '+' : ''}
                {h.trend}%
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
