import type { Request, Response } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { createUserCrop, deleteUserCrop, getCatalog, getUserCropForUser, listCatalog, listUserCrops, updateUserCrop } from '../repositories/cropRepository.js'
import { getCropTimeline, getLatestScanForUserCrop, listDiagnosesForUserCrop } from '../repositories/scanRepository.js'
import { cropCreateSchema, cropPatchSchema, parseBody } from '../validation/schemas.js'

export async function getCrops(_request: Request, response: Response): Promise<void> { response.json(await listCatalog()) }
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function requireUuid(value: string, code: string, message: string): string { if (!uuidPattern.test(value)) throw new AppError(400, code, message); return value }
export async function getCrop(request: Request, response: Response): Promise<void> { const id = requireUuid(request.params.id as string, 'INVALID_CROP_ID', 'The crop ID is invalid.'); const crop = await getCatalog(id); if (!crop) throw new AppError(404, 'CROP_NOT_FOUND', 'Crop not found.'); response.json(crop) }
export async function getUserCrops(request: Request, response: Response): Promise<void> { response.json(await listUserCrops(request.authUser!.id)) }
export async function postUserCrop(request: Request, response: Response): Promise<void> { const input = parseBody(cropCreateSchema, request.body); if (input.cropId && !(await getCatalog(input.cropId))) throw new AppError(400, 'INVALID_CROP_ID', 'The referenced crop does not exist.'); const crop = await createUserCrop(request.authUser!.id, input); if (!crop) throw new AppError(400, 'INVALID_CROP_ID', 'The referenced crop does not exist.'); response.status(201).json(crop) }
export async function patchUserCrop(request: Request, response: Response): Promise<void> { const id = requireUuid(request.params.id as string, 'INVALID_USER_CROP_ID', 'The user crop ID is invalid.'); const input = parseBody(cropPatchSchema, request.body); if (input.cropId && !(await getCatalog(input.cropId))) throw new AppError(400, 'INVALID_CROP_ID', 'The referenced crop does not exist.'); const crop = await updateUserCrop(request.authUser!.id, id, input); if (!crop) throw new AppError(404, 'USER_CROP_NOT_FOUND', 'User crop not found.'); response.json(crop) }
export async function removeUserCrop(request: Request, response: Response): Promise<void> { const id = requireUuid(request.params.id as string, 'INVALID_USER_CROP_ID', 'The user crop ID is invalid.'); if (!(await deleteUserCrop(request.authUser!.id, id))) throw new AppError(404, 'USER_CROP_NOT_FOUND', 'User crop not found.'); response.json({ success: true }) }

export async function getUserCropDetail(request: Request, response: Response): Promise<void> {
  const id = requireUuid(request.params.id as string, 'INVALID_USER_CROP_ID', 'The user crop ID is invalid.')
  const crop = await getUserCropForUser(request.authUser!.id, id)
  if (!crop) throw new AppError(404, 'USER_CROP_NOT_FOUND', 'User crop not found.')
  const [diagnoses, latestScan, timeline, catalog] = await Promise.all([
    listDiagnosesForUserCrop(request.authUser!.id, id),
    getLatestScanForUserCrop(request.authUser!.id, id),
    getCropTimeline(request.authUser!.id, id),
    crop.cropId ? getCatalog(crop.cropId) : Promise.resolve(null),
  ])
  response.json({ crop, catalog, latestScan, latestDiagnosis: diagnoses[0] ?? null, diagnoses, timeline })
}

export async function getUserCropDiagnoses(request: Request, response: Response): Promise<void> {
  const id = requireUuid(request.params.id as string, 'INVALID_USER_CROP_ID', 'The user crop ID is invalid.')
  if (!(await getUserCropForUser(request.authUser!.id, id))) throw new AppError(404, 'USER_CROP_NOT_FOUND', 'User crop not found.')
  response.json(await listDiagnosesForUserCrop(request.authUser!.id, id))
}

export async function getUserCropTimeline(request: Request, response: Response): Promise<void> {
  const id = requireUuid(request.params.id as string, 'INVALID_USER_CROP_ID', 'The user crop ID is invalid.')
  if (!(await getUserCropForUser(request.authUser!.id, id))) throw new AppError(404, 'USER_CROP_NOT_FOUND', 'User crop not found.')
  response.json(await getCropTimeline(request.authUser!.id, id))
}

export const getCropsForUser = getUserCrops
export const postCrop = postUserCrop
export const patchCrop = patchUserCrop
export const removeCrop = removeUserCrop
