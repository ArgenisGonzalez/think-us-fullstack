const { sequelize } = require("../database/db");
const User = require("./user.model");
const Role = require("./role.model");
const UserRole = require("./userRole.model");
const Employee = require("./employee.model");
const Solicitud = require("./solicitud.model");

User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "userId",
  as: "roles",
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: "roleId",
  as: "users",
});

Employee.hasMany(Solicitud, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
  as: "solicitudes",
});

Solicitud.belongsTo(Employee, {
  foreignKey: "employeeId",
  as: "employee",
});

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  Employee,
  Solicitud,
};
