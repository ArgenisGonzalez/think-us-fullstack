const { User, Role } = require("../models");
const { generateToken } = require("../utils/jwt");
const { ROLES } = require("../constants/roles");
const validator = require("validator");

async function register(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "Todos los campos son requeridos" })
      );
    }

    if (!validator.isEmail(email)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Email inválido" }));
    }

    if (password.length < 8) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "La contraseña debe tener al menos 8 caracteres",
        })
      );
    }

    const sanitizedEmail = validator.normalizeEmail(email);

    const existingUser = await User.findOne({
      where: { email: sanitizedEmail },
    });
    if (existingUser) {
      res.writeHead(409, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "El email ya está registrado" }));
    }

    const user = await User.create({
      firstName: validator.escape(firstName),
      lastName: validator.escape(lastName),
      email: sanitizedEmail,
      password,
      isActive: true,
    });

    const empleadoRole = await Role.findOne({
      where: { name: ROLES.EMPLEADO },
    });
    if (empleadoRole) {
      await user.addRole(empleadoRole.id);
    }

    const userWithRoles = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
      attributes: { exclude: ["password"] },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Usuario registrado exitosamente",
        token,
        user: {
          id: userWithRoles.id,
          firstName: userWithRoles.firstName,
          lastName: userWithRoles.lastName,
          email: userWithRoles.email,
          roles: userWithRoles.roles.map((r) => r.name),
        },
      })
    );
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "Email y contraseña son requeridos" })
      );
    }

    if (!validator.isEmail(email)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Email inválido" }));
    }

    const sanitizedEmail = validator.normalizeEmail(email);

    const user = await User.findOne({
      where: { email: sanitizedEmail },
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Credenciales inválidas" }));
    }

    const isValidPassword = await user.authenticate(password);
    if (!isValidPassword) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Credenciales inválidas" }));
    }

    if (!user.isActive) {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Usuario inactivo" }));
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Login exitoso",
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roles: user.roles.map((r) => r.name),
        },
      })
    );
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
}

module.exports = {
  register,
  login,
};
