const defaultBaseUrl = 'http://localhost:4000/api'

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || defaultBaseUrl

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type ApiRequestOptions = RequestInit & { query?: Record<string, string | number | boolean | undefined> }

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { query, headers, ...requestInit } = options
  const url = new URL(`${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`)
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value))
  })

  const response = await fetch(url, {
    ...requestInit,
    headers: {
      Accept: 'application/json',
      ...(requestInit.body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  })

  const payload = await response.json().catch(() => undefined)
  if (!response.ok) {
    throw new ApiError(response.status, payload?.error?.message ?? 'The API request failed.', payload?.error?.code)
  }
  return payload as T
}
