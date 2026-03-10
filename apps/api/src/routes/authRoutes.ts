import { Router } from 'express'
import * as authController from '../controllers/authController'
import { catchAsync } from '../utils/catchAsync'

const router = Router()

router.post('/register', catchAsync(authController.register))
router.post('/login', catchAsync(authController.login))
router.post('/google', catchAsync(authController.googleAuth))
router.post('/linkedin', catchAsync(authController.linkedinAuth))
router.get('/me', catchAsync(authController.me))
router.post('/refresh', catchAsync(authController.refresh))
router.post('/logout', catchAsync(authController.logout))

export { router as authRoutes }
