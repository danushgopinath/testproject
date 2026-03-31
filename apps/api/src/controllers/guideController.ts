import type { Request, Response } from 'express'
import { guideService } from '../services/guideService'
import { AppError } from '../utils/errors'

export async function listGuides(req: Request, res: Response) {
  const result = await guideService.listPublicGuides(req.query)
  res.json(result)
}

export async function getGuide(req: Request, res: Response) {
  const id = req.params.id
  if (!id || Array.isArray(id)) {
    throw new AppError('Invalid guide ID', 400)
  }
  const result = await guideService.getPublicGuide(id)
  res.json(result)
}

