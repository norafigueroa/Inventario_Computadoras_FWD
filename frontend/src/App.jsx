import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EnConstruccion from "./pages/EnConstruccion";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventario" element={<EnConstruccion titulo="Inventario completo" />} />
        <Route path="/estudiantes" element={<EnConstruccion titulo="Estudiantes" />} />
        <Route path="/staff" element={<EnConstruccion titulo="Staff" />} />
        <Route path="/prestamos" element={<EnConstruccion titulo="Préstamos" />} />
        <Route path="/donaciones" element={<EnConstruccion titulo="Donaciones" />} />
        <Route path="/fuera-de-stock" element={<EnConstruccion titulo="Fuera de stock" />} />
        <Route path="/usuarios" element={<EnConstruccion titulo="Usuarios" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
