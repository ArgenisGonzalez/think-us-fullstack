import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../../context/AuthContext";
import api from "../../../services/api";
import Login from "../Login";

// Mock del módulo api
jest.mock("../../../services/api");

const MockLogin = () => (
  <BrowserRouter>
    <AuthProvider>
      <Login />
    </AuthProvider>
  </BrowserRouter>
);

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("debe renderizar el formulario de login", () => {
    render(<MockLogin />);

    expect(
      screen.getByPlaceholderText(/correo@example.com/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i })
    ).toBeInTheDocument();
  });

  test("debe mostrar error si los campos están vacíos", async () => {
    render(<MockLogin />);

    const submitButton = screen.getByRole("button", {
      name: /iniciar sesión/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Tu componente muestra "Error al iniciar sesión"
      expect(screen.getByText(/error al iniciar sesión/i)).toBeInTheDocument();
    });
  });

  test("debe llamar a la API con las credenciales correctas", async () => {
    const mockResponse = {
      data: {
        token: "mock-token",
        user: {
          id: 1,
          email: "test@example.com",
          roles: ["empleado"],
        },
      },
    };

    api.post.mockResolvedValueOnce(mockResponse);

    render(<MockLogin />);

    const emailInput = screen.getByPlaceholderText(/correo@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/);
    const submitButton = screen.getByRole("button", {
      name: /iniciar sesión/i,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/api/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  test("debe mostrar error si las credenciales son incorrectas", async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: "Credenciales inválidas" } },
    });

    render(<MockLogin />);

    const emailInput = screen.getByPlaceholderText(/correo@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/);
    const submitButton = screen.getByRole("button", {
      name: /iniciar sesión/i,
    });

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error al iniciar sesión/i)).toBeInTheDocument();
    });
  });
});
