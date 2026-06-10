import { Router } from 'express'
import { catchAsync } from '../utils/catchAsync'
import { requireAuth } from '../middleware/requireAuth'
import * as onboardingController from '../controllers/onboardingController'

const router = Router()

// All routes require authentication
router.post('/', requireAuth, catchAsync(onboardingController.submitOnboarding))
router.get('/me', requireAuth, catchAsync(onboardingController.getMyProfile))
router.get('/status', requireAuth, catchAsync(onboardingController.getOnboardingStatus))
router.patch('/availability', requireAuth, catchAsync(onboardingController.updateAvailability))

export { router as onboardingRoutes }