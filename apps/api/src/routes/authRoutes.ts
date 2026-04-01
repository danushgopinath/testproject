import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import * as authController from '../controllers/authController'
import { catchAsync } from '../utils/catchAsync'

const router = Router()

// 10 attempts per 15 minutes per IP for sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later.' },
})

// Refresh can be called more freely (page loads, tab switches)
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
})

router.post('/register', authLimiter, catchAsync(authController.register))
router.post('/login', authLimiter, catchAsync(authController.login))
router.post('/google', authLimiter, catchAsync(authController.googleAuth))
router.post('/linkedin', authLimiter, catchAsync(authController.linkedinAuth))
router.get('/me', catchAsync(authController.me))
router.post('/refresh', refreshLimiter, catchAsync(authController.refresh))
router.post('/logout', catchAsync(authController.logout))

export { router as authRoutes }
