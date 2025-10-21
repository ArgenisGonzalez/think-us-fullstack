const { Solicitud, Employee } = require("../models");
const validator = require("validator");
const { Op } = require("sequelize");

async function getAll(req, res) {
  try {
    const { page = 1, limit = 10, status = "", search = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Solicitud.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
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

    const solicitud = await Solicitud.findByPk(id, {
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "firstName", "lastName", "email", "position"],
        },
      ],
    });

    if (!solicitud) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Solicitud no encontrada" }));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(solicitud));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
}

async function create(req, res) {
  try {
    const { title, description, employeeId, status } = req.body;

    if (!title || !employeeId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "Título y ID del empleado son requeridos",
        })
      );
    }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Empleado no encontrado" }));
    }

    const sanitizedData = {
      title: validator.escape(title.trim()),
      description: description ? validator.escape(description.trim()) : null,
      employeeId: parseInt(employeeId),
      status: status || "pendiente",
    };

    const solicitud = await Solicitud.create(sanitizedData);

    const solicitudWithEmployee = await Solicitud.findByPk(solicitud.id, {
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Solicitud creada exitosamente",
        data: solicitudWithEmployee,
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
    const { title, description, status } = req.body;

    const solicitud = await Solicitud.findByPk(id);
    if (!solicitud) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Solicitud no encontrada" }));
    }

    const sanitizedData = {};
    if (title) sanitizedData.title = validator.escape(title.trim());
    if (description)
      sanitizedData.description = validator.escape(description.trim());
    if (status) sanitizedData.status = status;

    await solicitud.update(sanitizedData);

    const updatedSolicitud = await Solicitud.findByPk(id, {
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Solicitud actualizada exitosamente",
        data: updatedSolicitud,
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

    const solicitud = await Solicitud.findByPk(id);
    if (!solicitud) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Solicitud no encontrada" }));
    }

    await solicitud.destroy();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Solicitud eliminada exitosamente" }));
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
