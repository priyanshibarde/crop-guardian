import type { CropCatalog, UserCrop, UserProfile } from '../types'

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
    response = await fetch(url, { ...requestInit, headers: { Accept: 'application/json', ...(requestInit.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers } })
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
export const createUserCrop = (input: UserCropInput) => apiRequest<UserCrop>('/user-crops', { method: 'POST', body: JSON.stringify(input) })
export const updateUserCrop = (id: string, input: UserCropInput) => apiRequest<UserCrop>(`/user-crops/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(input) })
export const deleteUserCrop = (id: string) => apiRequest<{ success: boolean }>(`/user-crops/${encodeURIComponent(id)}`, { method: 'DELETE' })
