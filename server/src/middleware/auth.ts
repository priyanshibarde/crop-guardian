import type { NextFunction, Request, Response } from 'express'
import { AppError } from './errorHandler.js'
import { authenticateToken } from '../services/authService.js'

export async function requireAuth(request: Request, _response: Response, next: NextFunction): Promise<void> {
  try {
    const header = request.header('authorization')
    const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : undefined
    if (!token) throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'A valid bearer token is required.')
    const user = await authenticateToken(token)
    if (!user) throw new AppError(401, 'INVALID_SESSION', 'The session is missing, expired, or invalid.')
    request.authUser = user
    request.authTokenHash = token
    next()
  } catch (error) { next(error) }
}
