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

  const safeUsers = Array.isArray(users) ? users : [];

  return reply.send({ data: safeUsers, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
}

export async function updateUser(request, reply) {
  const { id } = request.params;
  const { role, specialtyId, bioUA, bioEN, photoUrl } = request.body;

  const VALID_ROLES = ['USER', 'ADMIN', 'DOCTOR', 'REGISTRAR'];
  if (role && !VALID_ROLES.includes(role)) {
    return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: `Роль повинна бути однією з: ${VALID_ROLES.join(', ')}` });
  }

  if (id === request.user.id && role && role !== request.user.role) {
    return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: 'Не можна змінити власну роль' });
  }

  // Validate DOCTOR requires specialtyId
  const targetRole = role || (await prisma.user.findUnique({ where: { id }, select: { role: true } }))?.role;
  if (targetRole === 'DOCTOR' && role === 'DOCTOR' && !specialtyId) {
    return reply.status(400).send({
      message: "При призначенні ролі DOCTOR обов'язково вкажіть спеціальність лікаря",
    });
  }

  const dataToUpdate = {};
  if (role) dataToUpdate.role = role;
  if (specialtyId !== undefined) dataToUpdate.specialtyId = specialtyId || null;
  if (bioUA !== undefined) dataToUpdate.bioUA = bioUA;
  if (bioEN !== undefined) dataToUpdate.bioEN = bioEN;
  if (photoUrl !== undefined) dataToUpdate.photoUrl = photoUrl;

  // When demoting to non-doctor roles, clear doctor-specific fields
  if (role && role !== 'DOCTOR') {
    dataToUpdate.specialtyId = null;
    dataToUpdate.bioUA = null;
    dataToUpdate.bioEN = null;
    dataToUpdate.photoUrl = null;
  }

  const user = await prisma.user.update({
    where: { id },
    data: dataToUpdate,
    select: { id: true, name: true, email: true, role: true, specialtyId: true, bioUA: true },
  });

  await prisma.log.create({ data: { action: `UPDATE_USER:${user.id}`, userId: request.user.id } });
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
