// src/modules/appeals/appeals.schema.js
import { z } from 'zod';

export const createAppealSchema = z.object({
  title: z.string().min(5, 'Тема повинна мати мінімум 5 символів').max(200),
  description: z.string().min(20, 'Опис повинен мати мінімум 20 символів'),
  specialtyId: z.string().min(1, 'Спеціальність обов\'язкова'),
  doctorId: z.string().nullable().optional(),
  appointmentDate: z.string().optional().transform(v => v ? new Date(v) : undefined),
  appointmentTime: z.string().optional(),
});

export const updateAppealSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).optional(),
  specialtyId: z.string().optional(),
  doctorId: z.string().nullable().optional(),
  appointmentDate: z.string().optional().transform(v => v ? new Date(v) : undefined),
  appointmentTime: z.string().optional(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'DONE', 'REJECTED']).optional(),
});
