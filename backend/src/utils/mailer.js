import nodemailer from 'nodemailer';

export async function sendEmail(to, code) {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (EMAIL_USER && EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Perechyn Hospital" <${EMAIL_USER}>`,
        to,
        subject: 'Код підтвердження',
        text: `Ваш код: ${code}`,
      });
      
      console.log('Email sent to:', to, 'code:', code);
      return true;
    } catch (error) {
      console.error('SMTP Error:', error.message);
      // Fallback
      return false;
    }
  } else {
    // Режим MOCK (відладка в консолі)
    console.log('====================================');
    console.log('MOCK EMAIL СИСТЕМА (SMTP не налаштовано)');
    console.log(`Куди: ${to}`);
    console.log('====================================');
    return true;
  }
}
