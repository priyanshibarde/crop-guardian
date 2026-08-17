import type { Request, Response } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { deleteUserAccount } from '../repositories/authRepository.js'
import { getProfile } from '../repositories/profileRepository.js'
import { login, register, revokeToken } from '../services/authService.js'
import { imageStorage } from '../services/imageStorageService.js'
import { loginSchema, parseBody, registerSchema } from '../validation/schemas.js'

export async function registerController(request: Request, response: Response): Promise<void> {
  const input = parseBody(registerSchema, request.body)
  const result = await register(input)
  response.status(201).json({ token: result.token, user: result.user, profile: { ...result.profile, name: result.profile.full_name, languageCode: result.profile.language } })
}

export async function loginController(request: Request, response: Response): Promise<void> {
  const input = parseBody(loginSchema, request.body)
  response.json(await login(input.email, input.password))
}

export async function logoutController(request: Request, response: Response): Promise<void> {
  if (!request.authToken) throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'A valid bearer token is required.')
  await revokeToken(request.authToken)
  response.json({ success: true })
}

export async function meController(request: Request, response: Response): Promise<void> {
  const profile = await getProfile(request.authUser!.id)
  if (!profile) throw new AppError(404, 'PROFILE_NOT_FOUND', 'The authenticated profile was not found.')
  response.json({ user: request.authUser, profile })
}

export async function deleteAccountController(request: Request, response: Response): Promise<void> {
  const userId = request.authUser!.id
  const storageKeys = await deleteUserAccount(userId)
  for (const key of storageKeys) {
    try {
      await imageStorage.removeImage(key)
    } catch {
      // Best-effort image cleanup
    }
  }
  response.json({ success: true })
}
