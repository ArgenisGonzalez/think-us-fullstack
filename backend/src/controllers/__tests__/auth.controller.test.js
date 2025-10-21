const { register, login } = require("../auth.controller");
const { User, Role, sequelize } = require("../../models");
const { ROLES } = require("../../constants/roles");

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await Role.create({ name: ROLES.EMPLEADO, description: "Empleado" });
});

afterAll(async () => {
  await sequelize.close();
});

afterEach(async () => {
  await User.destroy({ where: {}, truncate: true, cascade: true });
});

describe("Auth Controller", () => {
  describe("register", () => {
    it("debe registrar un usuario exitosamente", async () => {
      const req = {
        body: {
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan@example.com",
          password: "Password123",
        },
      };

      let responseData = null;
      let statusCode = null;

      const res = {
        writeHead: jest.fn((code) => {
          statusCode = code;
        }),
        end: jest.fn((data) => {
          responseData = JSON.parse(data);
        }),
      };

      await register(req, res);

      expect(statusCode).toBe(201);
      expect(responseData.token).toBeDefined();
      expect(responseData.user.email).toBe(req.body.email);
      expect(responseData.user.roles).toContain(ROLES.EMPLEADO);
    });

    it("debe fallar con campos faltantes", async () => {
      const req = {
        body: {
          email: "test@example.com",
        },
      };

      let responseData = null;
      let statusCode = null;

      const res = {
        writeHead: jest.fn((code) => {
          statusCode = code;
        }),
        end: jest.fn((data) => {
          responseData = JSON.parse(data);
        }),
      };

      await register(req, res);

      expect(statusCode).toBe(400);
      expect(responseData.error).toBeDefined();
    });

    it("debe fallar con email inválido", async () => {
      const req = {
        body: {
          firstName: "Test",
          lastName: "User",
          email: "invalid-email",
          password: "Password123",
        },
      };

      let responseData = null;
      let statusCode = null;

      const res = {
        writeHead: jest.fn((code) => {
          statusCode = code;
        }),
        end: jest.fn((data) => {
          responseData = JSON.parse(data);
        }),
      };

      await register(req, res);

      expect(statusCode).toBe(400);
      expect(responseData.error).toContain("Email inválido");
    });

    it("debe fallar con email duplicado", async () => {
      const userData = {
        firstName: "Duplicate",
        lastName: "User",
        email: "duplicate@example.com",
        password: "Password123",
      };

      await User.create(userData);

      const req = { body: userData };

      let responseData = null;
      let statusCode = null;

      const res = {
        writeHead: jest.fn((code) => {
          statusCode = code;
        }),
        end: jest.fn((data) => {
          responseData = JSON.parse(data);
        }),
      };

      await register(req, res);

      expect(statusCode).toBe(409);
      expect(responseData.error).toContain("ya está registrado");
    });
  });

  describe("login", () => {
    const userData = {
      firstName: "Login",
      lastName: "Test",
      email: "login@example.com",
      password: "Password123",
      isActive: true,
      authType: "email",
    };

    beforeEach(async () => {
      await User.destroy({ where: {}, truncate: true, cascade: true });
      await User.create(userData);
    });

    it("debe hacer login exitosamente", async () => {
      const req = {
        body: {
          email: userData.email,
          password: userData.password,
        },
      };

      let responseData = null;
      let statusCode = null;

      const res = {
        writeHead: jest.fn((code) => {
          statusCode = code;
        }),
        end: jest.fn((data) => {
          responseData = JSON.parse(data);
        }),
      };

      await login(req, res);

      expect(statusCode).toBe(200);
      expect(responseData.token).toBeDefined();
      expect(responseData.user.email).toBe(userData.email);
    });

    it("debe fallar con credenciales incorrectas", async () => {
      const req = {
        body: {
          email: userData.email,
          password: "WrongPassword",
        },
      };

      let responseData = null;
      let statusCode = null;

      const res = {
        writeHead: jest.fn((code) => {
          statusCode = code;
        }),
        end: jest.fn((data) => {
          responseData = JSON.parse(data);
        }),
      };

      await login(req, res);

      expect(statusCode).toBe(401);
      expect(responseData.error).toContain("Credenciales inválidas");
    });

    it("debe fallar con usuario no existente", async () => {
      const req = {
        body: {
          email: "noexiste@example.com",
          password: "Password123",
        },
      };

      let responseData = null;
      let statusCode = null;

      const res = {
        writeHead: jest.fn((code) => {
          statusCode = code;
        }),
        end: jest.fn((data) => {
          responseData = JSON.parse(data);
        }),
      };

      await login(req, res);

      expect(statusCode).toBe(401);
      expect(responseData.error).toBeDefined();
    });
  });
});
