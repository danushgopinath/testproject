import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { env } from './config/env'
import { logger } from './config/logger'
import { errorHandler } from './middleware/errorHandler'
import { authRoutes } from './routes/authRoutes'
import { guideRoutes } from './routes/guideRoutes'
import { dashboardRoutes } from './routes/dashboardRoutes'
import { onboardingRoutes } from './routes/onboardingRoutes'

const app = express()

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/guides', guideRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/onboarding', onboardingRoutes)

app.use(errorHandler)

const port = Number(env.PORT)

app.listen(port, () => {
  logger.info(`API listening on port ${port}`)
})

