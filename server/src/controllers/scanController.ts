import type { Request, Response } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { getCatalog } from '../repositories/cropRepository.js'
import { getDiagnosisByScanForUser, getDiagnosisForUser, getScanForUser, listDiagnosesForUser } from '../repositories/scanRepository.js'
import { createUploadedScan } from '../services/scanService.js'

function safeDiagnosis(diagnosis: Awaited<ReturnType<typeof getDiagnosisByScanForUser>>) {
  if (!diagnosis) return null
  return {
    id: diagnosis.id,
    scanId: diagnosis.scanId,
    status: diagnosis.status,
    predictedCrop: diagnosis.status === 'completed' ? diagnosis.predictedCrop : null,
    predictedDisease: diagnosis.status === 'completed' ? diagnosis.predictedDisease : null,
    scientificName: diagnosis.status === 'completed' ? diagnosis.scientificName : null,
    severity: diagnosis.status === 'completed' ? diagnosis.severity : null,
    confidence: diagnosis.status === 'completed' ? diagnosis.confidence : null,
    modelName: diagnosis.status === 'completed' ? diagnosis.modelName : null,
    modelVersion: diagnosis.status === 'completed' ? diagnosis.modelVersion : null,
    symptoms: diagnosis.status === 'completed' ? diagnosis.symptoms : [],
    actions: diagnosis.status === 'completed' ? diagnosis.actions : [],
    prevention: diagnosis.status === 'completed' ? diagnosis.prevention : [],
    errorMessage: diagnosis.status === 'failed' ? 'The diagnosis could not be completed.' : undefined,
    createdAt: diagnosis.createdAt,
    updatedAt: diagnosis.updatedAt,
  }
}

export async function createScan(request: Request, response: Response): Promise<void> {
  if (!request.file) throw new AppError(400, 'IMAGE_REQUIRED', 'An image file is required.')
  const cropId = typeof request.body?.cropId === 'string' ? request.body.cropId : undefined
  if (cropId && !(await getCatalog(cropId))) throw new AppError(400, 'INVALID_CROP_ID', 'The selected crop does not exist.')
  const result = await createUploadedScan(request.authUser!.id, request.file, cropId)
  response.status(201).json({
    scan: { id: result.scan.id, status: result.scan.status, createdAt: result.scan.createdAt },
    diagnosis: { id: result.diagnosis.id, status: result.diagnosis.status },
  })
}

export async function getScan(request: Request, response: Response): Promise<void> {
  const scan = await getScanForUser(request.authUser!.id, request.params.id as string)
  if (!scan) throw new AppError(404, 'SCAN_NOT_FOUND', 'Scan not found.')
  const diagnosis = await getDiagnosisByScanForUser(request.authUser!.id, scan.id)
  response.json({
    scan: { id: scan.id, cropId: scan.cropId, originalFilename: scan.originalFilename, mimeType: scan.mimeType, fileSize: scan.fileSize, status: scan.status, createdAt: scan.createdAt, updatedAt: scan.updatedAt },
    diagnosis: safeDiagnosis(diagnosis),
  })
}

export async function getDiagnosis(request: Request, response: Response): Promise<void> {
  const diagnosis = await getDiagnosisForUser(request.authUser!.id, request.params.id as string)
  if (!diagnosis) throw new AppError(404, 'DIAGNOSIS_NOT_FOUND', 'Diagnosis not found.')
  response.json(safeDiagnosis(diagnosis))
}

export async function getDiagnoses(request: Request, response: Response): Promise<void> {
  const limit = Math.min(Math.max(Number(request.query.limit) || 50, 1), 100)
  const offset = Math.max(Number(request.query.offset) || 0, 0)
  const diagnoses = await listDiagnosesForUser(request.authUser!.id, limit, offset)
  response.json(diagnoses.map(safeDiagnosis))
}
