import { Router } from 'express'
import { catchAsync } from '../utils/catchAsync'
import { requireAuth } from '../middleware/requireAuth'
import * as messageController from '../controllers/messageController'

const router = Router()

router.get('/conversations', requireAuth, catchAsync(messageController.getConversations))
router.get('/conversations/:otherId', requireAuth, catchAsync(messageController.getThread))
router.post('/', requireAuth, catchAsync(messageController.sendMessage))

export { router as messageRoutes }