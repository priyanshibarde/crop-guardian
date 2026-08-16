import { env } from '../config/env.js'

export type InferenceInput = { imageKey: string; mimeType: string }
export type InferencePrediction = { className: string; crop: string; disease: string; confidence: number }
export type InferenceResult = {
  status: 'completed' | 'unavailable' | 'failed' | 'pending'
  prediction: InferencePrediction | null
  model: { name: string; version: string }
  error?: { code: string; message: string }
  inferenceTimeMs?: number
}

function modelInfo() { return { name: env.modelName, version: env.modelVersion } }

function normalizeClassName(className: string): InferencePrediction | null {
  const [crop, ...diseaseParts] = className.split('___')
  if (!crop || diseaseParts.length === 0) return null
  const disease = diseaseParts.join('___').replace(/_/g, ' ').trim()
  if (!disease) return null
  return { className, crop: crop.trim(), disease: disease.toLowerCase() === 'healthy' ? 'Healthy' : disease.replace(/\b\w/g, (letter) => letter.toUpperCase()), confidence: 0 }
}

export async function infer(input: InferenceInput): Promise<InferenceResult> {
  if (!/^[a-f0-9-]+\.(jpg|jpeg|png|webp)$/i.test(input.imageKey)) {
    return { status: 'failed', prediction: null, model: modelInfo(), error: { code: 'INVALID_IMAGE_REFERENCE', message: 'The image reference is invalid.' } }
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)
  try {
    const response = await fetch(`${env.inferenceServiceUrl}/predict`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ imageKey: input.imageKey, mimeType: input.mimeType }), signal: controller.signal })
    const payload = await response.json().catch(() => undefined) as Partial<InferenceResult> | undefined
    if (!response.ok && payload?.status !== 'unavailable') return { status: 'failed', prediction: null, model: modelInfo(), error: { code: 'INFERENCE_FAILED', message: 'The image could not be analyzed.' } }
    if (payload?.status === 'unavailable') return { status: 'unavailable', prediction: null, model: payload.model ?? modelInfo(), error: { code: payload.error?.code ?? 'MODEL_NOT_CONFIGURED', message: payload.error?.message ?? 'The inference model is unavailable.' } }
    if (payload?.status !== 'completed' || !payload.prediction || typeof payload.prediction !== 'object') return { status: 'failed', prediction: null, model: modelInfo(), error: { code: 'INVALID_INFERENCE_RESPONSE', message: 'The inference service returned an invalid response.' } }
    const raw = payload.prediction as { class_name?: unknown; confidence?: unknown }
    if (typeof raw.class_name !== 'string' || typeof raw.confidence !== 'number' || raw.confidence < 0 || raw.confidence > 1) return { status: 'failed', prediction: null, model: modelInfo(), error: { code: 'INVALID_INFERENCE_RESPONSE', message: 'The inference service returned an invalid prediction.' } }
    const prediction = normalizeClassName(raw.class_name)
    if (!prediction) return { status: 'failed', prediction: null, model: modelInfo(), error: { code: 'UNVERIFIED_CLASS_LABEL', message: 'The model returned an unsupported class label.' } }
    prediction.confidence = raw.confidence
    return { status: 'completed', prediction, model: payload.model ?? modelInfo(), inferenceTimeMs: typeof payload.inferenceTimeMs === 'number' ? payload.inferenceTimeMs : undefined }
  } catch (error) {
    const unavailable = error instanceof Error && error.name === 'AbortError' ? 'The inference service timed out.' : 'The inference service is unavailable.'
    return { status: 'unavailable', prediction: null, model: modelInfo(), error: { code: 'MODEL_NOT_CONFIGURED', message: unavailable } }
  } finally { clearTimeout(timeout) }
}
