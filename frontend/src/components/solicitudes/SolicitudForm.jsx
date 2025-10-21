import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Solicitudes.css";

const SolicitudForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    employeeId: "",
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/api/employees", {
        params: { limit: 100 },
      });
      setEmployees(response.data.data);
    } catch (err) {
      setError("Error al cargar empleados");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/api/solicitudes", formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-modal">
      <div className="form-modal-content">
        <h2>Nueva Solicitud</h2>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Empleado *</label>
            <select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un empleado</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creando..." : "Crear Solicitud"}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SolicitudForm;
