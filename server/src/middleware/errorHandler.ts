import type { ErrorRequestHandler } from 'express'
import multer from 'multer'

export class AppError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
  }
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.status).json({ error: { code: error.code, message: error.message } })
    return
  }
  if (error && typeof error === 'object' && 'type' in error && error.type === 'entity.parse.failed') {
    response.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON.' } })
    return
  }
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'The uploaded image is too large.' : 'The uploaded image could not be processed.'
    response.status(400).json({ error: { code: error.code, message } })
    return
  }
  console.error('[api] unhandled error', error)
  response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected server error occurred.',
    },
  })
}
