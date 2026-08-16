import { Router } from 'express'
import { cropController } from '../controllers/index.js'
import { requireAuth } from '../middleware/auth.js'

export const userCropRouter = Router()
userCropRouter.use(requireAuth)
userCropRouter.get('/', cropController.getUserCrops)
userCropRouter.post('/', cropController.postUserCrop)
userCropRouter.put('/:id', cropController.patchUserCrop)
userCropRouter.delete('/:id', cropController.removeUserCrop)
