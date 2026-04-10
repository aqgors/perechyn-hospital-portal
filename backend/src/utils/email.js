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
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
            <div style="display: inline-block; padding: 12px; background-color: #eff6ff; border-radius: 12px; margin-bottom: 16px;">
              <span style="font-size: 32px;">🏥</span>
            </div>
            <h2 style="margin: 0; color: #1e293b; font-size: 20px; font-weight: 700;">Перечинська ЦРЛ</h2>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Офіційний вебпортал</p>
          </div>
          
          <div style="padding: 32px;">
            <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 18px; font-weight: 600; text-align: center;">Відновлення доступу</h3>
            <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.5; text-align: center;">Ви запросили зміну пароля. Будь ласка, використайте код нижче для підтвердження процедури.</p>
            
            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; border: 1px dashed #cbd5e1;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Ваш секретний код</p>
              <p style="margin: 0; color: #2563eb; font-size: 42px; font-weight: 800; letter-spacing: 12px; font-family: Monaco, Consolas, 'Courier New', monospace;">${code}</p>
            </div>
            
            <div style="margin-top: 24px; display: flex; align-items: center; justify-content: center; gap: 8px;">
               <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">Код буде дійсним протягом <strong>15 хвилин</strong></p>
            </div>
          </div>
          
          <div style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
              Якщо ви не надсилали цей запит, будь ласка, просто проігноруйте цей лист. Ваші дані в безпеці.
            </p>
          </div>
        </div>
        <div style="margin-top: 24px; text-align: center;">
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">
            © 2026 Перечинська центральна районна лікарня<br>
            Вул. Лікарняна, 1, м. Перечин, Закарпатська область
          </p>
        </div>
      </div>
    `,
  });
}

const STATUS_LABELS_UA = {
  NEW: 'Нове',
  IN_PROGRESS: 'В обробці',
  DONE: 'Виконане',
  REJECTED: 'Відхилене',
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
    DONE: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
    REJECTED: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
    IN_PROGRESS: { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
    NEW: { bg: '#eff6ff', text: '#1e40af', border: '#dbeafe' },
  };
  const sc = statusColors[appeal.status] ?? statusColors.NEW;

  const commentSection = appeal.doctorComment
    ? `
      <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 12px; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Коментар лікаря:</p>
        <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${appeal.doctorComment}</p>
      </div>`
    : '';

  await transporter.sendMail({
    from: `"Перечинська ЦРЛ" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Оновлення статусу вашого звернення — ${appeal.title}`,
    html: `
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <div style="padding: 24px 32px; background-color: #2563eb; text-align: left;">
            <div style="display: flex; align-items: center; gap: 8px;">
               <span style="font-size: 20px;">🏥</span>
               <span style="color: #ffffff; font-size: 16px; font-weight: 700;">Перечинська ЦРЛ</span>
            </div>
          </div>

          <div style="padding: 32px;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">Вітаємо, <strong>${appeal.user?.name ?? 'Пацієнт'}</strong>!</p>
            <h3 style="margin: 0 0 24px; color: #1e293b; font-size: 20px; font-weight: 700;">У вас є непрочитане повідомлення, статус вашого звернення оновлено</h3>
            
            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 4px; color: #64748b; font-size: 12px;">Тема звернення:</p>
              <p style="margin: 0 0 16px; color: #1e293b; font-size: 16px; font-weight: 600;">${appeal.title}</p>
              
              <p style="margin: 0 0 6px; color: #64748b; font-size: 12px;">Новий статус:</p>
              <div style="display: inline-block; padding: 4px 12px; background-color: ${sc.bg}; color: ${sc.text}; border: 1px solid ${sc.border}; border-radius: 99px; font-size: 13px; font-weight: 700;">
                ${statusLabel}
              </div>
            </div>

            ${commentSection}

            <p style="margin: 0; color: #94a3b8; font-size: 12px;">Дата оновлення: <strong>${now}</strong></p>
          </div>

          <div style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="margin: 0 0 12px; color: #64748b; font-size: 13px;">Детальнішу інформацію можна переглянути в особистому кабінеті на порталі.</p>
            <div style="height: 1px; background-color: #e2e8f0; margin: 16px 0;"></div>
            <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.4;">
              Цей лист створено автоматично, будь ласка, не відповідайте на нього.<br>
              © 2026 Перечинська центральна районна лікарня
            </p>
          </div>
        </div>
        <div style="margin-top: 24px; text-align: center;">
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">
            Ви отримали цей лист, оскільки зареєстровані на вебпорталі Перечинської ЦРЛ.
          </p>
        </div>
      </div>
    `,
  });
}

