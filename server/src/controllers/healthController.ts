import type { Request, Response } from 'express'
import type { HealthResponse } from '../types/api.js'

export function getHealth(_request: Request, response: Response<HealthResponse>): void {
  response.json({ status: 'ok' })
}
