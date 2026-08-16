import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/requestLogger.js'
import { healthRouter } from './routes/healthRoutes.js'
import { authRouter } from './routes/authRoutes.js'
import { meRouter } from './routes/meRoutes.js'
import { profileRouter } from './routes/profileRoutes.js'
import { cropRouter } from './routes/cropRoutes.js'
import { userCropRouter } from './routes/userCropRoutes.js'

export const app = express()

app.disable('x-powered-by')
app.use(cors({ origin: env.clientOrigins }))
app.use(express.json({ limit: '1mb' }))
app.use(requestLogger)

app.use('/api', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/profile', profileRouter)
app.use('/api/crops', cropRouter)
app.use('/api/user-crops', userCropRouter)
app.use('/api/me', meRouter)

app.use((_request, response) => {
  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found.',
    },
  })
})

app.use(errorHandler)
