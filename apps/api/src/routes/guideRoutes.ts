import { Router } from 'express'
import * as guideController from '../controllers/guideController'
import { catchAsync } from '../utils/catchAsync'

const router = Router()

router.get('/', catchAsync(guideController.listGuides))
router.get('/:id', catchAsync(guideController.getGuide))

export { router as guideRoutes }

