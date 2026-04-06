// src/plugins/swagger.js — OpenAPI / Swagger документація
import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

async function swaggerPlugin(fastify) {
  fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Вебпортал Перечинської ЦРЛ — API',
        description: 'REST API для системи управління зверненнями громадян та адміністрування лікарні',
        version: '1.0.0',
      },
      servers: [{ url: 'http://localhost:4000', description: 'Development' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'Auth', description: 'Авторизація та реєстрація' },
        { name: 'Users', description: 'Управління профілем' },
        { name: 'Appeals', description: 'Звернення громадян' },
        { name: 'Admin', description: 'Адміністративні функції' },
      ],
    },
  });

  fastify.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });
}

export default fp(swaggerPlugin, { name: 'swagger' });
