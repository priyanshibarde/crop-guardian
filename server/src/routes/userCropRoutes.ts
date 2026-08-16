import { Router } from 'express'
import { cropController } from '../controllers/index.js'
import { requireAuth } from '../middleware/auth.js'

export const userCropRouter = Router()
userCropRouter.use(requireAuth)
userCropRouter.get('/', cropController.getUserCrops)
userCropRouter.post('/', cropController.postUserCrop)
userCropRouter.get('/:id/diagnoses', cropController.getUserCropDiagnoses)
userCropRouter.get('/:id/timeline', cropController.getUserCropTimeline)
userCropRouter.get('/:id', cropController.getUserCropDetail)
userCropRouter.put('/:id', cropController.patchUserCrop)
userCropRouter.delete('/:id', cropController.removeUserCrop)
