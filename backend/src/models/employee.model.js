const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../database/db");

class Employee extends Model {}

Employee.init(
  {
    firstName: { type: DataTypes.STRING(50), allowNull: false },
    lastName: { type: DataTypes.STRING(50), allowNull: false },
    position: { type: DataTypes.STRING(100), allowNull: true },
    salary: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    email: { type: DataTypes.STRING(100), allowNull: true, unique: true },
  },
  {
    sequelize,
    tableName: "employees",
    timestamps: true,
  }
);

module.exports = Employee;
