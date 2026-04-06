// src/modules/users/users.schema.js
import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+380\d{9}$/, 'Неправильний формат (+380XXXXXXXXX)').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Пароль повинен містити велику літеру')
    .regex(/[0-9]/, 'Пароль повинен містити цифру'),
});
