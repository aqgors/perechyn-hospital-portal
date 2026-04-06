// src/plugins/cors.js — CORS конфігурація
import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { env } from '../config/env.js';

async function corsPlugin(fastify) {
  fastify.register(cors, {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
}

export default fp(corsPlugin, { name: 'cors' });
