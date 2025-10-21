const { generateToken, verifyToken } = require("../jwt");

describe("JWT Utils", () => {
  describe("generateToken", () => {
    it("debe generar un token válido", () => {
      const payload = { id: 1, email: "test@example.com" };
      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
    });
  });

  describe("verifyToken", () => {
    it("debe verificar un token válido", () => {
      const payload = { id: 1, email: "test@example.com" };
      const token = generateToken(payload);

      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    it("debe lanzar error con token inválido", () => {
      const invalidToken = "token.invalido.aqui";

      expect(() => verifyToken(invalidToken)).toThrow(
        "Token inválido o expirado"
      );
    });

    it("debe lanzar error con token vacío", () => {
      expect(() => verifyToken("")).toThrow("Token inválido o expirado");
    });
  });
});
