import { CheckCircle2, ImagePlus, ScanLine, Sparkles, Upload, XCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, createScan } from '../api/client'
import { sampleScans } from '../data/mockData'
import { useLanguage } from '../i18n'
import { analyzeDemoScan, validateUploadedImage, type DemoScanId, type ScanSource } from '../services/diagnosisService'
import { storage } from '../services/storageService'
import { PageHeader } from '../components/ui/UI'

type UploadState = 'idle' | 'checking' | 'uploading' | 'processing' | 'not-leaf' | 'upload-error'

export function ScanPage() {
  const { t } = useLanguage()
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [source, setSource] = useState<ScanSource>({ kind: 'demoScan', demoScan: 'tomato' })
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [loading, setLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const isDemoScan = source.kind === 'demoScan'
  const preview = source.kind === 'uploadedImage' ? source.previewUrl : undefined

  const choosePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSource({ kind: 'uploadedImage', uploadedImage: file, previewUrl: URL.createObjectURL(file) })
    setUploadState('idle')
    setUploadError('')
  }

  const chooseDemo = (demoScan: DemoScanId) => {
    setSource({ kind: 'demoScan', demoScan })
    setUploadState('idle')
    setUploadError('')
  }

  const analyze = async () => {
    if (source.kind === 'uploadedImage') {
      setUploadState('checking')
      const validation = await validateUploadedImage(source.uploadedImage)
      if (!validation.suitable) {
        setUploadState('not-leaf')
        return
      }
      setUploadState('uploading')
      try {
        const result = await createScan(source.uploadedImage, undefined, searchParams.get('userCropId') ?? undefined)
        setUploadState('processing')
        nav(`/diagnosis/${result.diagnosis.id}`)
      } catch (error) {
        setUploadState('upload-error')
        setUploadError(error instanceof ApiError ? error.message : t.uploadFailed)
      }
      return
    }

    setLoading(true)
    const diagnosis = await analyzeDemoScan(source.demoScan)
    storage.saveDiagnosis(diagnosis)
    nav(`/diagnosis/${diagnosis.id}`)
  }

  const retryUpload = () => {
    setUploadState('idle')
    inputRef.current?.click()
  }

  return (
    <>
      <PageHeader eyebrow="Crop Guardian" title={t.upload} />

      <div className="grid gap-6 lg:grid-cols-[1fr_.85fr]">
        <div className="rounded-[32px] border-2 border-dashed border-forest/20 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={choosePhoto} />
            <button
              onClick={() => inputRef.current?.click()}
              className="grid min-h-64 w-full place-items-center rounded-3xl bg-mint/40 text-center transition hover:bg-mint/60 p-4"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="h-64 w-full rounded-2xl object-cover shadow-sm" />
              ) : (
                <div>
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white text-forest shadow-sm">
                    <ImagePlus size={30} />
                  </span>
                  <p className="mt-4 font-black text-ink text-base">{t.takeOrUploadPhoto}</p>
                  <p className="mt-1.5 text-xs text-ink/55 max-w-xs mx-auto">{t.clearCloseupPhoto}</p>
                </div>
              )}
            </button>
          </div>

          <button
            onClick={() => inputRef.current?.click()}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-forest/15 py-3.5 text-sm font-black text-forest hover:bg-mint/40 transition"
          >
            <Upload size={18} />
            {t.choosePhoto}
          </button>
        </div>

        <div className="space-y-5">
          <div className="rounded-[32px] bg-forest p-7 text-white shadow-lg">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-emerald-100">
              <Sparkles size={16} /> {t.aiAssistedAssessment}
            </span>
            <h2 className="mt-4 text-2xl font-black">{t.helpSpotWrong}</h2>
            <ul className="mt-5 space-y-3 text-sm text-emerald-50">
              {[t.identifyLikelyDisease, t.explainSymptomsSimple, t.suggestSafeSteps].map((item) => (
                <li className="flex items-center gap-2.5" key={item}>
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-black text-ink text-sm uppercase tracking-wider">{t.tryDemoScan}</h3>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {sampleScans.map((scan) => (
                <button
                  key={scan.id}
                  onClick={() => chooseDemo(scan.id as DemoScanId)}
                  className={`rounded-2xl p-3 text-center transition-all ${
                    isDemoScan && source.demoScan === scan.id
                      ? `ring-2 ring-forest ${scan.color} shadow-sm scale-105`
                      : `bg-white ${scan.color} hover:shadow-sm`
                  }`}
                >
                  <span className="text-3xl">{scan.emoji}</span>
                  <p className="mt-1.5 text-xs font-black text-ink">{scan.name}</p>
                </button>
              ))}
            </div>
          </div>

          {uploadState === 'not-leaf' && (
            <div className="rounded-2xl border border-coral/20 bg-red-50 p-4 text-red-900 animate-fadeIn">
              <div className="flex gap-3">
                <XCircle className="mt-0.5 shrink-0 text-coral" size={20} />
                <div>
                  <p className="font-black">{t.notLeafError}</p>
                  <p className="mt-1 text-sm leading-5 text-red-800/80">{t.notLeafHint}</p>
                  <button onClick={retryUpload} className="mt-3 text-sm font-black text-forest hover:underline">
                    {t.chooseAnotherPhoto}
                  </button>
                </div>
              </div>
            </div>
          )}

          {uploadState === 'upload-error' && (
            <div className="rounded-2xl border border-coral/20 bg-red-50 p-4 text-sm text-red-900 animate-fadeIn">
              <p className="font-black">{t.uploadFailed}</p>
              <p className="mt-1 text-xs">{uploadError}</p>
            </div>
          )}

          <button
            disabled={loading || uploadState === 'checking' || uploadState === 'uploading'}
            onClick={() => void analyze()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-coral px-6 py-4 font-black text-white shadow-md hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading || uploadState === 'checking' || uploadState === 'uploading' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {loading ? t.analyzingLeaf : uploadState === 'uploading' ? t.uploadingImage : t.checkingPhoto}
              </>
            ) : (
              <>
                <ScanLine size={20} />
                {isDemoScan ? t.analyze : t.uploadAndCheck}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
