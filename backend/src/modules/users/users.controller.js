// src/modules/users/users.controller.js
import { prisma } from '../../config/database.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { updateProfileSchema, changePasswordSchema } from './users.schema.js';

export async function getMe(request, reply) {
  const user = await prisma.user.findUnique({
    where: { id: request.user.id },
    // Поле isActive видалено, оскільки воно відсутнє у схемі Prisma User
    select: { 
      id: true, 
      name: true, 
      email: true, 
      phone: true, 
      role: true, 
      createdAt: true, 
      updatedAt: true,
      specialtyId: true,
      photoUrl: true,
      bioUA: true,
      bioEN: true
    },
  });
  if (!user) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Користувача не знайдено' });
  return reply.send(user);
}

export async function updateMe(request, reply) {
  const parsed = updateProfileSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ statusCode: 400, error: 'Validation Error', message: parsed.error.errors[0].message });
  }

  const user = await prisma.user.update({
    where: { id: request.user.id },
    data: parsed.data,
    select: { 
      id: true, 
      name: true, 
      email: true, 
      phone: true, 
      role: true, 
      updatedAt: true,
      specialtyId: true,
      photoUrl: true,
      bioUA: true,
      bioEN: true
    },
  });
  return reply.send(user);
}

export async function changePassword(request, reply) {
  const parsed = changePasswordSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ statusCode: 400, error: 'Validation Error', message: parsed.error.errors[0].message });
  }

  const { currentPassword, newPassword } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: request.user.id } });

  const isValid = await comparePassword(currentPassword, user.password);
  if (!isValid) {
    return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: 'Поточний пароль неправильний' });
  }

  await prisma.user.update({
    where: { id: request.user.id },
    data: { password: await hashPassword(newPassword) },
  });

  return reply.send({ message: 'Пароль успішно змінено' });
}
