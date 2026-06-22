import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { reviewController } from '../controllers/reviewController'

export const reviewRoutes = Router()

reviewRoutes.get('/mine', requireAuth, reviewController.listMine)
reviewRoutes.post('/', requireAuth, reviewController.create)