// src/modules/admin/admin.controller.js
import { prisma } from '../../config/database.js';

const APPEAL_INCLUDE = {
  user: { select: { id: true, name: true, email: true } },
};

// ── Користувачі ──────────────────────────────────────────────────────────────

export async function getAllUsers(request, reply) {
  const { page = 1, limit = 20, search } = request.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = search
    ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.user.count({ where }),
  ]);

  return reply.send({ data: users, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
}

export async function updateUser(request, reply) {
  const { id } = request.params;
  const { role } = request.body;

  if (!['USER', 'ADMIN'].includes(role)) {
    return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: 'Роль повинна бути USER або ADMIN' });
  }

  if (id === request.user.id) {
    return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: 'Не можна змінити власну роль' });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  await prisma.log.create({ data: { action: `UPDATE_USER_ROLE:${role}`, userId: request.user.id } });
  return reply.send(user);
}

export async function deleteUser(request, reply) {
  const { id } = request.params;
  if (id === request.user.id) {
    return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: 'Не можна видалити власний акаунт' });
  }
  await prisma.user.delete({ where: { id } });
  await prisma.log.create({ data: { action: 'DELETE_USER', userId: request.user.id } });
  return reply.send({ message: 'Користувача видалено' });
}

// ── Звернення ─────────────────────────────────────────────────────────────────

export async function getAllAppeals(request, reply) {
  const { page = 1, limit = 20, status, search } = request.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.request.findMany({ where, include: APPEAL_INCLUDE, orderBy: { createdAt: 'desc' }, skip, take: Number(limit) }),
    prisma.request.count({ where }),
  ]);

  return reply.send({ data, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
}

export async function updateAppealStatus(request, reply) {
  const { id } = request.params;
  const { status } = request.body;

  if (!['NEW', 'IN_PROGRESS', 'DONE'].includes(status)) {
    return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: 'Статус повинен бути NEW, IN_PROGRESS або DONE' });
  }

  const appeal = await prisma.request.findUnique({ where: { id } });
  if (!appeal) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Звернення не знайдено' });

  const updated = await prisma.request.update({
    where: { id },
    data: { status },
    include: APPEAL_INCLUDE,
  });

  await prisma.log.create({ data: { action: `STATUS_CHANGE:${status}`, userId: request.user.id } });
  return reply.send(updated);
}

// ── Статистика ────────────────────────────────────────────────────────────────

export async function getStats(request, reply) {
  const [totalUsers, totalRequests, newRequests, inProgressRequests, doneRequests, recentRequests, recentLogs] = await Promise.all([
    prisma.user.count(),
    prisma.request.count(),
    prisma.request.count({ where: { status: 'NEW' } }),
    prisma.request.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.request.count({ where: { status: 'DONE' } }),
    prisma.request.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: APPEAL_INCLUDE }),
    prisma.log.findMany({ take: 10, orderBy: { timestamp: 'desc' }, include: { user: { select: { name: true, email: true } } } }),
  ]);

  return reply.send({
    users: { total: totalUsers },
    requests: {
      total: totalRequests,
      byStatus: { new: newRequests, inProgress: inProgressRequests, done: doneRequests },
    },
    recentRequests,
    recentLogs,
  });
}
