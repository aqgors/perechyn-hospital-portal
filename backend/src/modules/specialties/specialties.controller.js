// src/modules/specialties/specialties.controller.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const specialtiesController = {
  getAll: async (request, reply) => {
    try {
      const specialties = await prisma.specialty.findMany({
        orderBy: { nameUA: 'asc' }
      });
      return { data: specialties };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

  getById: async (request, reply) => {
    const { id } = request.params;
    try {
      const specialty = await prisma.specialty.findUnique({
        where: { id },
        include: { doctors: { select: { id: true, name: true, photoUrl: true, bioUA: true, bioEN: true } } }
      });

      if (!specialty) {
        return reply.status(404).send({ message: 'Specialty not found' });
      }

      return specialty;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

  create: async (request, reply) => {
    const { nameUA, nameEN } = request.body;
    if (!nameUA || !nameEN) {
      return reply.status(400).send({ message: 'Назви спеціалізації (UA та EN) є обов\'язковими' });
    }
    try {
      const specialty = await prisma.specialty.create({
        data: { nameUA, nameEN }
      });
      return reply.status(201).send(specialty);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

  update: async (request, reply) => {
    const { id } = request.params;
    const { nameUA, nameEN } = request.body;
    try {
      const specialty = await prisma.specialty.update({
        where: { id },
        data: { 
          ...(nameUA && { nameUA }), 
          ...(nameEN && { nameEN }) 
        }
      });
      return specialty;
    } catch (error) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ message: 'Спеціальність не знайдена' });
      }
      request.log.error(error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

  remove: async (request, reply) => {
    const { id } = request.params;
    try {
      // Check if any doctors or requests are linked to this specialty
      const doctorCount = await prisma.user.count({ where: { specialtyId: id } });
      if (doctorCount > 0) {
        return reply.status(409).send({ 
          message: `Неможливо видалити: ${doctorCount} лікар(ів) прив'язані до цієї спеціальності. Спочатку перепризначте їх.` 
        });
      }

      await prisma.specialty.delete({ where: { id } });
      return reply.send({ message: 'Спеціальність видалено' });
    } catch (error) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ message: 'Спеціальність не знайдена' });
      }
      request.log.error(error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  }
};
