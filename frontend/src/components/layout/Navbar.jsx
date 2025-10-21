import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Think-US
        </Link>

        {user && (
          <div className="navbar-menu">
            <Link to="/employees" className="navbar-link">
              Empleados
            </Link>
            <Link to="/solicitudes" className="navbar-link">
              Solicitudes
            </Link>
            <span className="navbar-user">
              {user.firstName} {user.lastName} ({user.roles?.[0]})
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
