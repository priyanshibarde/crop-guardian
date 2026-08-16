import type { NextFunction, Request, Response } from 'express'

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  if (process.env.NODE_ENV !== 'production') {
    const startedAt = Date.now()
    response.on('finish', () => {
      const elapsed = Date.now() - startedAt
      console.info(`[api] ${request.method} ${request.originalUrl} ${response.statusCode} ${elapsed}ms`)
    })
  }
  next()
}
