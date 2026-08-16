import type { Request, Response } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { createUserCrop, deleteUserCrop, getCatalog, listCatalog, listUserCrops, updateUserCrop } from '../repositories/cropRepository.js'
import { cropCreateSchema, cropPatchSchema, parseBody } from '../validation/schemas.js'

export async function getCrops(_request: Request, response: Response): Promise<void> { response.json(await listCatalog()) }
export async function getCrop(request: Request, response: Response): Promise<void> { const crop = await getCatalog(request.params.id as string); if (!crop) throw new AppError(404, 'CROP_NOT_FOUND', 'Crop not found.'); response.json(crop) }
export async function getUserCrops(request: Request, response: Response): Promise<void> { response.json(await listUserCrops(request.authUser!.id)) }
export async function postUserCrop(request: Request, response: Response): Promise<void> { const input = parseBody(cropCreateSchema, request.body); if (input.cropId && !(await getCatalog(input.cropId))) throw new AppError(400, 'INVALID_CROP_ID', 'The referenced crop does not exist.'); const crop = await createUserCrop(request.authUser!.id, input); if (!crop) throw new AppError(400, 'INVALID_CROP_ID', 'The referenced crop does not exist.'); response.status(201).json(crop) }
export async function patchUserCrop(request: Request, response: Response): Promise<void> { const input = parseBody(cropPatchSchema, request.body); if (input.cropId && !(await getCatalog(input.cropId))) throw new AppError(400, 'INVALID_CROP_ID', 'The referenced crop does not exist.'); const crop = await updateUserCrop(request.authUser!.id, request.params.id as string, input); if (!crop) throw new AppError(404, 'USER_CROP_NOT_FOUND', 'User crop not found.'); response.json(crop) }
export async function removeUserCrop(request: Request, response: Response): Promise<void> { if (!(await deleteUserCrop(request.authUser!.id, request.params.id as string))) throw new AppError(404, 'USER_CROP_NOT_FOUND', 'User crop not found.'); response.json({ success: true }) }

export const getCropsForUser = getUserCrops
export const postCrop = postUserCrop
export const patchCrop = patchUserCrop
export const removeCrop = removeUserCrop
