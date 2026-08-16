export type ScanStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type DiagnosisStatus = 'pending' | 'completed' | 'failed'

export type Scan = {
  id: string
  userId: string
  cropId: string | null
  userCropId: string | null
  originalFilename: string
  mimeType: string
  fileSize: number
  status: ScanStatus
  createdAt: Date
  updatedAt: Date
}

export type Diagnosis = {
  id: string
  scanId: string
  userId: string
  predictedCrop: string | null
  predictedDisease: string | null
  scientificName: string | null
  severity: string | null
  confidence: number | null
  modelName: string | null
  modelVersion: string | null
  status: DiagnosisStatus
  symptoms: string[]
  actions: string[]
  prevention: string[]
  errorMessage: string | null
  createdAt: Date
  updatedAt: Date
}

export type DiagnosisResponse = Omit<Diagnosis, 'userId' | 'errorMessage'> & {
  errorMessage?: string
}
