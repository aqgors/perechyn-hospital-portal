// src/modules/doctor/doctor.controller.js
import { prisma } from '../../config/database.js';
import { sendAppealStatusEmail } from '../../utils/email.js';

const APPEAL_INCLUDE = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  specialty: { select: { id: true, nameUA: true, nameEN: true } },
  doctor: { select: { id: true, name: true } }
};

export async function getPatientAppeals(request, reply) {
  const { page = 1, limit = 20, status, search, specialtyId } = request.query;
  const skip = (Number(page) - 1) * Number(limit);

  // Restrict doctor to their own specialtyId or directly assigned appeals
  const doctorUser = await prisma.user.findUnique({
    where: { id: request.user.id },
    select: { specialtyId: true },
  });

  // Doctor sees appeals matching their specialty OR explicitly assigned to them
  const accessFilter = {
    OR: [
      ...(doctorUser?.specialtyId ? [{ specialtyId: doctorUser.specialtyId }] : []),
      { doctorId: request.user.id },
    ],
  };

  const where = {
    ...accessFilter,
    ...(status && { status }),
    // If specialtyId filter provided, it must still match doctor's access
    ...(specialtyId && { specialtyId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.request.findMany({ 
      where, 
      include: APPEAL_INCLUDE, 
      orderBy: [
        { appointmentDate: 'asc' }, 
        { appointmentTime: 'asc' }, 
        { createdAt: 'desc' }
      ], 
      skip, 
      take: Number(limit) 
    }),
    prisma.request.count({ where }),
  ]);

  return reply.send({ data, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
}

export async function handleAppeal(request, reply) {
  const { id } = request.params;
  const { status, message, doctorComment } = request.body;
  const msgText = message || doctorComment;

  if (status && !['NEW', 'IN_PROGRESS', 'DONE', 'REJECTED'].includes(status)) {
    return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: 'Недійсний статус' });
  }

  const appeal = await prisma.request.findUnique({ 
    where: { id },
    select: { id: true, doctorId: true, specialtyId: true }
  });
  if (!appeal) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Звернення не знайдено' });

  // Verify doctor has access to this appeal (own specialty or directly assigned)
  const doctorUser = await prisma.user.findUnique({
    where: { id: request.user.id },
    select: { specialtyId: true },
  });

  const hasAccess =
    appeal.doctorId === request.user.id ||
    (doctorUser?.specialtyId && appeal.specialtyId === doctorUser.specialtyId);

  if (!hasAccess) {
    return reply.code(403).send({ statusCode: 403, error: 'Forbidden', message: 'Ви не маєте доступу до цього звернення' });
  }

  const dataToUpdate = {};
  if (status) dataToUpdate.status = status;

  // We no longer update request.doctorComment, we use Messages instead
  const updated = await prisma.request.update({
    where: { id },
    data: dataToUpdate,
    include: APPEAL_INCLUDE,
  });

  let createdMessage = null;
  if (msgText && msgText.trim() !== '') {
    createdMessage = await prisma.message.create({
      data: {
        requestId: id,
        senderId: request.user.id,
        text: msgText.trim(),
        isRead: false,
      }
    });
  }

  await prisma.log.create({ data: { action: `DOCTOR_HANDLE_APPEAL:${id}`, userId: request.user.id } });
  
  // Send email notification to patient ONLY if doctor posted a message
  if (updated.user?.email && createdMessage) {
    sendAppealStatusEmail(updated.user.email, updated).catch((err) => {
      console.error('[EmailError] Failed to send appeal status email:', err.message);
    });
  }

  return reply.send(updated);
}
