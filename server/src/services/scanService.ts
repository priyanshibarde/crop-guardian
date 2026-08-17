import { basename } from 'node:path'
import { env } from '../config/env.js'
import { AppError } from '../middleware/errorHandler.js'
import { getCatalog, getUserCropForUser } from '../repositories/cropRepository.js'
import {
  completeScanDiagnosis,
  createScanWithDiagnosis,
  failScanDiagnosis,
  markDiagnosisUnavailable,
  markDiagnosisUnsupportedCrop,
} from '../repositories/scanRepository.js'
import { imageStorage } from './imageStorageService.js'
import { infer } from './inferenceService.js'
import type { Diagnosis, Scan } from '../types/diagnosis.js'

const acceptedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

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

function isCropSupported(cropName: string): boolean {
  const norm = cropName.trim().toLowerCase()
  return SUPPORTED_MODEL_CROPS.has(norm)
}

export async function createUploadedScan(
  userId: string,
  file: Express.Multer.File,
  cropId?: string,
  userCropId?: string
): Promise<{ scan: Scan; diagnosis: Diagnosis }> {
  if (!acceptedMimeTypes.has(file.mimetype)) throw new AppError(400, 'UNSUPPORTED_IMAGE_TYPE', 'Only JPEG, PNG, and WebP images are supported.')
  if (!file.size) throw new AppError(400, 'EMPTY_IMAGE', 'The uploaded image is empty.')

  let targetCropName: string | undefined
  if (userCropId) {
    const userCrop = await getUserCropForUser(userId, userCropId)
    if (userCrop) targetCropName = userCrop.name
  } else if (cropId) {
    const catalogCrop = await getCatalog(cropId)
    if (catalogCrop) targetCropName = catalogCrop.name
  }

  const storageKey = await imageStorage.storeImage(file.buffer, file.mimetype)
  let result: Awaited<ReturnType<typeof createScanWithDiagnosis>>
  try {
    result = await createScanWithDiagnosis({
      userId,
      cropId,
      userCropId,
      originalFilename: basename(file.originalname).slice(0, 255) || 'uploaded-image',
      mimeType: file.mimetype,
      fileSize: file.size,
      storageKey,
    })
  } catch (error) {
    await imageStorage.removeImage(storageKey)
    throw error
  }

  // If user selected a crop that the AI model does not support (e.g. Cotton, Mango, Rice, etc.)
  if (targetCropName && !isCropSupported(targetCropName)) {
    const model = { name: env.modelName, version: env.modelVersion }
    const unsupported = await markDiagnosisUnsupportedCrop(userId, result.scan.id, result.diagnosis.id, targetCropName, model)
    return {
      scan: { ...result.scan, status: unsupported.scanStatus },
      diagnosis: {
        ...result.diagnosis,
        status: unsupported.diagnosisStatus,
        predictedCrop: targetCropName,
        predictedDisease: null,
        confidence: null,
        modelName: model.name,
        modelVersion: model.version,
        errorMessage: 'UNSUPPORTED_CROP',
      },
    }
  }

  const inference = await infer({ imageKey: storageKey, mimeType: file.mimetype })
  if (inference.status === 'completed' && inference.prediction) {
    const isUncertain = inference.prediction.confidence < 0.60
    const completed = await completeScanDiagnosis(userId, result.scan.id, result.diagnosis.id, {
      prediction: inference.prediction,
      model: inference.model,
      isUncertain,
    })
    return {
      scan: { ...result.scan, status: completed.scanStatus },
      diagnosis: {
        ...result.diagnosis,
        status: completed.diagnosisStatus,
        predictedCrop: inference.prediction.crop,
        predictedDisease: inference.prediction.disease,
        confidence: inference.prediction.confidence,
        modelName: inference.model.name,
        modelVersion: inference.model.version,
        errorMessage: isUncertain ? 'LOW_CONFIDENCE' : null,
      },
    }
  }

  if (inference.status === 'failed') {
    const failed = await failScanDiagnosis(userId, result.scan.id, result.diagnosis.id)
    return { scan: { ...result.scan, status: failed.scanStatus }, diagnosis: { ...result.diagnosis, status: failed.diagnosisStatus } }
  }

  if (inference.status === 'unavailable') await markDiagnosisUnavailable(userId, result.diagnosis.id)
  return result
}
