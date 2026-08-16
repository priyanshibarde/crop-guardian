import { pool } from '../db/pool.js'
import type { Diagnosis, DiagnosisStatus, Scan, ScanStatus } from '../types/diagnosis.js'

const scanSelect = `SELECT id, user_id AS "userId", crop_id AS "cropId", original_filename AS "originalFilename", mime_type AS "mimeType", file_size AS "fileSize", status, created_at AS "createdAt", updated_at AS "updatedAt" FROM scans`
const diagnosisSelect = `SELECT id, scan_id AS "scanId", user_id AS "userId", predicted_crop AS "predictedCrop", predicted_disease AS "predictedDisease", scientific_name AS "scientificName", severity, confidence, model_name AS "modelName", model_version AS "modelVersion", status, symptoms, actions, prevention, error_message AS "errorMessage", created_at AS "createdAt", updated_at AS "updatedAt" FROM diagnoses`

export async function createScanWithDiagnosis(input: { userId: string; cropId?: string; originalFilename: string; mimeType: string; fileSize: number; storageKey: string }): Promise<{ scan: Scan; diagnosis: Diagnosis }> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const scan = (await client.query<Scan>(`INSERT INTO scans (user_id, crop_id, original_filename, mime_type, file_size, storage_key) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, user_id AS "userId", crop_id AS "cropId", original_filename AS "originalFilename", mime_type AS "mimeType", file_size AS "fileSize", status, created_at AS "createdAt", updated_at AS "updatedAt"`, [input.userId, input.cropId ?? null, input.originalFilename, input.mimeType, input.fileSize, input.storageKey])).rows[0]
    const diagnosis = (await client.query<Diagnosis>(`INSERT INTO diagnoses (scan_id, user_id) VALUES ($1, $2) RETURNING id, scan_id AS "scanId", user_id AS "userId", predicted_crop AS "predictedCrop", predicted_disease AS "predictedDisease", scientific_name AS "scientificName", severity, confidence, model_name AS "modelName", model_version AS "modelVersion", status, symptoms, actions, prevention, error_message AS "errorMessage", created_at AS "createdAt", updated_at AS "updatedAt"`, [scan.id, input.userId])).rows[0]
    await client.query('COMMIT')
    return { scan, diagnosis }
  } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
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
