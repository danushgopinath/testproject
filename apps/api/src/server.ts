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
import { sessionRoutes } from './routes/sessionRoutes'
import { messageRoutes } from './routes/messageRoutes'
import { userRoutes } from './routes/userRoutes'
import { notificationRoutes } from './routes/notificationRoutes'

const app = express()

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
)
app.use(express.json({ limit: '20mb' }))
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/guides', guideRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/onboarding', onboardingRoutes)
app.use('/api/v1/sessions', sessionRoutes)
app.use('/api/v1/messages', messageRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/notifications', notificationRoutes)

app.use(errorHandler)

const port = Number(env.PORT)

app.listen(port, () => {
  logger.info(`API listening on port ${port}`)
})

