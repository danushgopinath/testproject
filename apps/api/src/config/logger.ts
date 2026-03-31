import winston from 'winston'

const { combine, timestamp, json, colorize, printf } = winston.format

const devFormat = combine(
  colorize(),
  timestamp(),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    return `${ts} ${level}: ${message}${metaString}`
  }),
)

export const logger = winston.createLogger({
  level: 'info',
  format: process.env.NODE_ENV === 'production' ? combine(timestamp(), json()) : devFormat,
  transports: [new winston.transports.Console()],
})

