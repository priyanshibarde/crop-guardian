import { pool } from '../db/pool.js'
import type { Diagnosis, DiagnosisStatus, Scan, ScanStatus } from '../types/diagnosis.js'
import type { CropTimelineEvent, DiagnosisSummary, ScanSummary } from '../types/cropIntelligence.js'

const scanSelect = `SELECT id, user_id AS "userId", crop_id AS "cropId", user_crop_id AS "userCropId", original_filename AS "originalFilename", mime_type AS "mimeType", file_size AS "fileSize", status, created_at AS "createdAt", updated_at AS "updatedAt" FROM scans`
const diagnosisSelect = `SELECT id, scan_id AS "scanId", user_id AS "userId", predicted_crop AS "predictedCrop", predicted_disease AS "predictedDisease", scientific_name AS "scientificName", severity, confidence, model_name AS "modelName", model_version AS "modelVersion", status, symptoms, actions, prevention, error_message AS "errorMessage", created_at AS "createdAt", updated_at AS "updatedAt" FROM diagnoses`

export async function createScanWithDiagnosis(input: { userId: string; cropId?: string; userCropId?: string; originalFilename: string; mimeType: string; fileSize: number; storageKey: string }): Promise<{ scan: Scan; diagnosis: Diagnosis }> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const scan = (await client.query<Scan>(`INSERT INTO scans (user_id, crop_id, user_crop_id, original_filename, mime_type, file_size, storage_key) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, user_id AS "userId", crop_id AS "cropId", user_crop_id AS "userCropId", original_filename AS "originalFilename", mime_type AS "mimeType", file_size AS "fileSize", status, created_at AS "createdAt", updated_at AS "updatedAt"`, [input.userId, input.cropId ?? null, input.userCropId ?? null, input.originalFilename, input.mimeType, input.fileSize, input.storageKey])).rows[0]
    const diagnosis = (await client.query<Diagnosis>(`INSERT INTO diagnoses (scan_id, user_id) VALUES ($1, $2) RETURNING id, scan_id AS "scanId", user_id AS "userId", predicted_crop AS "predictedCrop", predicted_disease AS "predictedDisease", scientific_name AS "scientificName", severity, confidence, model_name AS "modelName", model_version AS "modelVersion", status, symptoms, actions, prevention, error_message AS "errorMessage", created_at AS "createdAt", updated_at AS "updatedAt"`, [scan.id, input.userId])).rows[0]
    await client.query('COMMIT')
    return { scan, diagnosis }
  } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
}

const diagnosisSummarySelect = `SELECT d.id, d.scan_id AS "scanId", d.status, d.predicted_crop AS "predictedCrop", d.predicted_disease AS "predictedDisease", d.severity, d.confidence, d.model_name AS "modelName", d.model_version AS "modelVersion", d.error_message AS "errorMessage", d.created_at AS "createdAt", d.updated_at AS "updatedAt" FROM diagnoses d`

function summary(row: DiagnosisSummary & { errorMessage?: string | null }): DiagnosisSummary {
  return { ...row, availability: row.status === 'pending' && row.errorMessage === 'INFERENCE_UNAVAILABLE' ? 'unavailable' : null }
}

export async function listDiagnosesForUserCrop(userId: string, userCropId: string): Promise<DiagnosisSummary[]> {
  const rows = (await pool.query<DiagnosisSummary & { errorMessage?: string | null }>(`${diagnosisSummarySelect} JOIN scans s ON s.id = d.scan_id WHERE d.user_id = $1 AND s.user_id = $1 AND s.user_crop_id = $2 ORDER BY d.created_at DESC`, [userId, userCropId])).rows
  return rows.map(summary)
}

export async function getLatestScanForUserCrop(userId: string, userCropId: string): Promise<ScanSummary | null> {
  return (await pool.query<ScanSummary>(`SELECT id, user_id AS "userId", crop_id AS "cropId", user_crop_id AS "userCropId", status, created_at AS "createdAt", updated_at AS "updatedAt" FROM scans WHERE user_id = $1 AND user_crop_id = $2 ORDER BY created_at DESC LIMIT 1`, [userId, userCropId])).rows[0] ?? null
}

export async function getCropTimeline(userId: string, userCropId: string): Promise<CropTimelineEvent[]> {
  return (await pool.query<CropTimelineEvent>(`SELECT id::text || ':crop' AS id, 'crop_added' AS type, created_at AS "occurredAt", NULL::uuid AS "diagnosisId", NULL::uuid AS "scanId", NULL::text AS status, 'Crop added' AS label FROM user_crops WHERE id = $1 AND user_id = $2 UNION ALL SELECT s.id::text || ':scan', 'scan_created', s.created_at, NULL::uuid, s.id, s.status, 'Scan uploaded' FROM scans s WHERE s.user_crop_id = $1 AND s.user_id = $2 UNION ALL SELECT d.id::text || ':diagnosis', CASE WHEN d.status = 'completed' THEN 'diagnosis_completed' WHEN d.status = 'failed' THEN 'diagnosis_failed' WHEN d.status = 'pending' AND d.error_message = 'INFERENCE_UNAVAILABLE' THEN 'diagnosis_unavailable' ELSE 'diagnosis_pending' END, d.updated_at, d.id, d.scan_id, d.status, CASE WHEN d.status = 'completed' THEN 'Diagnosis completed' WHEN d.status = 'failed' THEN 'Diagnosis failed' WHEN d.status = 'pending' AND d.error_message = 'INFERENCE_UNAVAILABLE' THEN 'AI diagnosis unavailable' ELSE 'Analysis pending' END FROM diagnoses d JOIN scans s ON s.id = d.scan_id WHERE s.user_crop_id = $1 AND d.user_id = $2 AND s.user_id = $2 ORDER BY "occurredAt" DESC`, [userCropId, userId])).rows
}

export async function getScanForUser(userId: string, id: string): Promise<Scan | undefined> {
  return (await pool.query<Scan>(`${scanSelect} WHERE id = $1 AND user_id = $2`, [id, userId])).rows[0]
}

export async function getDiagnosisForUser(userId: string, id: string): Promise<Diagnosis | undefined> {
  return (await pool.query<Diagnosis>(`${diagnosisSelect} WHERE id = $1 AND user_id = $2`, [id, userId])).rows[0]
}

export async function getDiagnosisByScanForUser(userId: string, scanId: string): Promise<Diagnosis | undefined> {
  return (await pool.query<Diagnosis>(`${diagnosisSelect} WHERE scan_id = $1 AND user_id = $2`, [scanId, userId])).rows[0]
}

export async function listDiagnosesForUser(userId: string, limit = 50, offset = 0): Promise<Diagnosis[]> {
  return (await pool.query<Diagnosis>(`${diagnosisSelect} WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [userId, limit, offset])).rows
}

export async function updateScanStatus(id: string, status: ScanStatus): Promise<void> { await pool.query('UPDATE scans SET status = $1 WHERE id = $2', [status, id]) }
export async function updateDiagnosisStatus(id: string, status: DiagnosisStatus, errorMessage?: string): Promise<void> { await pool.query('UPDATE diagnoses SET status = $1, error_message = $2 WHERE id = $3', [status, errorMessage ?? null, id]) }

import { getDiseaseInfo } from '../data/diseaseCatalog.js'

export async function completeScanDiagnosis(userId: string, scanId: string, diagnosisId: string, inference: { prediction: { className?: string; crop: string; disease: string; confidence: number }; model: { name: string; version: string } }): Promise<{ scanStatus: ScanStatus; diagnosisStatus: DiagnosisStatus }> {
  const info = inference.prediction.className ? getDiseaseInfo(inference.prediction.className) : undefined
  const scientificName = info?.scientificName ?? null
  const severity = info?.severity ?? null
  const symptoms = JSON.stringify(info?.symptoms ?? [])
  const actions = JSON.stringify(info?.actions ?? [])
  const prevention = JSON.stringify(info?.prevention ?? [])

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`UPDATE scans SET status = 'completed' WHERE id = $1 AND user_id = $2`, [scanId, userId])
    await client.query(`UPDATE diagnoses SET predicted_crop = $1, predicted_disease = $2, scientific_name = $3, severity = $4, confidence = $5, model_name = $6, model_version = $7, symptoms = $8::jsonb, actions = $9::jsonb, prevention = $10::jsonb, status = 'completed', error_message = NULL WHERE id = $11 AND user_id = $12`, [
      inference.prediction.crop,
      info?.disease ?? inference.prediction.disease,
      scientificName,
      severity,
      inference.prediction.confidence,
      inference.model.name,
      inference.model.version,
      symptoms,
      actions,
      prevention,
      diagnosisId,
      userId,
    ])
    await client.query('COMMIT')
    return { scanStatus: 'completed', diagnosisStatus: 'completed' }
  } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
}

export async function failScanDiagnosis(userId: string, scanId: string, diagnosisId: string): Promise<{ scanStatus: ScanStatus; diagnosisStatus: DiagnosisStatus }> {
  await pool.query(`UPDATE scans SET status = 'failed' WHERE id = $1 AND user_id = $2`, [scanId, userId])
  await pool.query(`UPDATE diagnoses SET status = 'failed', error_message = 'The image could not be analyzed.' WHERE id = $1 AND user_id = $2`, [diagnosisId, userId])
  return { scanStatus: 'failed', diagnosisStatus: 'failed' }
}

export async function markDiagnosisUnavailable(userId: string, diagnosisId: string): Promise<void> {
  await pool.query(`UPDATE diagnoses SET error_message = 'INFERENCE_UNAVAILABLE' WHERE id = $1 AND user_id = $2 AND status = 'pending'`, [diagnosisId, userId])
}
