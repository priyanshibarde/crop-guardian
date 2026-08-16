import pg from 'pg'
import { env } from '../config/env.js'

const { Pool } = pg
// Keep server startup and /api/health available for non-database checks.
// Database-backed routes require DATABASE_URL to be configured before use.
export const pool = new Pool({ connectionString: env.databaseUrl })

export async function closePool(): Promise<void> {
  await pool.end()
}
