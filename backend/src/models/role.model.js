const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../database/db");

class Role extends Model {}

Role.init(
  {
    name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(150), allowNull: true },
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: false,
  }
);

module.exports = Role;
