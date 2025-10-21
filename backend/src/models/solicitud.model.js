const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../database/db");
const { SOLICITUD_STATUS } = require("../constants/solicitud");

class Solicitud extends Model {}

Solicitud.init(
  {
    title: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM(
        SOLICITUD_STATUS.PENDIENTE,
        SOLICITUD_STATUS.CANCELADA,
        SOLICITUD_STATUS.COMPLETADA
      ),
      defaultValue: SOLICITUD_STATUS.PENDIENTE,
      allowNull: false,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "employees",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "solicitudes",
    timestamps: true,
  }
);

module.exports = Solicitud;
