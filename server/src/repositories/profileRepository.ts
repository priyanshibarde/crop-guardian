import { pool } from '../db/pool.js'
import { withClient } from './authRepository.js'

export type Profile = { name: string; location: string; role: 'farmer' | 'home-grower'; onboardingCompleted: boolean; languageCode: string }
const profileSelect = `SELECT p.name, p.location, p.role, p.onboarding_completed AS "onboardingCompleted", COALESCE(pref.language_code, 'en') AS "languageCode" FROM user_profiles p LEFT JOIN user_preferences pref ON pref.user_id = p.user_id WHERE p.user_id = $1`

export async function getProfile(userId: string): Promise<Profile | undefined> {
  const result = await pool.query<Profile>(profileSelect, [userId])
  return result.rows[0]
}

export async function updateProfile(userId: string, values: Partial<{ name: string; location: string; role: string; onboardingCompleted: boolean; languageCode: string }>): Promise<Profile | undefined> {
  return withClient(async (client) => {
    await client.query('BEGIN')
    try {
      const fields: string[] = []
      const params: unknown[] = []
      const add = (column: string, value: unknown) => { params.push(value); fields.push(`${column} = $${params.length}`) }
      if (values.name !== undefined) add('name', values.name)
      if (values.location !== undefined) add('location', values.location)
      if (values.role !== undefined) add('role', values.role)
      if (values.onboardingCompleted !== undefined) add('onboarding_completed', values.onboardingCompleted)
      if (fields.length) { params.push(userId); await client.query(`UPDATE user_profiles SET ${fields.join(', ')} WHERE user_id = $${params.length}`, params) }
      if (values.languageCode !== undefined) await client.query('UPDATE user_preferences SET language_code = $1 WHERE user_id = $2', [values.languageCode, userId])
      await client.query('COMMIT')
      const result = await client.query<Profile>(profileSelect, [userId])
      return result.rows[0]
    } catch (error) { await client.query('ROLLBACK'); throw error }
  })
}
