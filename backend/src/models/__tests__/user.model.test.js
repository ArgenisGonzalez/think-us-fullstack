const { User, sequelize } = require("../index");

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

afterEach(async () => {
  await User.destroy({ where: {}, truncate: true });
});

describe("User Model", () => {
  describe("Creación de usuario", () => {
    it("debe crear un usuario válido", async () => {
      const userData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@example.com",
        password: "Password123",
        isActive: true,
        authType: "email",
      };

      const user = await User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.firstName).toBe(userData.firstName);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password);
    });

    it("debe hashear la contraseña automáticamente", async () => {
      const password = "Password123";
      const user = await User.create({
        firstName: "Ana",
        lastName: "García",
        email: "ana@example.com",
        password: password,
        isActive: true,
        authType: "email",
      });

      expect(user.password).not.toBe(password);
      expect(user.password.length).toBeGreaterThan(20);
    });

    it("debe fallar con email duplicado", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "duplicate@example.com",
        password: "Password123",
        authType: "email",
      };

      await User.create(userData);

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("debe fallar con email inválido", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "not-an-email",
        password: "Password123",
        authType: "email",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("debe fallar con contraseña muy corta", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "123",
        authType: "email",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe("Autenticación", () => {
    let user;
    const password = "Password123";

    beforeEach(async () => {
      user = await User.create({
        firstName: "Test",
        lastName: "Auth",
        email: "auth@example.com",
        password: password,
        isActive: true,
        authType: "email",
      });
    });

    it("debe autenticar con contraseña correcta", async () => {
      const isValid = await user.authenticate(password);
      expect(isValid).toBe(true);
    });

    it("debe fallar con contraseña incorrecta", async () => {
      const isValid = await user.authenticate("wrongpassword");
      expect(isValid).toBe(false);
    });
  });
});
