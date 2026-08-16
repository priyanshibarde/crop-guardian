import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { closePool, pool } from './pool.js'

const migrationsDirectory = join(dirname(fileURLToPath(import.meta.url)), 'migrations')

async function migrate(): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())')
    const applied = new Set((await client.query<{ filename: string }>('SELECT filename FROM schema_migrations')).rows.map((row) => row.filename))
    const files = (await readdir(migrationsDirectory)).filter((file) => file.endsWith('.sql')).sort()
    for (const filename of files) {
      if (applied.has(filename)) continue
      await client.query(await readFile(join(migrationsDirectory, filename), 'utf8'))
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename])
      console.info(`[db] applied ${filename}`)
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await closePool()
  }
}

migrate().catch((error) => {
  console.error('[db] migration failed', error)
  process.exitCode = 1
})
