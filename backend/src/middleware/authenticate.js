// src/middleware/authenticate.js — перевірка JWT токена
export async function authenticate(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Необхідна авторизація. Будь ласка, увійдіть до системи.',
    });
  }
}
