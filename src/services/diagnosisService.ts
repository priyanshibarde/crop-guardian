import { diagnosisTemplates } from '../data/mockData'
import type { Diagnosis } from '../types'

export type DemoScanId = keyof typeof diagnosisTemplates
export type ScanSource =
  | { kind: 'demoScan'; demoScan: DemoScanId }
  | { kind: 'uploadedImage'; uploadedImage: File; previewUrl: string }
export type UploadValidation = { suitable: boolean; reason?: 'not-leaf-like' | 'too-small' | 'unsupported' }

export async function analyzeDemoScan(demoScan: DemoScanId): Promise<Diagnosis> {
  await new Promise((resolve) => setTimeout(resolve, 2400))
  const diagnosis = diagnosisTemplates[demoScan]
  return { ...diagnosis, id: `scan-${Date.now()}`, date: 'Just now' }
}

/**
 * This only rejects clearly unsuitable uploads. It is not a plant classifier and
 * never authorizes a disease diagnosis; curated demo scans are the only simulated
 * diagnoses in this prototype.
 */
export async function validateUploadedImage(file: File): Promise<UploadValidation> {
  if (!file.type.startsWith('image/')) return { suitable: false, reason: 'unsupported' }
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('Unreadable image'))
      element.src = objectUrl
    })
    if (image.naturalWidth < 160 || image.naturalHeight < 160) return { suitable: false, reason: 'too-small' }
    const canvas = document.createElement('canvas')
    canvas.width = 48
    canvas.height = 48
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return { suitable: true }
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    let leafLikePixels = 0
    for (let index = 0; index < pixels.length; index += 4) {
      const [red, green, blue] = [pixels[index], pixels[index + 1], pixels[index + 2]]
      if (green > red * 1.08 && green > blue * 1.08 && green > 48) leafLikePixels += 1
    }
    return leafLikePixels / (pixels.length / 4) >= 0.02 ? { suitable: true } : { suitable: false, reason: 'not-leaf-like' }
  } catch { return { suitable: false, reason: 'unsupported' } } finally { URL.revokeObjectURL(objectUrl) }
}
