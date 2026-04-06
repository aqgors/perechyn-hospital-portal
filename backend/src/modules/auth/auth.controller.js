// src/modules/auth/auth.controller.js
import { prisma } from '../../config/database.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { env } from '../../config/env.js';

export async function register(request, reply) {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ statusCode: 400, error: 'Validation Error', message: parsed.error.errors[0].message });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return reply.code(409).send({ statusCode: 409, error: 'Conflict', message: 'Користувач із таким email вже існує' });
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: 'USER' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const accessToken = request.server.jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name });
  const refreshToken = request.server.jwt.sign(
    { id: user.id, type: 'refresh' },
    { secret: env.JWT_REFRESH_SECRET, expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

  await prisma.log.create({ data: { action: 'REGISTER', userId: user.id } });

  return reply.code(201).send({ user, accessToken, refreshToken });
}

export async function login(request, reply) {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ statusCode: 400, error: 'Validation Error', message: parsed.error.errors[0].message });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Неправильний email або пароль' });
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    return reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Неправильний email або пароль' });
  }

  const accessToken = request.server.jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name });
  const refreshToken = request.server.jwt.sign(
    { id: user.id, type: 'refresh' },
    { secret: env.JWT_REFRESH_SECRET, expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

  await prisma.log.create({ data: { action: 'LOGIN', userId: user.id } });

  const { password: _, ...userWithoutPassword } = user;
  return reply.send({ user: userWithoutPassword, accessToken, refreshToken });
}

export async function refresh(request, reply) {
  const { refreshToken } = request.body;
  try {
    const payload = request.server.jwt.verify(refreshToken, { secret: env.JWT_REFRESH_SECRET });
    if (payload.type !== 'refresh') throw new Error('Неправильний тип');

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, name: true },
    });
    if (!user) return reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Користувача не знайдено' });

    const accessToken = request.server.jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name });
    return reply.send({ accessToken });
  } catch {
    return reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Невалідний refresh token' });
  }
}

export async function logout(request, reply) {
  await prisma.log.create({ data: { action: 'LOGOUT', userId: request.user.id } });
  return reply.send({ message: 'Вихід виконано успішно' });
}
