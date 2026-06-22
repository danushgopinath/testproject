import { Router } from 'express'
import { catchAsync } from '../utils/catchAsync'
import { requireAuth } from '../middleware/requireAuth'
import * as dashboardController from '../controllers/dashboardController'

const router = Router()

router.get('/me/profile', requireAuth, catchAsync(dashboardController.getMyProfile))
router.get('/notifications', requireAuth, catchAsync(dashboardController.getNotifications))
router.get('/seeker', requireAuth, catchAsync(dashboardController.getSeekerDashboard))
router.get('/seeker/sessions', requireAuth, catchAsync(dashboardController.getSeekerSessions))
router.get('/seeker/analytics', requireAuth, catchAsync(dashboardController.getSeekerAnalytics))
router.get('/guide', requireAuth, catchAsync(dashboardController.getGuideDashboard))
router.get('/guide/sessions', requireAuth, catchAsync(dashboardController.getGuideSessions))
router.get('/guide/pending-requests', requireAuth, catchAsync(dashboardController.getGuidePendingRequests))
router.get('/guide/analytics', requireAuth, catchAsync(dashboardController.getGuideAnalytics))

export { router as dashboardRoutes }

