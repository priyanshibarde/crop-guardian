import type { CropCatalog, UserCrop, UserCropDetail, UserProfile, CropTimelineEvent, DiagnosisSummary, Pet } from '../types'

export type ScanStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type DiagnosisStatus = 'pending' | 'completed' | 'failed'
export type DiagnosisAvailability = 'unavailable' | null
export type BackendDiagnosis = {
  id: string
  scanId: string
  status: DiagnosisStatus
  availability: DiagnosisAvailability
  predictedCrop: string | null
  predictedDisease: string | null
  scientificName: string | null
  severity: string | null
  confidence: number | null
  modelName: string | null
  modelVersion: string | null
  symptoms: string[]
  actions: string[]
  prevention: string[]
  errorMessage?: string
  createdAt: string
  updatedAt: string
}
export type BackendScan = { id: string; cropId: string | null; userCropId: string | null; originalFilename: string; mimeType: string; fileSize: number; status: ScanStatus; createdAt: string; updatedAt: string }
export type ScanResponse = { scan: BackendScan; diagnosis: BackendDiagnosis | null }
export type CreateScanResponse = { scan: Pick<BackendScan, 'id' | 'cropId' | 'userCropId' | 'status' | 'createdAt'>; diagnosis: Pick<BackendDiagnosis, 'id' | 'status'> }

const defaultBaseUrl = 'http://localhost:4000/api'
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || defaultBaseUrl
const tokenKey = 'cg-auth-token'

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  constructor(status: number, message: string, code?: string) { super(message); this.name = 'ApiError'; this.status = status; this.code = code }
}

export const authToken = {
  get: () => sessionStorage.getItem(tokenKey),
  set: (token: string) => sessionStorage.setItem(tokenKey, token),
  clear: () => sessionStorage.removeItem(tokenKey),
}

type ApiRequestOptions = RequestInit & { query?: Record<string, string | number | boolean | undefined> }
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { query, headers, ...requestInit } = options
  const url = new URL(`${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`)
  Object.entries(query ?? {}).forEach(([key, value]) => { if (value !== undefined) url.searchParams.set(key, String(value)) })
  const token = authToken.get()
  let response: Response
  try {
    const isMultipart = typeof FormData !== 'undefined' && requestInit.body instanceof FormData
    response = await fetch(url, { ...requestInit, headers: { Accept: 'application/json', ...(requestInit.body && !isMultipart ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers } })
  } catch { throw new ApiError(0, 'The Crop Guardian server is unavailable.') }
  const payload = await response.json().catch(() => undefined)
  if (!response.ok) throw new ApiError(response.status, payload?.error?.message ?? 'The API request failed.', payload?.error?.code)
  return payload as T
}

type AuthResponse = { token: string; user: { id: string; email: string }; profile?: UserProfile }
type CurrentUserResponse = { user: { id: string; email: string }; profile: UserProfile }
export type RegisterInput = { email: string; password: string; fullName: string; location?: string; phone?: string; role?: 'farmer' | 'home-grower'; languageCode?: string }
export type LoginInput = { email: string; password: string }
export type ProfileUpdate = Partial<Pick<UserProfile, 'fullName' | 'location' | 'phone' | 'profileImageUrl' | 'role' | 'onboardingCompleted' | 'language'>>
export type UserCropInput = { cropId?: string; name?: string; customName?: string; plantedAt?: string; area?: number; areaUnit?: string; notes?: string; variety?: string; stage?: string; health?: number; nextTask?: string; color?: string }

export const register = (input: RegisterInput) => apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) })
export const login = (input: LoginInput) => apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) })
export const logout = () => apiRequest<{ success: boolean }>('/auth/logout', { method: 'POST' })
export const getCurrentUser = () => apiRequest<CurrentUserResponse>('/auth/me')
export const getProfile = () => apiRequest<UserProfile>('/profile')
export const updateProfile = (input: ProfileUpdate) => apiRequest<UserProfile>('/profile', { method: 'PUT', body: JSON.stringify(input) })
export const getCrops = () => apiRequest<CropCatalog[]>('/crops')
export const getCrop = (id: string) => apiRequest<CropCatalog>(`/crops/${encodeURIComponent(id)}`)
export const getUserCrops = () => apiRequest<UserCrop[]>('/user-crops')
export const getPets = () => apiRequest<Pet[]>('/me/pets')
export const createPet = (input: Pick<Pet, 'name' | 'type' | 'breed'>) => apiRequest<Pet>('/me/pets', { method: 'POST', body: JSON.stringify(input) })
export const createUserCrop = (input: UserCropInput) => apiRequest<UserCrop>('/user-crops', { method: 'POST', body: JSON.stringify(input) })
export const updateUserCrop = (id: string, input: UserCropInput) => apiRequest<UserCrop>(`/user-crops/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(input) })
export const deleteUserCrop = (id: string) => apiRequest<{ success: boolean }>(`/user-crops/${encodeURIComponent(id)}`, { method: 'DELETE' })
export const createScan = (file: File, cropId?: string, userCropId?: string) => { const form = new FormData(); form.append('image', file); if (cropId) form.append('cropId', cropId); if (userCropId) form.append('userCropId', userCropId); return apiRequest<CreateScanResponse>('/scans', { method: 'POST', body: form }) }
export const getScan = (id: string) => apiRequest<ScanResponse>(`/scans/${encodeURIComponent(id)}`)
export const getDiagnosis = (id: string) => apiRequest<BackendDiagnosis>(`/diagnoses/${encodeURIComponent(id)}`)
export const getDiagnoses = () => apiRequest<BackendDiagnosis[]>('/diagnoses')
export const getUserCropDetail = (id: string) => apiRequest<UserCropDetail>(`/user-crops/${encodeURIComponent(id)}`)
export const getUserCropDiagnoses = (id: string) => apiRequest<DiagnosisSummary[]>(`/user-crops/${encodeURIComponent(id)}/diagnoses`)
export const getUserCropTimeline = (id: string) => apiRequest<CropTimelineEvent[]>(`/user-crops/${encodeURIComponent(id)}/timeline`)
