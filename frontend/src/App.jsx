import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EnConstruccion from "./pages/EnConstruccion";
import TablaInventario from "./components/TablaInventario";
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
        <Route path="/inventario" element={<TablaInventario />} />
        <Route path="/estudiantes" element={<TablaInventario categoriaFija="ESTUDIANTE" />} />
        <Route path="/staff" element={<TablaInventario categoriaFija="STAFF" />} />
        <Route path="/prestamos" element={<TablaInventario categoriaFija="PRESTAMO" />} />
        <Route path="/donaciones" element={<TablaInventario categoriaFija="DONACION" />} />
        <Route path="/fuera-de-stock" element={<TablaInventario categoriaFija="FUERA_DE_STOCK" />} />
        <Route path="/usuarios" element={<EnConstruccion titulo="Usuarios" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
