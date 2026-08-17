import { Router } from 'express'
import multer from 'multer'
import { env } from '../config/env.js'
import { requireAuth } from '../middleware/auth.js'
import { createScan, deleteScan, getScan } from '../controllers/scanController.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes, files: 1 },
})

export const scanRouter = Router()
scanRouter.use(requireAuth)
scanRouter.post('/', upload.single('image'), createScan)
scanRouter.get('/:id', getScan)
scanRouter.delete('/:id', deleteScan)
