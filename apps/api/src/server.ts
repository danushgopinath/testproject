import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
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
import { reviewRoutes } from './routes/reviewRoutes'

const app = express()

app.set('trust proxy', 1) // behind Railway/Vercel proxy — needed for correct client IPs (rate limiting)
app.use(helmet())
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
)
app.use(express.json({ limit: '20mb' }))
app.use(cookieParser())
app.use(morgan('dev'))

// Global rate limit — defense-in-depth across the whole API. Sensitive auth
// endpoints have their own tighter limiters in authRoutes.
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests, please slow down.' },
  }),
)

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
app.use('/api/v1/reviews', reviewRoutes)

app.use(errorHandler)

const port = Number(env.PORT)

app.listen(port, () => {
  logger.info(`API listening on port ${port}`)
})

