import type { Diagnosis, Scan } from './diagnosis.js'
import type { CropCatalog, UserCrop } from '../repositories/cropRepository.js'

export type DiagnosisAvailability = 'unavailable' | 'unsupported_crop' | 'uncertain' | null
export type DiagnosisSummary = Pick<Diagnosis, 'id' | 'scanId' | 'status' | 'predictedCrop' | 'predictedDisease' | 'severity' | 'confidence' | 'modelName' | 'modelVersion' | 'createdAt' | 'updatedAt'> & { availability: DiagnosisAvailability; errorMessage?: string | null }
export type ScanSummary = Pick<Scan, 'id' | 'userId' | 'cropId' | 'userCropId' | 'status' | 'createdAt' | 'updatedAt'>
export type CropTimelineEventType = 'crop_added' | 'scan_created' | 'diagnosis_pending' | 'diagnosis_completed' | 'diagnosis_failed' | 'diagnosis_unavailable'
export type CropTimelineEvent = { id: string; type: CropTimelineEventType; occurredAt: Date; diagnosisId?: string; scanId?: string; status?: string; label: string }
export type UserCropIntelligence = { crop: UserCrop; catalog: CropCatalog | null; latestScan: ScanSummary | null; latestDiagnosis: DiagnosisSummary | null; diagnoses: DiagnosisSummary[]; timeline: CropTimelineEvent[] }
