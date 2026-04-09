// src/utils/otp.js
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from './password.js';

/**
 * Генерує OTP з 6 цифр
 */
export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Створює запис токена в БД (email або phone)
 * type: 'RESET_PASS' | 'BIND_PHONE' | 'CHANGE_PASS'
 * Тривалість життя за завданням: 10 хвилин
 */
export async function createVerificationToken(identifier, type, minutes = 10) {
  const code = generateOTP();
  const hashedCode = await hashPassword(code);
  const expiresAt = new Date(Date.now() + minutes * 60000);

  // Видаляємо всі попередні токени
  await prisma.verificationToken.deleteMany({
    where: { identifier, type },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      code: hashedCode,
      type,
      expiresAt,
    },
  });

  return code;
}

/**
 * Перевіряє токен
 * Повертає true, якщо дійсний і не прострочений.
 */
export async function verifyToken(identifier, code, type, keepAlive = false) {
  const token = await prisma.verificationToken.findFirst({
    where: { identifier, type },
    orderBy: { createdAt: 'desc' }
  });

  if (!token) return false;

  // Якщо прострочено
  if (token.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { id: token.id } });
    return false;
  }

  const isValid = await comparePassword(code, token.code);
  if (!isValid) return false;

  // Видалити після успішного використання, якщо не ввімкнено keepAlive
  if (!keepAlive) {
    await prisma.verificationToken.delete({ where: { id: token.id } });
  }
  return true;
}
