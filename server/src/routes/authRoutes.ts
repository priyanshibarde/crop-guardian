import { Router } from 'express'
import { authController } from '../controllers/index.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()
authRouter.post('/register', authController.registerController)
authRouter.post('/login', authController.loginController)
authRouter.post('/logout', requireAuth, authController.logoutController)
authRouter.get('/me', requireAuth, authController.meController)
authRouter.delete('/account', requireAuth, authController.deleteAccountController)
