import { act, renderHook } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "../AuthContext";

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Wrapper que incluye el Router
const wrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("debe proporcionar valores iniciales", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated()).toBe(false);
  });

  test("login debe guardar usuario y token", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper,
    });

    const mockUser = {
      id: 1,
      email: "test@example.com",
      roles: ["empleado"],
    };
    const mockToken = "mock-token-123";

    act(() => {
      result.current.login(mockUser, mockToken);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated()).toBe(true);
  });

  test("logout debe limpiar usuario y token", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper,
    });

    const mockUser = {
      id: 1,
      email: "test@example.com",
      roles: ["empleado"],
    };

    act(() => {
      result.current.login(mockUser, "token");
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated()).toBe(false);
  });

  test("isAdmin debe retornar true para administrador", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper,
    });

    const adminUser = {
      id: 1,
      email: "admin@example.com",
      roles: ["administrador"],
    };

    act(() => {
      result.current.login(adminUser, "token");
    });

    expect(result.current.isAdmin()).toBe(true);
  });

  test("isAdmin debe retornar false para empleado", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper,
    });

    const empleadoUser = {
      id: 1,
      email: "empleado@example.com",
      roles: ["empleado"],
    };

    act(() => {
      result.current.login(empleadoUser, "token");
    });

    expect(result.current.isAdmin()).toBe(false);
  });
});
