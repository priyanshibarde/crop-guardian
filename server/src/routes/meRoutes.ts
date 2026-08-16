import { Router } from 'express'
import { cropController, petController, profileController } from '../controllers/index.js'
import { requireAuth } from '../middleware/auth.js'

export const meRouter = Router()
meRouter.use(requireAuth)
meRouter.get('/profile', profileController.getMeProfile)
meRouter.patch('/profile', profileController.patchMeProfile)
meRouter.get('/crops', cropController.getCropsForUser)
meRouter.post('/crops', cropController.postCrop)
meRouter.patch('/crops/:id', cropController.patchCrop)
meRouter.delete('/crops/:id', cropController.removeCrop)
meRouter.get('/pets', petController.getPets)
meRouter.post('/pets', petController.postPet)
meRouter.patch('/pets/:id', petController.patchPet)
meRouter.delete('/pets/:id', petController.removePet)
