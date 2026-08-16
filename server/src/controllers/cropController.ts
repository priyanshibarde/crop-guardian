import type { Request, Response } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { createCrop, deleteCrop, listCrops, updateCrop } from '../repositories/cropRepository.js'
import { cropCreateSchema, cropPatchSchema, parseBody } from '../validation/schemas.js'

export async function getCrops(request: Request, response: Response): Promise<void> { response.json(await listCrops(request.authUser!.id)) }
export async function postCrop(request: Request, response: Response): Promise<void> { response.status(201).json(await createCrop(request.authUser!.id, parseBody(cropCreateSchema, request.body))) }
export async function patchCrop(request: Request, response: Response): Promise<void> { const crop = await updateCrop(request.authUser!.id, request.params.id as string, parseBody(cropPatchSchema, request.body)); if (!crop) throw new AppError(404, 'CROP_NOT_FOUND', 'Crop not found.'); response.json(crop) }
export async function removeCrop(request: Request, response: Response): Promise<void> { if (!(await deleteCrop(request.authUser!.id, request.params.id as string))) throw new AppError(404, 'CROP_NOT_FOUND', 'Crop not found.'); response.json({ success: true }) }
