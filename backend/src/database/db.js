require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");

const isDocker = fs.existsSync("/.dockerenv");
const isTest = process.env.NODE_ENV === "test";

let sequelize;

if (isTest) {
  sequelize = new Sequelize("sqlite::memory:", {
    dialect: "sqlite",
    logging: false,
  });
} else {
  const host = isDocker ? "db" : process.env.DB_HOST || "localhost";

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: host,
      dialect: "postgres",
      logging: false,
    }
  );
}

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Conectado a la base de datos");
  } catch (err) {
    console.error("Error de conexión:", err.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
