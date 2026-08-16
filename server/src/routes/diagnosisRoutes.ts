import { Router } from 'express'
import { getDiagnoses, getDiagnosis } from '../controllers/scanController.js'
import { requireAuth } from '../middleware/auth.js'

export const diagnosisRouter = Router()
diagnosisRouter.use(requireAuth)
diagnosisRouter.get('/', getDiagnoses)
diagnosisRouter.get('/:id', getDiagnosis)
