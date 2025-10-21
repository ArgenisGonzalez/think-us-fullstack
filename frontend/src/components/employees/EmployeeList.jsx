import { lazy, Suspense, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./Employees.css";

const EmployeeForm = lazy(() => import("./EmployeeForm"));

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchEmployees();
  }, [page, search]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/employees", {
        params: { page, limit: 10, search },
      });
      setEmployees(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setError("");
    } catch (err) {
      setError("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este empleado?")) return;

    try {
      await api.delete(`/api/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      setError("Error al eliminar empleado");
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEmployee(null);
    fetchEmployees();
  };

  if (loading && page === 1) {
    return <div className="loading">Cargando empleados...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Empleados</h1>
        {isAdmin() && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Nuevo Empleado
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-box">
        <input
          type="text"
          placeholder="Buscar por nombre, email o posición..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {showForm && (
        <Suspense fallback={<div>Cargando formulario...</div>}>
          <EmployeeForm
            employee={editingEmployee}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingEmployee(null);
            }}
          />
        </Suspense>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Posición</th>
              {isAdmin() && <th>Salario</th>}
              {isAdmin() && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>
                  {employee.firstName} {employee.lastName}
                </td>
                <td>{employee.email || "N/A"}</td>
                <td>{employee.position || "N/A"}</td>
                {isAdmin() && (
                  <td>{employee.salary ? `$${employee.salary}` : "N/A"}</td>
                )}
                {isAdmin() && (
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(employee)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(employee.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn-pagination"
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="btn-pagination"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
