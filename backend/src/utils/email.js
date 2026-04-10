// src/utils/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a password reset code to the user's email.
 * @param {string} to
 * @param {string} code
 */
export async function sendResetCode(to, code) {
  await transporter.sendMail({
    from: `"Перечинська ЦРЛ" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Відновлення паролю — Перечинська ЦРЛ',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #1565C0; margin-bottom: 8px;">🏥 Перечинська ЦРЛ</h2>
        <p style="color: #555; margin-bottom: 24px;">Ви запросили відновлення паролю.</p>
        <div style="background: #E3F2FD; border-radius: 8px; padding: 16px 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #1565C0; margin: 0 0 8px;">Ваш код підтвердження:</p>
          <p style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0D47A1; margin: 0;">${code}</p>
        </div>
        <p style="color: #777; font-size: 13px;">Код дійсний протягом <strong>15 хвилин</strong>.</p>
        <p style="color: #777; font-size: 13px;">Якщо ви не робили цього запиту — проігноруйте цей лист.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 11px; text-align: center;">© 2025 Перечинська центральна районна лікарня</p>
      </div>
    `,
  });
}

const STATUS_LABELS_UA = {
  NEW: 'Нове',
  IN_PROGRESS: 'В обробці / Очікує прийому',
  DONE: 'Виконане / Прийнято',
  REJECTED: 'Відхилене / Скасоване',
};

/**
 * Send appeal status update notification to the patient.
 * @param {string} to  – patient email
 * @param {{ title: string, status: string, doctorComment?: string, user: { name: string } }} appeal
 */
export async function sendAppealStatusEmail(to, appeal) {
  const statusLabel = STATUS_LABELS_UA[appeal.status] ?? appeal.status;
  const now = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv', dateStyle: 'long', timeStyle: 'short' });

  const statusColors = {
    DONE: '#2E7D32',
    REJECTED: '#c62828',
    IN_PROGRESS: '#E65100',
    NEW: '#1565C0',
  };
  const statusColor = statusColors[appeal.status] ?? '#1565C0';

  const commentSection = appeal.doctorComment
    ? `
      <div style="background: #E3F2FD; border-left: 4px solid #1565C0; border-radius: 4px; padding: 14px 18px; margin: 20px 0;">
        <p style="color: #1565C0; font-size: 12px; font-weight: 700; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.5px;">Відповідь / Висновок лікаря:</p>
        <p style="color: #333; margin: 0; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${appeal.doctorComment}</p>
      </div>`
    : '';

  await transporter.sendMail({
    from: `"Перечинська ЦРЛ" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Оновлення вашого звернення — ${appeal.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #1565C0; margin: 0 0 4px;">🏥 Перечинська ЦРЛ</h2>
        <p style="color: #888; font-size: 13px; margin: 0 0 24px;">Вебпортал пацієнта</p>

        <p style="color: #333; font-size: 15px;">Шановний(а) <strong>${appeal.user?.name ?? 'Пацієнт'}</strong>,</p>
        <p style="color: #555; font-size: 14px; margin-top: 0;">Статус вашого звернення було оновлено черговим лікарем.</p>

        <div style="background: #f5f5f5; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #777;">Тема звернення</p>
          <p style="margin: 0; font-size: 16px; font-weight: 700; color: #111;">${appeal.title}</p>
        </div>

        <div style="display: inline-block; background: ${statusColor}; color: #fff; border-radius: 20px; padding: 6px 18px; font-size: 14px; font-weight: 700; margin-bottom: 8px;">
          ${statusLabel}
        </div>

        ${commentSection}

        <p style="color: #777; font-size: 12px; margin-top: 24px;">Дата оновлення: ${now}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #aaa; font-size: 11px; text-align: center; margin: 0;">© 2025 Перечинська центральна районна лікарня · Автоматичне повідомлення — не відповідайте на цей лист.</p>
      </div>
    `,
  });
}

