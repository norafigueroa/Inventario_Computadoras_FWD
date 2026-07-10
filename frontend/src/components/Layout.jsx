import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Laptop,
  GraduationCap,
  Briefcase,
  Repeat,
  Gift,
  Wrench,
  Backpack,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/inventario", label: "Inventario completo", icon: Laptop },
  { to: "/estudiantes", label: "Estudiantes", icon: GraduationCap },
  { to: "/staff", label: "Staff", icon: Briefcase },
  { to: "/prestamos", label: "Préstamos", icon: Repeat },
  { to: "/donaciones", label: "Donaciones", icon: Gift },
  { to: "/fuera-de-stock", label: "Fuera de stock", icon: Wrench },
  { to: "/accesorios", label: "Accesorios", icon: Backpack },
];

export default function Layout() {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cierra el menú móvil automáticamente al cambiar de página.
  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  const activo =
    NAV_ITEMS.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))) ||
    (location.pathname.startsWith("/usuarios") ? { label: "Usuarios" } : null);
  const titulo = activo?.label || "Inventario";

  const iniciales = (usuario?.nombre || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="app-shell">
      {menuAbierto && <div className="sidebar-backdrop" onClick={() => setMenuAbierto(false)} />}

      <aside className={`sidebar ${menuAbierto ? "sidebar-open" : ""}`}>
        <div className="sidebar-head">
          <Logo />
          <button className="icon-btn sidebar-close" onClick={() => setMenuAbierto(false)} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>
        <nav className="nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-item">
              <Icon size={19} /> {label}
            </NavLink>
          ))}
          <div className="nav-sep" />
          <NavLink to="/usuarios" className="nav-item">
            <Users size={19} /> Usuarios
          </NavLink>
        </nav>
        <div className="sidebar-spacer" />
        <button className="nav-item nav-logout" onClick={logout}>
          <LogOut size={19} /> Cerrar sesión
        </button>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn hamburger-btn" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">
              <Menu size={22} />
            </button>
            <h1>{titulo}</h1>
          </div>
          <div className="user-chip">
            <div className="user-meta">
              <div className="n">{usuario?.nombre}</div>
              <div className="r">{usuario?.rol}</div>
            </div>
            <div className="user-avatar">{iniciales}</div>
            <button className="btn-ghost btn-salir-texto" onClick={logout}>
              <LogOut size={16} /> <span>Salir</span>
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
