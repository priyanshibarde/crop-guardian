import type { Request, Response } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import { createPet, deletePet, listPets, updatePet } from '../repositories/petRepository.js'
import { parseBody, petCreateSchema, petPatchSchema } from '../validation/schemas.js'

export async function getPets(request: Request, response: Response): Promise<void> { response.json(await listPets(request.authUser!.id)) }
export async function postPet(request: Request, response: Response): Promise<void> { response.status(201).json(await createPet(request.authUser!.id, parseBody(petCreateSchema, request.body))) }
export async function patchPet(request: Request, response: Response): Promise<void> { const pet = await updatePet(request.authUser!.id, request.params.id as string, parseBody(petPatchSchema, request.body)); if (!pet) throw new AppError(404, 'PET_NOT_FOUND', 'Pet not found.'); response.json(pet) }
export async function removePet(request: Request, response: Response): Promise<void> { if (!(await deletePet(request.authUser!.id, request.params.id as string))) throw new AppError(404, 'PET_NOT_FOUND', 'Pet not found.'); response.json({ success: true }) }
