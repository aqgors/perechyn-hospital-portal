// src/modules/appeals/appeals.controller.js
import { prisma } from '../../config/database.js';
import { createAppealSchema, updateAppealSchema } from './appeals.schema.js';

const SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  category: true,
  appointmentDate: true,
  appointmentTime: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true } },
  doctor: { select: { id: true, name: true, specialty: true } },
};

export async function getMyAppeals(request, reply) {
  const { page = 1, limit = 10, status } = request.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = { userId: request.user.id, ...(status && { status }) };

  const [data, total] = await Promise.all([
    prisma.request.findMany({ where, select: SELECT, orderBy: { createdAt: 'desc' }, skip, take: Number(limit) }),
    prisma.request.count({ where }),
  ]);

  return reply.send({ data, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
}

export async function createAppeal(request, reply) {
  const parsed = createAppealSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ statusCode: 400, error: 'Validation Error', message: parsed.error.errors[0].message });
  }

  const appeal = await prisma.request.create({
    data: { ...parsed.data, userId: request.user.id, status: 'NEW' },
    select: SELECT,
  });

  await prisma.log.create({ data: { action: 'CREATE_REQUEST', userId: request.user.id } });

  return reply.code(201).send(appeal);
}

export async function getAppealById(request, reply) {
  const { id } = request.params;
  const appeal = await prisma.request.findFirst({
    where: { id, userId: request.user.id },
    select: SELECT,
  });
  if (!appeal) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Звернення не знайдено' });
  return reply.send(appeal);
}
