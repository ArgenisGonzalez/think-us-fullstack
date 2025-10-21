import { lazy, Suspense, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./Solicitudes.css";

const SolicitudForm = lazy(() => import("./SolicitudForm"));

const SolicitudList = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchSolicitudes();
  }, [page, search, statusFilter]);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/solicitudes", {
        params: { page, limit: 10, search, status: statusFilter },
      });
      setSolicitudes(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setError("");
    } catch (err) {
      setError("Error al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta solicitud?")) return;

    try {
      await api.delete(`/api/solicitudes/${id}`);
      fetchSolicitudes();
    } catch (err) {
      setError("Error al eliminar solicitud");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchSolicitudes();
  };

  if (loading && page === 1) {
    return <div className="loading">Cargando solicitudes...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Solicitudes</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Nueva Solicitud
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por título o descripción..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="status-filter"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {showForm && (
        <Suspense fallback={<div>Cargando formulario...</div>}>
          <SolicitudForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </Suspense>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Descripción</th>
              <th>Empleado</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((solicitud) => (
              <tr key={solicitud.id}>
                <td>{solicitud.title}</td>
                <td>{solicitud.description || "N/A"}</td>
                <td>
                  {solicitud.employee
                    ? `${solicitud.employee.firstName} ${solicitud.employee.lastName}`
                    : "N/A"}
                </td>
                <td>
                  <span className={`status-badge status-${solicitud.status}`}>
                    {solicitud.status}
                  </span>
                </td>
                <td>{new Date(solicitud.createdAt).toLocaleDateString()}</td>
                <td>
                  {isAdmin() && (
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(solicitud.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
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

export default SolicitudList;
