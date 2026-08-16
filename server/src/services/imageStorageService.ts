import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { env } from '../config/env.js'

const extensionByMimeType: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export async function storeImage(buffer: Buffer, mimeType: string): Promise<string> {
  const extension = extensionByMimeType[mimeType]
  if (!extension) throw new Error('Unsupported image type.')
  await mkdir(env.uploadDirectory, { recursive: true })
  const storageKey = `${randomUUID()}${extension}`
  await writeFile(join(env.uploadDirectory, storageKey), buffer, { flag: 'wx' })
  return storageKey
}

export const imageStorage = { storeImage }
