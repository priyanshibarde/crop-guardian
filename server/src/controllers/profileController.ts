import type { Request, Response } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { getProfile, updateProfile as saveProfile } from '../repositories/profileRepository.js'
import { parseBody, profilePatchSchema } from '../validation/schemas.js'

export async function getMeProfile(request: Request, response: Response): Promise<void> {
  const profile = await getProfile(request.authUser!.id)
  if (!profile) throw new AppError(404, 'PROFILE_NOT_FOUND', 'The authenticated profile was not found.')
  response.json(profile)
}

export async function patchMeProfile(request: Request, response: Response): Promise<void> {
  const input = parseBody(profilePatchSchema, request.body)
  const profile = await saveProfile(request.authUser!.id, input)
  if (!profile) throw new AppError(404, 'PROFILE_NOT_FOUND', 'The authenticated profile was not found.')
  response.json(profile)
}

export const updateProfile = patchMeProfile
