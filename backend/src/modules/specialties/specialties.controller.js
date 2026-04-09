// src/modules/specialties/specialties.controller.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const specialtiesController = {
  getAll: async (request, reply) => {
    try {
      const specialties = await prisma.specialty.findMany({
        orderBy: { nameUA: 'asc' }
      });
      return specialties;
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
    try {
      const specialty = await prisma.specialty.create({
        data: { nameUA, nameEN }
      });
      return specialty;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  }
};
