const { verifyToken } = require("../utils/jwt");
const { User, Role } = require("../models");

async function authenticate(req) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    throw new Error("Token no proporcionado");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Formato de token inválido");
  }

  const decoded = verifyToken(token);

  const user = await User.findByPk(decoded.id, {
    include: [
      {
        model: Role,
        as: "roles",
        attributes: ["id", "name"],
        through: { attributes: [] },
      },
    ],
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (!user.isActive) {
    throw new Error("Usuario inactivo");
  }

  req.user = {
    id: user.id,
    email: user.email,
    roles: user.roles.map((r) => r.name),
  };

  return req.user;
}

function authorize(...allowedRoles) {
  return async (req) => {
    await authenticate(req);

    const userRoles = req.user.roles;
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      throw new Error("No tienes permisos para esta acción");
    }
  };
}

module.exports = {
  authenticate,
  authorize,
};
