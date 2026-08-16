import type { PoolClient } from 'pg'
import { pool } from '../db/pool.js'

export type UserRow = { id: string; email: string; password_hash: string }
export type ProfileRow = { full_name: string; name?: string; location: string; phone: string | null; profile_image_url: string | null; role: 'farmer' | 'home-grower'; onboarding_completed: boolean; language: string }

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const result = await pool.query<UserRow>('SELECT id, email, password_hash FROM users WHERE LOWER(email) = LOWER($1)', [email])
  return result.rows[0]
}

export async function findUserById(id: string): Promise<Pick<UserRow, 'id' | 'email'> | undefined> {
  const result = await pool.query<Pick<UserRow, 'id' | 'email'>>('SELECT id, email FROM users WHERE id = $1', [id])
  return result.rows[0]
}

export async function createUser(input: { email: string; passwordHash: string; fullName: string; location: string; phone?: string; role: string; languageCode: string }): Promise<{ user: Pick<UserRow, 'id' | 'email'>; profile: ProfileRow }> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const userResult = await client.query<Pick<UserRow, 'id' | 'email'>>('INSERT INTO users (email, password_hash) VALUES (LOWER($1), $2) RETURNING id, email', [input.email, input.passwordHash])
    const user = userResult.rows[0]
    const profileResult = await client.query<ProfileRow>(`INSERT INTO user_profiles (user_id, full_name, location, phone, language, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING full_name, location, phone, profile_image_url, language, role, onboarding_completed`, [user.id, input.fullName, input.location, input.phone ?? null, input.languageCode, input.role])
    await client.query('INSERT INTO user_preferences (user_id, language_code) VALUES ($1, $2)', [user.id, input.languageCode])
    await client.query('COMMIT')
    return { user, profile: profileResult.rows[0] }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function createSession(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
  await pool.query('INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [userId, tokenHash, expiresAt])
}

export async function findUserBySessionHash(tokenHash: string): Promise<Pick<UserRow, 'id' | 'email'> | undefined> {
  const result = await pool.query<Pick<UserRow, 'id' | 'email'>>(`SELECT users.id, users.email FROM auth_sessions JOIN users ON users.id = auth_sessions.user_id WHERE auth_sessions.token_hash = $1 AND auth_sessions.expires_at > NOW()`, [tokenHash])
  return result.rows[0]
}

export async function deleteSession(tokenHash: string): Promise<void> {
  await pool.query('DELETE FROM auth_sessions WHERE token_hash = $1', [tokenHash])
}

export async function withClient<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try { return await callback(client) } finally { client.release() }
}
