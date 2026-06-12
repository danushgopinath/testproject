import { Router } from 'express'
import { catchAsync } from '../utils/catchAsync'
import { requireAuth } from '../middleware/requireAuth'
import * as userController from '../controllers/userController'

const router = Router()

router.get('/me/settings', requireAuth, catchAsync(userController.getSettings))
router.patch('/me', requireAuth, catchAsync(userController.updateProfile))
router.patch('/me/password', requireAuth, catchAsync(userController.changePassword))
router.patch('/me/notifications', requireAuth, catchAsync(userController.updateNotifications))
router.patch('/me/privacy', requireAuth, catchAsync(userController.updatePrivacy))
router.delete('/me', requireAuth, catchAsync(userController.deleteAccount))
router.post('/me/avatar', requireAuth, catchAsync(userController.uploadAvatar))

export { router as userRoutes }