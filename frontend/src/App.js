import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./components/auth/Login";
import Navbar from "./components/layout/Navbar";
import PrivateRoute from "./components/layout/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

const Register = lazy(() => import("./components/auth/Register"));
const EmployeeList = lazy(() => import("./components/employees/EmployeeList"));
const SolicitudList = lazy(() =>
  import("./components/solicitudes/SolicitudList")
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<div className="loading">Cargando...</div>}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                  path="/employees"
                  element={
                    <PrivateRoute>
                      <EmployeeList />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/solicitudes"
                  element={
                    <PrivateRoute>
                      <SolicitudList />
                    </PrivateRoute>
                  }
                />

                <Route path="/" element={<Navigate to="/employees" />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
