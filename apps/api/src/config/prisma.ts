// Import env first to ensure .env file is loaded and DATABASE_URL is in process.env
import './env'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma'

// Use Prisma's Postgres driver adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })


