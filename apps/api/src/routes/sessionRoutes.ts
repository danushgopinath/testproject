import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { sessionController } from '../controllers/sessionController'

export const sessionRoutes = Router()

sessionRoutes.post('/', requireAuth, sessionController.create)
sessionRoutes.patch('/:id/accept', requireAuth, sessionController.accept)
sessionRoutes.patch('/:id/decline', requireAuth, sessionController.decline)
sessionRoutes.post('/:id/join', requireAuth, sessionController.join)