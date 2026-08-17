import { Router } from 'express'
import { deleteDiagnosis, getDiagnoses, getDiagnosis } from '../controllers/scanController.js'
import { requireAuth } from '../middleware/auth.js'

export const diagnosisRouter = Router()
diagnosisRouter.use(requireAuth)
diagnosisRouter.get('/', getDiagnoses)
diagnosisRouter.get('/:id', getDiagnosis)
diagnosisRouter.delete('/:id', deleteDiagnosis)
