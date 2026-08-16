import { pool } from '../db/pool.js'
import { withClient } from './authRepository.js'

export type Profile = { fullName: string; name: string; location: string; phone: string | null; profileImageUrl: string | null; role: 'farmer' | 'home-grower'; onboardingCompleted: boolean; language: string; languageCode: string }
const profileSelect = `SELECT p.full_name AS "fullName", p.full_name AS name, p.location, p.phone, p.profile_image_url AS "profileImageUrl", p.role, p.onboarding_completed AS "onboardingCompleted", p.language, p.language AS "languageCode" FROM user_profiles p WHERE p.user_id = $1`

export async function getProfile(userId: string): Promise<Profile | undefined> {
  const result = await pool.query<Profile>(profileSelect, [userId])
  return result.rows[0]
}

export async function updateProfile(userId: string, values: Partial<{ fullName: string; name: string; location: string; phone: string | null; profileImageUrl: string | null; role: string; onboardingCompleted: boolean; language: string; languageCode: string }>): Promise<Profile | undefined> {
  return withClient(async (client) => {
    await client.query('BEGIN')
    try {
      const fields: string[] = []
      const params: unknown[] = []
      const add = (column: string, value: unknown) => { params.push(value); fields.push(`${column} = $${params.length}`) }
      if (values.fullName !== undefined) add('full_name', values.fullName)
      else if (values.name !== undefined) add('full_name', values.name)
      if (values.location !== undefined) add('location', values.location)
      if (values.phone !== undefined) add('phone', values.phone)
      if (values.profileImageUrl !== undefined) add('profile_image_url', values.profileImageUrl)
      if (values.role !== undefined) add('role', values.role)
      if (values.onboardingCompleted !== undefined) add('onboarding_completed', values.onboardingCompleted)
      if (fields.length) { params.push(userId); await client.query(`UPDATE user_profiles SET ${fields.join(', ')} WHERE user_id = $${params.length}`, params) }
      const language = values.language ?? values.languageCode
      if (language !== undefined) {
        await client.query('UPDATE user_profiles SET language = $1 WHERE user_id = $2', [language, userId])
        await client.query('UPDATE user_preferences SET language_code = $1 WHERE user_id = $2', [language, userId])
      }
      await client.query('COMMIT')
      const result = await client.query<Profile>(profileSelect, [userId])
      return result.rows[0]
    } catch (error) { await client.query('ROLLBACK'); throw error }
  })
}
