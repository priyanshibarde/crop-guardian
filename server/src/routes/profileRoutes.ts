import { Router } from 'express'
import { profileController } from '../controllers/index.js'
import { requireAuth } from '../middleware/auth.js'

export const profileRouter = Router()
profileRouter.use(requireAuth)
profileRouter.get('/', profileController.getMeProfile)
profileRouter.put('/', profileController.updateProfile)
