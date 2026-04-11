// src/config/env.js — валідація змінних середовища
import { z } from 'zod';
import { config } from 'dotenv';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL є обов'язковим"),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET повинен мати мінімум 16 символів'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET повинен мати мінімум 16 символів'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_NAME: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Невалідні змінні середовища:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
