// src/modules/auth/auth.controller.js
import { prisma } from '../../config/database.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { env } from '../../config/env.js';
import { sendResetCode } from '../../utils/email.js';

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

export async function forgotPassword(request, reply) {
  try {
    const { identifier } = request.body;
    
    if (!identifier) {
      return reply.code(400).send({ message: "Електронна пошта є обов'язковою" });
    }

    const email = identifier.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return 200 to avoid email enumeration
    if (!user) return reply.send({ message: 'Якщо такий email існує, на нього надіслано код' });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await prisma.passwordReset.create({ data: { email, code, expiresAt } });
    await sendResetCode(email, code);

    return reply.send({ message: 'Код відправлено на email' });
  } catch (error) {
    console.error('[FORGOT_PASSWORD_ERROR]:', error);
    return reply.code(500).send({ message: 'Помилка при надсиланні коду' });
  }
}

export async function verifyCode(request, reply) {
  try {
    const { identifier: email, code } = request.body;

    const record = await prisma.passwordReset.findFirst({
      where: { email, code, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return reply.code(400).send({ message: 'Код невірний або прострочений' });
    }

    return reply.send({ message: 'Код валідний' });
  } catch (error) {
    console.error('[VERIFY_CODE_ERROR]:', error);
    return reply.code(500).send({ message: 'Помилка верифікації коду' });
  }
}

export async function resetPassword(request, reply) {
  try {
    const { identifier: email, code, newPassword } = request.body;

    const record = await prisma.passwordReset.findFirst({
      where: { email, code, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return reply.code(400).send({ message: 'Код невірний або прострочений' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({ where: { email }, data: { password: hashedPassword } });
    await prisma.passwordReset.update({ where: { id: record.id }, data: { used: true } });

    return reply.send({ message: 'Пароль успішно змінено' });
  } catch (error) {
    console.error('[RESET_PASSWORD_ERROR]:', error);
    return reply.code(500).send({ message: 'Помилка при зміні паролю' });
  }
}
