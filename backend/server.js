require("dotenv").config();
const http = require("http");
const url = require("url");
const { connectDB, sequelize } = require("./src/database/db");
const authController = require("./src/controllers/auth.controller");
const employeeController = require("./src/controllers/employee.controller");
const solicitudController = require("./src/controllers/solicitud.controller");
const { authenticate, authorize } = require("./src/middleware/auth.middleware");
const { findRoute } = require("./src/utils/routes");
const { ROLES } = require("./src/constants/roles");

const PORT = process.env.PORT || 8888;

async function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        const parsed = data ? JSON.parse(data) : {};
        resolve(parsed);
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

const routes = {
  "/health": {
    GET: async (_req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          db: sequelize.options.dialect,
          ts: new Date(),
        })
      );
    },
  },
  "/api/auth/register": {
    POST: async (req, res) => {
      req.body = await getRequestBody(req);
      await authController.register(req, res);
    },
  },
  "/api/auth/login": {
    POST: async (req, res) => {
      req.body = await getRequestBody(req);
      await authController.login(req, res);
    },
  },
  "/api/employees": {
    GET: async (req, res) => {
      await authenticate(req);
      await employeeController.getAll(req, res);
    },
    POST: async (req, res) => {
      await authenticate(req);
      req.body = await getRequestBody(req);
      await employeeController.create(req, res);
    },
  },
  "/api/employees/:id": {
    GET: async (req, res) => {
      await authenticate(req);
      await employeeController.getById(req, res);
    },
    PUT: async (req, res) => {
      await authorize(ROLES.ADMINISTRADOR)(req);
      req.body = await getRequestBody(req);
      await employeeController.update(req, res);
    },
    DELETE: async (req, res) => {
      await authorize(ROLES.ADMINISTRADOR)(req);
      await employeeController.remove(req, res);
    },
  },
  "/api/solicitudes": {
    GET: async (req, res) => {
      await authenticate(req);
      await solicitudController.getAll(req, res);
    },
    POST: async (req, res) => {
      await authenticate(req);
      req.body = await getRequestBody(req);
      await solicitudController.create(req, res);
    },
  },
  "/api/solicitudes/:id": {
    GET: async (req, res) => {
      await authenticate(req);
      await solicitudController.getById(req, res);
    },
    PUT: async (req, res) => {
      await authorize(ROLES.ADMINISTRADOR)(req);
      req.body = await getRequestBody(req);
      await solicitudController.update(req, res);
    },
    DELETE: async (req, res) => {
      await authorize(ROLES.ADMINISTRADOR)(req);
      await solicitudController.remove(req, res);
    },
  },
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  req.query = parsedUrl.query;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const matchedRoute = findRoute(routes, parsedUrl.pathname, req.method);

  if (matchedRoute) {
    req.params = matchedRoute.params;
    try {
      await matchedRoute.handler(req, res);
    } catch (err) {
      const statusCode =
        err.message.includes("Token") || err.message.includes("permisos")
          ? 401
          : 500;
      res.writeHead(statusCode, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta no encontrada" }));
  }
});

(async () => {
  await connectDB();
  server.listen(PORT, () =>
    console.log(`Servidor corriendo en puerto ${PORT}`)
  );
})();
