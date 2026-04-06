// src/server.js — точка входу сервера
import { buildApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

const start = async () => {
  const fastify = await buildApp();

  try {
    await connectDatabase();
    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`\n🏥 Вебпортал Перечинської ЦРЛ`);
    console.log(`🚀 Сервер запущено: http://localhost:${env.PORT}`);
    console.log(`📚 Swagger UI: http://localhost:${env.PORT}/documentation\n`);
  } catch (err) {
    fastify.log.error(err);
    await disconnectDatabase();
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Завершення роботи сервера...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

start();
