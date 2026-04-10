// src/modules/registrar/registrar.controller.js
import { prisma } from '../../config/database.js';

const APPEAL_INCLUDE = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  specialty: { select: { id: true, nameUA: true, nameEN: true } },
  doctor: { select: { id: true, name: true } },
};

export async function getAllAppeals(request, reply) {
  const { page = 1, limit = 30, status, specialtyId, search } = request.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    ...(status && { status }),
    ...(specialtyId && { specialtyId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.request.findMany({
      where,
      include: APPEAL_INCLUDE,
      orderBy: [{ appointmentDate: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: Number(limit),
    }),
    prisma.request.count({ where }),
  ]);

  return reply.send({
    data,
    meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
  });
}

export async function updateAppeal(request, reply) {
  const { id } = request.params;
  const { status, specialtyId, doctorId } = request.body;

  // Registrar cannot write doctorComment
  const dataToUpdate = {};
  if (status) {
    const VALID = ['NEW', 'IN_PROGRESS', 'DONE', 'REJECTED'];
    if (!VALID.includes(status)) {
      return reply.code(400).send({ message: `Недійсний статус: ${status}` });
    }
    dataToUpdate.status = status;
  }
  if (specialtyId !== undefined) dataToUpdate.specialtyId = specialtyId || null;
  if (doctorId !== undefined) dataToUpdate.doctorId = doctorId || null;

  const updated = await prisma.request.update({
    where: { id },
    data: dataToUpdate,
    include: APPEAL_INCLUDE,
  });

  await prisma.log.create({
    data: { action: `REGISTRAR_UPDATE_APPEAL:${id}`, userId: request.user.id },
  });

  return reply.send(updated);
}
