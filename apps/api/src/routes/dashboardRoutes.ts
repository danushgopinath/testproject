import { Router } from 'express'
import { catchAsync } from '../utils/catchAsync'
import { requireAuth } from '../middleware/requireAuth'
import * as dashboardController from '../controllers/dashboardController'

const router = Router()

router.get('/seeker', requireAuth, catchAsync(dashboardController.getSeekerDashboard))
router.get('/guide', requireAuth, catchAsync(dashboardController.getGuideDashboard))

export { router as dashboardRoutes }

