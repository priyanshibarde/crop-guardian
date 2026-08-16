import { Router } from 'express'
import { cropController } from '../controllers/index.js'

export const cropRouter = Router()
cropRouter.get('/', cropController.getCrops)
cropRouter.get('/:id', cropController.getCrop)
