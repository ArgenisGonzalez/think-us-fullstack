import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../../context/AuthContext";
import api from "../../../services/api";
import EmployeeList from "../EmployeeList";

jest.mock("../../../services/api");

const MockEmployeeList = () => (
  <BrowserRouter>
    <AuthProvider>
      <EmployeeList />
    </AuthProvider>
  </BrowserRouter>
);

describe("EmployeeList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("debe mostrar loading inicialmente", () => {
    api.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<MockEmployeeList />);

    expect(screen.getByText(/cargando empleados/i)).toBeInTheDocument();
  });

  test("debe renderizar la lista de empleados", async () => {
    const mockEmployees = {
      data: {
        data: [
          {
            id: 1,
            firstName: "Juan",
            lastName: "Pérez",
            email: "juan@example.com",
            position: "Desarrollador",
            salary: "3500.00",
          },
          {
            id: 2,
            firstName: "María",
            lastName: "García",
            email: "maria@example.com",
            position: "Diseñadora",
            salary: "3800.00",
          },
        ],
        pagination: {
          totalPages: 1,
          totalItems: 2,
        },
      },
    };

    api.get.mockResolvedValueOnce(mockEmployees);

    render(<MockEmployeeList />);

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
      expect(screen.getByText("María García")).toBeInTheDocument();
    });
  });

  test("debe mostrar error si falla la carga", async () => {
    api.get.mockRejectedValueOnce(new Error("Network error"));

    render(<MockEmployeeList />);

    await waitFor(() => {
      expect(
        screen.getByText(/error al cargar empleados/i)
      ).toBeInTheDocument();
    });
  });

  test("debe mostrar mensaje cuando no hay empleados", async () => {
    const mockEmptyResponse = {
      data: {
        data: [],
        pagination: {
          totalPages: 0,
          totalItems: 0,
        },
      },
    };

    api.get.mockResolvedValueOnce(mockEmptyResponse);

    render(<MockEmployeeList />);

    await waitFor(() => {
      expect(
        screen.getByText(/no se encontraron empleados/i)
      ).toBeInTheDocument();
    });
  });
});
