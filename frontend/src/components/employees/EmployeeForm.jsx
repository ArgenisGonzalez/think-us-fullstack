import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Employees.css";

const EmployeeForm = ({ employee, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    salary: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        position: employee.position || "",
        salary: employee.salary || "",
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (employee) {
        await api.put(`/api/employees/${employee.id}`, formData);
      } else {
        await api.post("/api/employees", formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar empleado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-modal">
      <div className="form-modal-content">
        <h2>{employee ? "Editar Empleado" : "Nuevo Empleado"}</h2>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Apellido *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Posición</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Salario</label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
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

export default EmployeeForm;
