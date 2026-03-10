import type { Request, Response } from 'express'
import { guideService } from '../services/guideService'

export async function listGuides(req: Request, res: Response) {
  const result = await guideService.listPublicGuides(req.query)
  res.json(result)
}

export async function getGuide(req: Request, res: Response) {
  const result = await guideService.getPublicGuide(req.params.id)
  res.json(result)
}

