import 'dotenv/config'
import { join } from 'node:path'

function positivePort(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 && parsed < 65536 ? parsed : fallback
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: positivePort(process.env.PORT, 4000),
  clientOrigins: (process.env.CLIENT_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL,
  sessionTtlDays: positivePort(process.env.SESSION_TTL_DAYS, 30),
  uploadDirectory: process.env.UPLOAD_DIRECTORY || join(process.cwd(), 'uploads'),
  maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES) > 0 ? Number(process.env.MAX_UPLOAD_BYTES) : 10 * 1024 * 1024,
  inferenceServiceUrl: (process.env.INFERENCE_SERVICE_URL ?? 'http://127.0.0.1:5001').replace(/\/$/, ''),
  modelName: process.env.MODEL_NAME ?? 'plant-disease-mobilenetv2',
  modelVersion: process.env.MODEL_VERSION ?? 'unverified',
}

export function requireDatabaseUrl(): string {
  if (!env.databaseUrl) throw new Error('DATABASE_URL is not configured.')
  return env.databaseUrl
}
