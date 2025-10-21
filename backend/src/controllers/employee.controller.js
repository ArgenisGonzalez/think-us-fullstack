const { Employee } = require("../models");
const validator = require("validator");
const { Op } = require("sequelize");

async function getAll(req, res) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search
      ? {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { position: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Employee.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      })
    );
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      include: [{ model: require("../models").Solicitud, as: "solicitudes" }],
    });

    if (!employee) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Empleado no encontrado" }));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(employee));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
}

async function create(req, res) {
  try {
    const { firstName, lastName, position, salary, email } = req.body;

    if (!firstName || !lastName) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "Nombre y apellido son requeridos" })
      );
    }

    if (email && !validator.isEmail(email)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Email inválido" }));
    }

    const sanitizedData = {
      firstName: validator.escape(firstName.trim()),
      lastName: validator.escape(lastName.trim()),
      position: position ? validator.escape(position.trim()) : null,
      salary: salary || null,
      email: email ? validator.normalizeEmail(email) : null,
    };

    if (sanitizedData.email) {
      const existing = await Employee.findOne({
        where: { email: sanitizedData.email },
      });
      if (existing) {
        res.writeHead(409, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "El email ya está registrado" })
        );
      }
    }

    const employee = await Employee.create(sanitizedData);

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Empleado creado exitosamente",
        data: employee,
      })
    );
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { firstName, lastName, position, salary, email } = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Empleado no encontrado" }));
    }

    if (email && !validator.isEmail(email)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Email inválido" }));
    }

    const sanitizedData = {};
    if (firstName) sanitizedData.firstName = validator.escape(firstName.trim());
    if (lastName) sanitizedData.lastName = validator.escape(lastName.trim());
    if (position) sanitizedData.position = validator.escape(position.trim());
    if (salary !== undefined) sanitizedData.salary = salary;
    if (email) sanitizedData.email = validator.normalizeEmail(email);

    if (sanitizedData.email && sanitizedData.email !== employee.email) {
      const existing = await Employee.findOne({
        where: { email: sanitizedData.email },
      });
      if (existing) {
        res.writeHead(409, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "El email ya está registrado" })
        );
      }
    }

    await employee.update(sanitizedData);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Empleado actualizado exitosamente",
        data: employee,
      })
    );
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Empleado no encontrado" }));
    }

    await employee.destroy();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Empleado eliminado exitosamente" }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
