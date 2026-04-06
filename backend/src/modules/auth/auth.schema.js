// src/modules/auth/auth.schema.js
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Ім\'я повинно мати мінімум 2 символи').max(100),
  email: z.string().email('Неправильний формат email'),
  password: z
    .string()
    .min(8, 'Пароль повинен мати мінімум 8 символів')
    .regex(/[A-Z]/, 'Пароль повинен містити хоча б одну велику літеру')
    .regex(/[0-9]/, 'Пароль повинен містити хоча б одну цифру'),
});

export const loginSchema = z.object({
  email: z.string().email('Неправильний формат email'),
  password: z.string().min(1, 'Пароль є обов\'язковим'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
