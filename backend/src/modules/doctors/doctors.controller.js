// src/modules/doctors/doctors.controller.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const doctorsController = {
  getAll: async (request, reply) => {
    try {
      // Fetching users with DOCTOR role
      const doctors = await prisma.user.findMany({
        where: { role: 'DOCTOR' },
        include: { specialty: true },
        orderBy: { name: 'asc' }
      });
      return doctors;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  },

  getById: async (request, reply) => {
    const { id } = request.params;
    try {
      const doctor = await prisma.user.findUnique({
        where: { id, role: 'DOCTOR' },
        include: { specialty: true }
      });

      if (!doctor) {
        return reply.status(404).send({ message: 'Doctor not found' });
      }

      return doctor;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  }
};
