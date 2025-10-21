const { authenticate, authorize } = require("../auth.middleware");
const { User, Role, sequelize } = require("../../models");
const { generateToken } = require("../../utils/jwt");
const { ROLES } = require("../../constants/roles");

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

afterEach(async () => {
  await User.destroy({ where: {}, truncate: true, cascade: true });
  await Role.destroy({ where: {}, truncate: true, cascade: true });
});

describe("Auth Middleware", () => {
  describe("authenticate", () => {
    let user;
    let token;
    let employeeRole;

    beforeEach(async () => {
      employeeRole = await Role.create({
        name: ROLES.EMPLEADO,
        description: "Empleado",
      });

      user = await User.create({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "Password123",
        isActive: true,
        authType: "email",
      });

      await user.addRole(employeeRole.id);

      token = generateToken({ id: user.id, email: user.email });
    });

    it("debe autenticar con token válido", async () => {
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      await authenticate(req);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(user.id);
      expect(req.user.email).toBe(user.email);
      expect(req.user.roles).toContain(ROLES.EMPLEADO);
    });

    it("debe fallar sin token", async () => {
      const req = {
        headers: {},
      };

      await expect(authenticate(req)).rejects.toThrow("Token no proporcionado");
    });

    it("debe fallar con token inválido", async () => {
      const req = {
        headers: {
          authorization: "Bearer token-invalido",
        },
      };

      await expect(authenticate(req)).rejects.toThrow();
    });

    it("debe fallar con usuario inactivo", async () => {
      await user.update({ isActive: false });

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      await expect(authenticate(req)).rejects.toThrow("Usuario inactivo");
    });
  });

  describe("authorize", () => {
    let adminUser;
    let employeeUser;
    let adminToken;
    let employeeToken;

    beforeEach(async () => {
      const adminRole = await Role.create({
        name: ROLES.ADMINISTRADOR,
        description: "Administrador",
      });

      const employeeRole = await Role.create({
        name: ROLES.EMPLEADO,
        description: "Empleado",
      });

      adminUser = await User.create({
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password: "Password123",
        isActive: true,
        authType: "email",
      });

      employeeUser = await User.create({
        firstName: "Employee",
        lastName: "User",
        email: "employee@example.com",
        password: "Password123",
        isActive: true,
        authType: "email",
      });

      await adminUser.addRole(adminRole.id);
      await employeeUser.addRole(employeeRole.id);

      adminToken = generateToken({ id: adminUser.id, email: adminUser.email });
      employeeToken = generateToken({
        id: employeeUser.id,
        email: employeeUser.email,
      });
    });

    it("debe permitir acceso a administrador", async () => {
      const req = {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      };

      await expect(authorize(ROLES.ADMINISTRADOR)(req)).resolves.not.toThrow();
    });

    it("debe denegar acceso a empleado para rutas de admin", async () => {
      const req = {
        headers: {
          authorization: `Bearer ${employeeToken}`,
        },
      };

      await expect(authorize(ROLES.ADMINISTRADOR)(req)).rejects.toThrow(
        "No tienes permisos para esta acción"
      );
    });

    it("debe permitir acceso a múltiples roles", async () => {
      const req = {
        headers: {
          authorization: `Bearer ${employeeToken}`,
        },
      };

      await expect(
        authorize(ROLES.EMPLEADO, ROLES.ADMINISTRADOR)(req)
      ).resolves.not.toThrow();
    });
  });
});
