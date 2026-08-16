import { z } from 'zod'
import { AppError } from '../middleware/errorHandler.js'

const role = z.enum(['farmer', 'home-grower'])
export const registerSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(120),
  location: z.string().trim().max(200).default(''),
  role: role.default('farmer'),
  languageCode: z.string().trim().min(2).max(20).default('en'),
})
export const loginSchema = z.object({ email: z.string().trim().email().max(320), password: z.string().min(1).max(128) })
export const profilePatchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  location: z.string().trim().max(200).optional(),
  role: role.optional(),
  onboardingCompleted: z.boolean().optional(),
  languageCode: z.string().trim().min(2).max(20).optional(),
}).refine((value) => Object.keys(value).length > 0, { message: 'At least one profile field is required.' })
export const cropCreateSchema = z.object({
  name: z.string().trim().min(1).max(100), variety: z.string().trim().max(100).default(''), stage: z.string().trim().max(100).default(''),
  health: z.number().int().min(0).max(100).default(0), nextTask: z.string().trim().max(300).default(''), color: z.string().trim().max(60).default('bg-emerald-500'),
})
export const cropPatchSchema = cropCreateSchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'At least one crop field is required.' })
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
