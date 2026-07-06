import { Laptop, LayoutDashboard, Users, LogOut, Construction } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const iniciales = (usuario?.nombre || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <a className="nav-item active">
          <LayoutDashboard size={19} /> Inventario
        </a>
        <a className="nav-item">
          <Laptop size={19} /> Computadoras
        </a>
        <a className="nav-item">
          <Users size={19} /> Usuarios
        </a>
        <div className="sidebar-spacer" />
        <button className="nav-item" onClick={logout} style={{ background: "none", border: "1px solid transparent", width: "100%", textAlign: "left" }}>
          <LogOut size={19} /> Cerrar sesión
        </button>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1>Inventario de computadoras</h1>
          <div className="user-chip">
            <div className="user-meta">
              <div className="n">{usuario?.nombre}</div>
              <div className="r">{usuario?.rol}</div>
            </div>
            <div className="user-avatar">{iniciales}</div>
            <button className="btn-ghost" onClick={logout}>
              <LogOut size={16} /> Salir
            </button>
          </div>
        </header>

        <main className="content">
          <div className="placeholder-box">
            <span className="ic"><Construction size={28} /></span>
            <h3>Aquí vivirá el inventario</h3>
            <p>
              En la siguiente fase construiremos la tabla de computadoras con
              búsqueda, filtros y la opción de agregar, editar y eliminar equipos.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
