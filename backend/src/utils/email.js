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
