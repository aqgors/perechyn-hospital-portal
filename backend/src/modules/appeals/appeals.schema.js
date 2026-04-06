// src/modules/appeals/appeals.schema.js
import { z } from 'zod';

export const createAppealSchema = z.object({
  title: z.string().min(5, 'Тема повинна мати мінімум 5 символів').max(200),
  description: z.string().min(10, 'Опис повинен мати мінімум 10 символів'),
});

export const updateAppealSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).optional(),
});
