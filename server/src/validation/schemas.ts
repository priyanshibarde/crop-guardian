import { z } from 'zod'
import { AppError } from '../middleware/errorHandler.js'

const role = z.enum(['farmer', 'home-grower'])
export const registerSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
  fullName: z.string().trim().min(1).max(120).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  location: z.string().trim().max(200).default(''),
  phone: z.string().trim().max(40).optional(),
  role: role.default('farmer'),
  languageCode: z.string().trim().min(2).max(20).default('en'),
}).transform((value) => ({ ...value, fullName: value.fullName ?? value.name ?? '' })).refine((value) => value.fullName.length > 0, { message: 'fullName: Required.' })
export const loginSchema = z.object({ email: z.string().trim().email().max(320), password: z.string().min(1).max(128) })
export const profilePatchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  fullName: z.string().trim().min(1).max(120).optional(),
  location: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  profileImageUrl: z.string().url().max(1000).nullable().optional(),
  role: role.optional(),
  onboardingCompleted: z.boolean().optional(),
  language: z.string().trim().min(2).max(20).optional(),
  languageCode: z.string().trim().min(2).max(20).optional(),
}).refine((value) => Object.keys(value).length > 0, { message: 'At least one profile field is required.' })
const cropFieldsSchema = z.object({
  cropId: z.string().uuid().optional(), name: z.string().trim().min(1).max(100).optional(), customName: z.string().trim().max(100).optional(),
  plantedAt: z.string().date().optional(), area: z.number().positive().max(100000000).optional(), areaUnit: z.string().trim().max(30).optional(), notes: z.string().trim().max(1000).optional(),
  variety: z.string().trim().max(100).default(''), stage: z.string().trim().max(100).default(''), health: z.number().int().min(0).max(100).default(0), nextTask: z.string().trim().max(300).default(''), color: z.string().trim().max(60).default('bg-emerald-500'),
})
export const cropCreateSchema = cropFieldsSchema.refine((value) => value.cropId || value.name, { message: 'cropId or name: One crop reference is required.' })
export const cropPatchSchema = cropFieldsSchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'At least one crop field is required.' })
export const petCreateSchema = z.object({ name: z.string().trim().min(1).max(120), type: z.string().trim().min(1).max(80), breed: z.string().trim().max(120).nullable().optional() })
export const petPatchSchema = petCreateSchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'At least one pet field is required.' })

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) {
    const message = result.error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ')
    throw new AppError(400, 'VALIDATION_ERROR', message)
  }
  return result.data
}
