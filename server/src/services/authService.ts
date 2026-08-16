import { randomBytes, createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { AppError } from '../middleware/errorHandler.js'
import { createSession, createUser, deleteSession, findUserByEmail, findUserBySessionHash } from '../repositories/authRepository.js'

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')
const normalizeEmail = (email: string) => email.trim().toLowerCase()

export async function register(input: { email:string; password:string; name:string; location:string; role:'farmer'|'home-grower'; languageCode:string }) {
  const passwordHash = await bcrypt.hash(input.password, 12)
  try {
    const result = await createUser({ ...input, email: normalizeEmail(input.email), passwordHash })
    const token = await issueSession(result.user.id)
    return { token, user: result.user, profile: result.profile }
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') throw new AppError(409, 'EMAIL_ALREADY_REGISTERED', 'An account with this email already exists.')
    throw error
  }
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(normalizeEmail(email))
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
  return { token: await issueSession(user.id), user: { id: user.id, email: user.email } }
}

export async function issueSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + env.sessionTtlDays * 24 * 60 * 60 * 1000)
  await createSession(userId, hashToken(token), expiresAt)
  return token
}

export async function authenticateToken(token: string) {
  return findUserBySessionHash(hashToken(token))
}

export async function revokeToken(token: string): Promise<void> {
  await deleteSession(hashToken(token))
}
