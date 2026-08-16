import { basename } from 'node:path'
import { AppError } from '../middleware/errorHandler.js'
import { completeScanDiagnosis, createScanWithDiagnosis, failScanDiagnosis } from '../repositories/scanRepository.js'
import { imageStorage } from './imageStorageService.js'
import { infer } from './inferenceService.js'
import type { Diagnosis, Scan } from '../types/diagnosis.js'

const acceptedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function createUploadedScan(userId: string, file: Express.Multer.File, cropId?: string): Promise<{ scan: Scan; diagnosis: Diagnosis }> {
  if (!acceptedMimeTypes.has(file.mimetype)) throw new AppError(400, 'UNSUPPORTED_IMAGE_TYPE', 'Only JPEG, PNG, and WebP images are supported.')
  if (!file.size) throw new AppError(400, 'EMPTY_IMAGE', 'The uploaded image is empty.')
  const storageKey = await imageStorage.storeImage(file.buffer, file.mimetype)
  const result = await createScanWithDiagnosis({
    userId,
    cropId,
    originalFilename: basename(file.originalname).slice(0, 255) || 'uploaded-image',
    mimeType: file.mimetype,
    fileSize: file.size,
    storageKey,
  })
  const inference = await infer({ imageKey: storageKey, mimeType: file.mimetype })
  if (inference.status === 'completed' && inference.prediction) {
    const completed = await completeScanDiagnosis(userId, result.scan.id, result.diagnosis.id, { prediction: inference.prediction, model: inference.model })
    return { scan: { ...result.scan, status: completed.scanStatus }, diagnosis: { ...result.diagnosis, status: completed.diagnosisStatus, predictedCrop: inference.prediction.crop, predictedDisease: inference.prediction.disease, confidence: inference.prediction.confidence, modelName: inference.model.name, modelVersion: inference.model.version } }
  }
  if (inference.status === 'failed') {
    const failed = await failScanDiagnosis(userId, result.scan.id, result.diagnosis.id)
    return { scan: { ...result.scan, status: failed.scanStatus }, diagnosis: { ...result.diagnosis, status: failed.diagnosisStatus } }
  }
  return result
}
