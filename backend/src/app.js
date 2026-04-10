// src/app.js — Fastify App Factory
import Fastify from 'fastify';
import { env } from './config/env.js';

// Plugins
import corsPlugin from './plugins/cors.js';
import authPlugin from './plugins/auth.js';
import swaggerPlugin from './plugins/swagger.js';

// Routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { appealsRoutes } from './modules/appeals/appeals.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { doctorsRoutes } from './modules/doctors/doctors.routes.js';
import { doctorRoutes } from './modules/doctor/doctor.routes.js';
import { registrarRoutes } from './modules/registrar/registrar.routes.js';
import specialtiesRoutes from './modules/specialties/specialties.routes.js';

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'warn' : 'info',
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
          : undefined,
    },
  });

  // Реєстрація плагінів
  await fastify.register(swaggerPlugin);
  await fastify.register(corsPlugin);
  await fastify.register(authPlugin);

  // Health check
  fastify.get('/api/health', {
    schema: { tags: ['Health'], summary: 'Перевірка стану сервера' },
    handler: async () => ({
      status: 'ok',
      service: 'Вебпортал Перечинської ЦРЛ',
      timestamp: new Date().toISOString(),
    }),
  });

  // Реєстрація маршрутів
  fastify.register(authRoutes, { prefix: '/api/auth' });
  fastify.register(usersRoutes, { prefix: '/api/users' });
  fastify.register(appealsRoutes, { prefix: '/api/appeals' });
  fastify.register(adminRoutes, { prefix: '/api/admin' });
  fastify.register(doctorsRoutes, { prefix: '/api/doctors' });     // Public doctors catalog API
  fastify.register(doctorRoutes, { prefix: '/api/doctor' });       // Protected DOCTOR role API
  fastify.register(registrarRoutes, { prefix: '/api/registrar' }); // Protected REGISTRAR role API
  fastify.register(specialtiesRoutes, { prefix: '/api/specialties' });

  // Глобальний обробник помилок
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      statusCode,
      error: error.name || 'Internal Server Error',
      message: statusCode === 500 ? 'Внутрішня помилка сервера' : error.message,
    });
  });

  // 404
  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ statusCode: 404, error: 'Not Found', message: `Маршрут ${request.url} не знайдено` });
  });

  return fastify;
}
