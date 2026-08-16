import { pool } from '../db/pool.js'

export type CropCatalog = { id: string; name: string; scientificName: string | null; category: string | null; createdAt: Date; updatedAt: Date }
export type UserCrop = { id: string; userId: string; cropId: string | null; name: string; customName: string | null; variety: string; stage: string; plantedAt: string | null; area: number | null; areaUnit: string | null; notes: string | null; health: number; nextTask: string; color: string; createdAt: Date; updatedAt: Date }

const catalogSelect = `SELECT id, name, scientific_name AS "scientificName", category, created_at AS "createdAt", updated_at AS "updatedAt" FROM crops`
const userCropSelect = `SELECT uc.id, uc.user_id AS "userId", uc.crop_id AS "cropId", COALESCE(c.name, uc.name) AS name, uc.custom_name AS "customName", uc.variety, uc.stage, uc.planted_at AS "plantedAt", uc.area, uc.area_unit AS "areaUnit", uc.notes, uc.health, uc.next_task AS "nextTask", uc.color, uc.created_at AS "createdAt", uc.updated_at AS "updatedAt" FROM user_crops uc LEFT JOIN crops c ON c.id = uc.crop_id`

export async function listCatalog(): Promise<CropCatalog[]> { return (await pool.query<CropCatalog>(`${catalogSelect} ORDER BY name ASC`)).rows }
export async function getCatalog(id: string): Promise<CropCatalog | undefined> { return (await pool.query<CropCatalog>(`${catalogSelect} WHERE id = $1`, [id])).rows[0] }
export async function listUserCrops(userId: string): Promise<UserCrop[]> { return (await pool.query<UserCrop>(`${userCropSelect} WHERE uc.user_id = $1 ORDER BY uc.created_at ASC`, [userId])).rows }
export async function getUserCropForUser(userId: string, id: string): Promise<UserCrop | undefined> { return (await pool.query<UserCrop>(`${userCropSelect} WHERE uc.id = $1 AND uc.user_id = $2`, [id, userId])).rows[0] }

export async function createUserCrop(userId: string, input: { cropId?: string; name?: string; customName?: string; plantedAt?: string; area?: number; areaUnit?: string; notes?: string; variety: string; stage: string; health: number; nextTask: string; color: string }): Promise<UserCrop | undefined> {
  if (input.cropId) {
    return (await pool.query<UserCrop>(`INSERT INTO user_crops (user_id, crop_id, name, custom_name, variety, stage, planted_at, area, area_unit, notes, health, next_task, color) SELECT $1, c.id, c.name, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 FROM crops c WHERE c.id = $12 RETURNING id, user_id AS "userId", crop_id AS "cropId", name, custom_name AS "customName", variety, stage, planted_at AS "plantedAt", area, area_unit AS "areaUnit", notes, health, next_task AS "nextTask", color, created_at AS "createdAt", updated_at AS "updatedAt"`, [userId, input.customName ?? null, input.variety, input.stage, input.plantedAt ?? null, input.area ?? null, input.areaUnit ?? null, input.notes ?? null, input.health, input.nextTask, input.color, input.cropId])).rows[0]
  }
  return (await pool.query<UserCrop>(`INSERT INTO user_crops (user_id, name, custom_name, variety, stage, planted_at, area, area_unit, notes, health, next_task, color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id, user_id AS "userId", crop_id AS "cropId", name, custom_name AS "customName", variety, stage, planted_at AS "plantedAt", area, area_unit AS "areaUnit", notes, health, next_task AS "nextTask", color, created_at AS "createdAt", updated_at AS "updatedAt"`, [userId, input.name, input.customName ?? null, input.variety, input.stage, input.plantedAt ?? null, input.area ?? null, input.areaUnit ?? null, input.notes ?? null, input.health, input.nextTask, input.color])).rows[0]
}

export async function updateUserCrop(userId: string, id: string, input: Record<string, unknown>): Promise<UserCrop | undefined> {
  const map: Record<string, string> = { cropId: 'crop_id', customName: 'custom_name', plantedAt: 'planted_at', area: 'area', areaUnit: 'area_unit', notes: 'notes', variety: 'variety', stage: 'stage', health: 'health', nextTask: 'next_task', color: 'color' }
  const entries = Object.entries(input).filter(([key, value]) => map[key] && value !== undefined)
  if (!entries.length) return undefined
  const values = entries.map(([, value]) => value)
  const sets = entries.map(([key], index) => `${map[key]} = $${index + 1}`)
  const idPosition = values.length + 1
  const userPosition = values.length + 2
  values.push(id, userId)
  return (await pool.query<UserCrop>(`UPDATE user_crops SET ${sets.join(', ')} WHERE id = $${idPosition} AND user_id = $${userPosition} RETURNING id, user_id AS "userId", crop_id AS "cropId", name, custom_name AS "customName", variety, stage, planted_at AS "plantedAt", area, area_unit AS "areaUnit", notes, health, next_task AS "nextTask", color, created_at AS "createdAt", updated_at AS "updatedAt"`, values)).rows[0]
}

export async function deleteUserCrop(userId: string, id: string): Promise<boolean> { return (await pool.query('DELETE FROM user_crops WHERE id = $1 AND user_id = $2', [id, userId])).rowCount === 1 }
