// src/middleware/authorize.js — перевірка ролей
export function authorize(...allowedRoles) {
  return async function (request, reply) {
    const userRole = request.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      reply.code(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: `Доступ заборонено. Необхідна роль: ${allowedRoles.join(' або ')}`,
      });
    }
  };
}
