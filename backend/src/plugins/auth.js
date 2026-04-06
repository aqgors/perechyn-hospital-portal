// src/plugins/auth.js — JWT Fastify плагін
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { env } from '../config/env.js';

async function authPlugin(fastify) {
  fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  // Декоратор для перевірки токена
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Токен недійсний або відсутній',
      });
    }
  });
}

export default fp(authPlugin, { name: 'auth' });
