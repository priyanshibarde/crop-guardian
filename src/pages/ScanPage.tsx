import { CheckCircle2, ImagePlus, ScanLine, Sparkles, Upload, XCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, createScan } from '../api/client'
import { sampleScans } from '../data/mockData'
import { useLanguage } from '../i18n'
import { analyzeDemoScan, validateUploadedImage, type DemoScanId, type ScanSource } from '../services/diagnosisService'
import { storage } from '../services/storageService'
import { PageHeader } from '../components/ui/UI'

type UploadState = 'idle' | 'checking' | 'uploading' | 'processing' | 'not-leaf' | 'demo-only' | 'upload-error'
export function ScanPage() {
  const { t } = useLanguage()
  const nav = useNavigate()
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
      if (!validation.suitable) { setUploadState('not-leaf'); return }
      setUploadState('uploading')
      try {
        const result = await createScan(source.uploadedImage)
        setUploadState('processing')
        nav(`/diagnosis/${result.diagnosis.id}`)
      } catch (error) {
        setUploadState('upload-error')
        setUploadError(error instanceof ApiError ? error.message : 'The image could not be uploaded. Please try again.')
      }
      return
    }
    setLoading(true)
    const diagnosis = await analyzeDemoScan(source.demoScan)
    storage.saveDiagnosis(diagnosis)
    nav(`/diagnosis/${diagnosis.id}`)
  }
  const retryUpload = () => { setUploadState('idle'); inputRef.current?.click() }
  return <>
    <PageHeader eyebrow="AI Crop Scanner" title={t.upload}/>
    <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
      <div className="rounded-[28px] border-2 border-dashed border-forest/20 bg-white p-5 sm:p-8">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={choosePhoto}/>
        <button onClick={() => inputRef.current?.click()} className="grid min-h-65 w-full place-items-center rounded-3xl bg-mint/50 text-center transition hover:bg-mint">{preview ? <img src={preview} className="h-64 w-full rounded-3xl object-cover"/> : <div><span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white text-forest shadow-sm"><ImagePlus size={29}/></span><p className="mt-4 font-extrabold">Take or upload a leaf photo</p><p className="mt-1 text-sm text-ink/50">Use a clear, close-up photo in natural light</p></div>}</button>
        <button onClick={() => inputRef.current?.click()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-forest/15 py-3 text-sm font-bold text-forest"><Upload size={16}/>Choose photo</button>
      </div>
      <div>
        <div className="rounded-[28px] bg-forest p-6 text-white"><span className="flex items-center gap-2 text-sm font-bold text-emerald-100"><Sparkles size={17}/> AI-assisted assessment</span><h2 className="mt-3 text-2xl font-black">We’ll help you spot what’s wrong.</h2><ul className="mt-5 space-y-3 text-sm text-emerald-50">{['Identify likely crop disease','Explain symptoms in simple language','Suggest safe next steps'].map((item) => <li className="flex gap-2" key={item}><CheckCircle2 size={17}/>{item}</li>)}</ul></div>
        <h3 className="mt-6 font-extrabold">Or try a demo scan</h3><div className="mt-3 grid grid-cols-3 gap-3">{sampleScans.map((scan) => <button key={scan.id} onClick={() => chooseDemo(scan.id as DemoScanId)} className={`rounded-2xl p-3 text-center ${isDemoScan && source.demoScan === scan.id ? `ring-2 ring-forest ${scan.color}` : `bg-white ${scan.color}`}`}><span className="text-3xl">{scan.emoji}</span><p className="mt-1 text-xs font-bold">{scan.name}</p></button>)}</div>
        {uploadState === 'not-leaf' && <div className="mt-5 rounded-2xl border border-coral/20 bg-red-50 p-4 text-red-900"><div className="flex gap-3"><XCircle className="mt-0.5 shrink-0 text-coral" size={20}/><div><p className="font-extrabold">We couldn’t identify a crop or leaf in this photo.</p><p className="mt-1 text-sm leading-5 text-red-800/75">Please upload a clear, close-up photo of a plant leaf in natural light.</p><button onClick={retryUpload} className="mt-3 text-sm font-extrabold text-forest">Choose another photo</button></div></div></div>}
        {uploadState === 'demo-only' && <div className="mt-5 rounded-2xl border border-forest/15 bg-mint/50 p-4 text-ink"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-forest" size={20}/><div><p className="font-extrabold">Your photo looks suitable for a leaf check.</p><p className="mt-1 text-sm leading-5 text-ink/65">Live uploaded-photo diagnosis is not enabled in this prototype. To avoid misleading results, simulated assessments are available only for the curated demo scans below.</p><button onClick={() => chooseDemo('tomato')} className="mt-3 text-sm font-extrabold text-forest">Try a demo scan</button></div></div></div>}
        {uploadState === 'processing' && <div className="mt-5 rounded-2xl border border-forest/15 bg-mint/50 p-4 text-sm text-ink"><p className="font-extrabold">Image uploaded successfully.</p><p className="mt-1 text-ink/65">AI diagnosis is unavailable until a live model is connected. No disease prediction has been generated.</p></div>}
        {uploadState === 'upload-error' && <div className="mt-5 rounded-2xl border border-coral/20 bg-red-50 p-4 text-sm text-red-900"><p className="font-extrabold">Upload failed</p><p className="mt-1">{uploadError}</p></div>}
        <button disabled={loading || uploadState === 'checking' || uploadState === 'uploading'} onClick={analyze} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-coral px-5 py-4 font-extrabold text-white disabled:opacity-60">{loading || uploadState === 'checking' || uploadState === 'uploading' ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>{loading ? 'Analyzing leaf health…' : uploadState === 'uploading' ? 'Uploading image…' : 'Checking photo…'}</> : <><ScanLine size={19}/>{isDemoScan ? t.analyze : 'Upload and check photo'}</>}</button>
      </div>
    </div>
  </>
}
