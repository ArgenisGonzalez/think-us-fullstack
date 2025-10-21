const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../database/db");

class UserRole extends Model {}

UserRole.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "roles", key: "id" },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "user_roles",
    timestamps: false,
  }
);

module.exports = UserRole;
