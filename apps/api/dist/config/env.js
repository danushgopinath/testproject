"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const fs_1 = require("fs");
const zod_1 = require("zod");
// Load .env file from apps/api directory
// Try relative to source file first, then fallback to process.cwd()
const envPathRelative = (0, path_1.join)(__dirname, '../../.env');
const envPathCwd = (0, path_1.join)(process.cwd(), '.env');
const envPath = (0, fs_1.existsSync)(envPathRelative) ? envPathRelative : envPathCwd;
(0, dotenv_1.config)({ path: envPath });
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.string().default('4000'),
    DATABASE_URL: zod_1.z.string().url(),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    SMTP_HOST: zod_1.z.string(),
    SMTP_PORT: zod_1.z.string(),
    SMTP_USER: zod_1.z.string(),
    SMTP_PASS: zod_1.z.string(),
    SMTP_FROM_EMAIL: zod_1.z.string().email(),
    CORS_ORIGIN: zod_1.z.string(),
    // OAuth — optional so existing setups don't break
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    LINKEDIN_CLIENT_ID: zod_1.z.string().optional(),
    LINKEDIN_CLIENT_SECRET: zod_1.z.string().optional(),
    LINKEDIN_REDIRECT_URI: zod_1.z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map