import type { Request, Response } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { getProfile } from '../repositories/profileRepository.js'
import { login, register, revokeToken } from '../services/authService.js'
import { loginSchema, parseBody, registerSchema } from '../validation/schemas.js'

export async function registerController(request: Request, response: Response): Promise<void> {
  const input = parseBody(registerSchema, request.body)
  const result = await register(input)
  response.status(201).json({ token: result.token, user: result.user, profile: { ...result.profile, onboardingCompleted: result.profile.onboarding_completed, languageCode: result.profile.language_code } })
}

export async function loginController(request: Request, response: Response): Promise<void> {
  const input = parseBody(loginSchema, request.body)
  response.json(await login(input.email, input.password))
}

export async function logoutController(request: Request, response: Response): Promise<void> {
  if (!request.authTokenHash) throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'A valid bearer token is required.')
  await revokeToken(request.authTokenHash)
  response.json({ success: true })
}

export async function meController(request: Request, response: Response): Promise<void> {
  const profile = await getProfile(request.authUser!.id)
  if (!profile) throw new AppError(404, 'PROFILE_NOT_FOUND', 'The authenticated profile was not found.')
  response.json({ user: request.authUser, profile })
}
