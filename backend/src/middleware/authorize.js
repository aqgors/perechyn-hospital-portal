// src/middleware/authorize.js — перевірка ролей
// Call as: authorize(['ADMIN']) or authorize(['ADMIN', 'DOCTOR'])
export function authorize(allowedRoles) {
  return async function (request, reply) {
    const userRole = request.user?.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!userRole || !roles.includes(userRole)) {
      reply.code(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: `Доступ заборонено. Необхідна роль: ${roles.join(' або ')}`,
      });
    }
  };
}
