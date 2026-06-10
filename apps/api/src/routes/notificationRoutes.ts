import { Router } from 'express'
import { catchAsync } from '../utils/catchAsync'
import { requireAuth } from '../middleware/requireAuth'
import * as notificationController from '../controllers/notificationController'

const router = Router()

router.get('/', requireAuth, catchAsync(notificationController.list))
router.patch('/read-all', requireAuth, catchAsync(notificationController.markAllRead))
router.patch('/:id/read', requireAuth, catchAsync(notificationController.markRead))

export { router as notificationRoutes }