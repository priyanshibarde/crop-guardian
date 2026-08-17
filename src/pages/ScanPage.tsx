import { AlertCircle, CheckCircle2, ImagePlus, ScanLine, Sparkles, Upload, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, createScan, getUserCrops, getCrops } from '../api/client'
import { sampleScans } from '../data/mockData'
import { translateCropName, useLanguage } from '../i18n'
import { analyzeDemoScan, validateUploadedImage, type DemoScanId, type ScanSource } from '../services/diagnosisService'
import { storage } from '../services/storageService'
import { PageHeader } from '../components/ui/UI'
import type { CropCatalog, UserCrop } from '../types'

type UploadState = 'idle' | 'checking' | 'uploading' | 'processing' | 'not-leaf' | 'upload-error'

const SUPPORTED_MODEL_CROPS = new Set([
  'apple',
  'blueberry',
  'cherry',
  'corn',
  'corn (maize)',
  'maize',
  'grape',
  'grapes',
  'orange',
  'peach',
  'pepper',
  'pepper, bell',
  'bell pepper',
  'chilli',
  'chili',
  'potato',
  'raspberry',
  'soybean',
  'squash',
  'strawberry',
  'tomato',
])

export function ScanPage() {
  const { t, lang } = useLanguage()
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [source, setSource] = useState<ScanSource>({ kind: 'demoScan', demoScan: 'tomato' })
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [loading, setLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [userCrops, setUserCrops] = useState<UserCrop[]>([])
  const [catalogCrops, setCatalogCrops] = useState<CropCatalog[]>([])
  const [selectedCropId, setSelectedCropId] = useState<string>(searchParams.get('cropId') || '')
  const [selectedUserCropId, setSelectedUserCropId] = useState<string>(searchParams.get('userCropId') || '')

  useEffect(() => {
    getUserCrops().then(setUserCrops).catch(() => [])
    getCrops().then(setCatalogCrops).catch(() => [])
  }, [])

  const isDemoScan = source.kind === 'demoScan'
  const preview = source.kind === 'uploadedImage' ? source.previewUrl : undefined

  // Identify selected crop name
  const selectedUserCrop = userCrops.find((c) => c.id === selectedUserCropId)
  const selectedCatalogCrop = catalogCrops.find((c) => c.id === selectedCropId)
  const activeCropName = selectedUserCrop?.name || selectedCatalogCrop?.name
  const isSelectedCropUnsupported = activeCropName ? !SUPPORTED_MODEL_CROPS.has(activeCropName.trim().toLowerCase()) : false

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
        const result = await createScan(
          source.uploadedImage,
          selectedCropId || undefined,
          selectedUserCropId || undefined
        )
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
            {/* Optional Crop Selection */}
            <div className="mb-5">
              <label htmlFor="cropSelect" className="block text-xs font-black uppercase tracking-wider text-ink/70 mb-2">
                {t.selectCropToScan || 'Select crop to scan (optional)'}
              </label>
              <select
                id="cropSelect"
                value={selectedUserCropId ? `user:${selectedUserCropId}` : selectedCropId ? `cat:${selectedCropId}` : ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (!val) {
                    setSelectedUserCropId('')
                    setSelectedCropId('')
                  } else if (val.startsWith('user:')) {
                    setSelectedUserCropId(val.replace('user:', ''))
                    setSelectedCropId('')
                  } else if (val.startsWith('cat:')) {
                    setSelectedCropId(val.replace('cat:', ''))
                    setSelectedUserCropId('')
                  }
                }}
                className="w-full rounded-2xl border border-ink/10 bg-slate-50 px-4 py-3 text-sm font-bold text-ink focus:border-forest focus:outline-none"
              >
                <option value="">{t.generalScan || 'General / Auto-detect crop'}</option>
                {userCrops.length > 0 && (
                  <optgroup label={t.myCrops || 'My Crops'}>
                    {userCrops.map((c) => (
                      <option key={`user-${c.id}`} value={`user:${c.id}`}>
                        {c.customName || translateCropName(c.name, lang)} {c.variety ? `(${c.variety})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label={t.allSupportedCrops || 'Crop Catalog'}>
                  {catalogCrops.map((c) => (
                    <option key={`cat-${c.id}`} value={`cat:${c.id}`}>
                      {translateCropName(c.name, lang)}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {isSelectedCropUnsupported && (
              <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 animate-fadeIn">
                <div className="flex gap-3">
                  <AlertCircle className="shrink-0 text-amber-600 mt-0.5" size={20} />
                  <div className="text-xs leading-relaxed">
                    <p className="font-black text-amber-950">
                      {t.unsupportedCropNotice || 'AI model does not currently support reliable diagnosis for this crop.'}
                    </p>
                    <p className="mt-1 text-amber-800/90">
                      {t.unsupportedCropAdvice || 'Our AI model currently recognizes leaf diseases for 14 crops (Tomato, Potato, Corn, Apple, Grape, Chilli, etc.).'}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
