import { prisma } from '../../config/database.js';
import { createAppealSchema, updateAppealSchema } from './appeals.schema.js';

/**
 * Normalize any date value to UTC midnight (strips hours/minutes/seconds).
 * This prevents timezone-related bugs where e.g. "Apr 19 01:00 UTC+3"
 * becomes "Apr 18 22:00 UTC" and gets stored on the wrong day.
 *
 * Usage: toUTCMidnight('2026-04-19')  → Date(2026-04-19T00:00:00.000Z)
 *        toUTCMidnight(dateObject)    → Date(2026-04-19T00:00:00.000Z)
 */
function toUTCMidnight(dateVal) {
  const d = new Date(dateVal);
  // Use UTC year/month/date so that any "2026-04-19" string or local Date
  // is interpreted correctly without timezone shifting
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function toUTCEndOfDay(dateVal) {
  const d = new Date(dateVal);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
}

const SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  appointmentDate: true,
  appointmentTime: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true } },
  doctor: { select: { id: true, name: true, specialty: true } },
  specialty: { select: { id: true, nameUA: true, nameEN: true } },
  messages: {
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      text: true,
      isRead: true,
      createdAt: true,
      sender: { select: { id: true, name: true, role: true } },
    }
  }
};

export async function getMyAppeals(request, reply) {
  try {
    const { page = 1, limit = 10, status } = request.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = { userId: request.user.id, ...(status && { status }) };

    const [data, total] = await Promise.all([
      prisma.request.findMany({ where, select: SELECT, orderBy: { createdAt: 'desc' }, skip, take: Number(limit) }),
      prisma.request.count({ where }),
    ]);

    const safeData = Array.isArray(data) ? data : [];
    return reply.send({ data: safeData, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    console.error('[GEt_MY_APPEALS_ERROR]:', error);
    return reply.code(500).send({ statusCode: 500, message: 'Помилка при отриманні списку звернень' });
  }
}

export async function createAppeal(request, reply) {
  try {
    const parsed = createAppealSchema.safeParse(request.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      console.error('[CREATE_APPEAL_VALIDATION_ERROR]:', JSON.stringify(parsed.error.errors));
      console.error('[CREATE_APPEAL_BODY_RECEIVED]:', JSON.stringify(request.body));
      return reply.code(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: firstError.message,
        field: firstError.path?.join('.'),
      });
    }

    const { doctorId, appointmentDate, appointmentTime, ...rest } = parsed.data;

    // Normalize to UTC midnight to avoid timezone-related date shifting bugs
    const normalizedDate = appointmentDate ? toUTCMidnight(appointmentDate) : null;

    // Validate that the slot is actually free if date and time are provided
    if (normalizedDate && appointmentTime) {
      const existingSlot = await prisma.request.findFirst({
        where: {
          appointmentDate: { gte: normalizedDate, lte: toUTCEndOfDay(normalizedDate) },
          appointmentTime,
          ...(doctorId ? { doctorId } : { specialtyId: rest.specialtyId }),
          status: { in: ['NEW', 'IN_PROGRESS'] },
        }
      });

      if (existingSlot) {
        return reply.code(400).send({ statusCode: 400, message: 'Обраний час вже зайнятий' });
      }
    }

    const appeal = await prisma.request.create({
      data: { 
        ...rest, 
        doctorId: doctorId || null,
        appointmentDate: normalizedDate,   // always UTC midnight
        appointmentTime,
        userId: request.user.id, 
        status: 'NEW' 
      },
      select: SELECT,
    });

    await prisma.log.create({ data: { action: 'CREATE_REQUEST', userId: request.user.id } });
    return reply.code(201).send(appeal);
  } catch (error) {
    console.error('[CREATE_APPEAL_ERROR]:', error);
    return reply.code(500).send({ statusCode: 500, message: 'Помилка при створенні звернення' });
  }
}

export async function getAppealById(request, reply) {
  try {
    const { id } = request.params;
    const appeal = await prisma.request.findFirst({
      where: { id, userId: request.user.id },
      select: SELECT,
    });
    if (!appeal) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Звернення не знайдено' });
    return reply.send(appeal);
  } catch (error) {
    console.error('[GET_APPEAL_BY_ID_ERROR]:', error);
    return reply.code(500).send({ statusCode: 500, message: 'Помилка при отриманні деталей звернення' });
  }
}

export async function updateAppeal(request, reply) {
  try {
    const { id } = request.params;
    const parsed = updateAppealSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ statusCode: 400, error: 'Validation Error', message: parsed.error.errors[0].message });
    }

    // Verify ownership and status
    const existing = await prisma.request.findFirst({ where: { id, userId: request.user.id } });
    if (!existing) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Звернення не знайдено' });
    if (existing.status !== 'NEW' && request.user.role !== 'ADMIN') {
      return reply.code(400).send({ statusCode: 400, message: 'Можна редагувати тільки нові звернення' });
    }

    const { doctorId, appointmentDate, appointmentTime, ...rest } = parsed.data;

    const normalizedDate = appointmentDate ? toUTCMidnight(appointmentDate) : null;

    if (normalizedDate && appointmentTime) {
      const existingSlot = await prisma.request.findFirst({
        where: {
          id: { not: id },
          appointmentDate: { gte: normalizedDate, lte: toUTCEndOfDay(normalizedDate) },
          appointmentTime,
          ...(doctorId ? { doctorId } : { specialtyId: rest.specialtyId || existing.specialtyId }),
          status: { in: ['NEW', 'IN_PROGRESS'] },
        }
      });

      if (existingSlot) {
        return reply.code(400).send({ statusCode: 400, message: 'Обраний час вже зайнятий' });
      }
    }

    const appeal = await prisma.request.update({
      where: { id },
      data: {
        ...rest,
        ...(doctorId !== undefined && { doctorId: doctorId || null }),
        ...(normalizedDate && { appointmentDate: normalizedDate }),  // always UTC midnight
        ...(appointmentTime && { appointmentTime })
      },
      select: SELECT,
    });

    await prisma.log.create({ data: { action: 'UPDATE_REQUEST', userId: request.user.id } });
    return reply.send(appeal);
  } catch (error) {
    console.error('[UPDATE_APPEAL_ERROR]:', error);
    return reply.code(500).send({ statusCode: 500, message: 'Помилка при оновленні звернення' });
  }
}

export async function deleteAppeal(request, reply) {
  try {
    const { id } = request.params;

    const existing = await prisma.request.findFirst({ where: { id, userId: request.user.id } });
    if (!existing) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Звернення не знайдено' });

    await prisma.request.delete({ where: { id } });
    await prisma.log.create({ data: { action: 'DELETE_REQUEST', userId: request.user.id } });

    return reply.code(204).send();
  } catch (error) {
    console.error('[DELETE_APPEAL_ERROR]:', error);
    return reply.code(500).send({ statusCode: 500, message: 'Помилка при видаленні звернення' });
  }
}

export async function getOccupiedSlots(request, reply) {
  try {
    const { date, doctorId, specialtyId } = request.query;

    if (!date || (!doctorId && !specialtyId)) {
      return reply.code(400).send({ message: 'Необхідно вказати дату та (лікарID або спеціальністьID)' });
    }

    // Parse the YYYY-MM-DD query param strictly as UTC to avoid timezone drift
    const startDate = toUTCMidnight(date + 'T00:00:00.000Z');
    const endDate   = toUTCEndOfDay(date + 'T00:00:00.000Z');

    const items = await prisma.request.findMany({
      where: {
        appointmentDate: { gte: startDate, lte: endDate },
        ...(doctorId ? { doctorId } : { specialtyId }),
        status: { in: ['NEW', 'IN_PROGRESS'] },
      },
      select: { appointmentTime: true },
    });

    const safeItems = Array.isArray(items) ? items : [];
    const slots = safeItems.map((i) => i.appointmentTime).filter(Boolean);
    return reply.send({ occupied: slots });
  } catch (error) {
    console.error('[GET_OCCUPIED_SLOTS_ERROR]:', error);
    return reply.code(500).send({ statusCode: 500, message: 'Помилка при отриманні зайнятих слотів' });
  }
}

export async function getUnreadCount(request, reply) {
  try {
    const unreadCount = await prisma.message.count({
      where: {
        isRead: false,
        request: {
          userId: request.user.id,
        },
      },
    });
    return reply.send({ count: unreadCount });
  } catch (error) {
    console.error('[GET_UNREAD_COUNT_ERROR]:', error);
    return reply.code(500).send({ statusCode: 500, message: 'Помилка при отриманні кількості повідомлень' });
  }
}

export async function markAsRead(request, reply) {
  try {
    const { id } = request.params;
    
    // Validate ownership
    const appeal = await prisma.request.findFirst({
      where: { id, userId: request.user.id },
    });
    if (!appeal) {
      return reply.code(404).send({ statusCode: 404, message: 'Звернення не знайдено' });
    }

    await prisma.message.updateMany({
      where: {
        requestId: id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return reply.code(200).send({ success: true });
  } catch (error) {
    console.error('[MARK_AS_READ_ERROR]:', error);
    return reply.code(500).send({ statusCode: 500, message: 'Помилка при оновленні статусу повідомлень' });
  }
}
