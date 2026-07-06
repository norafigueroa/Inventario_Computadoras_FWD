import { useEffect, useState } from "react";
import {
  Laptop,
  CircleCheck,
  CircleDot,
  BatteryLow,
  KeyRound,
  GraduationCap,
  Briefcase,
  Repeat,
  Gift,
  Wrench,
  MapPin,
  Loader2,
} from "lucide-react";
import { apiFetch } from "../lib/api";

function StatCard({ icon: Icon, label, value, tone = "accent" }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon tone-${tone}`}>
        <Icon size={22} />
      </div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/computadoras/stats")
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="alert-error">{error}</div>;
  }

  if (!stats) {
    return (
      <div className="full-loader" style={{ minHeight: "50vh" }}>
        <Loader2 size={26} style={{ animation: "spin 0.7s linear infinite" }} />
        <span>Cargando estadísticas…</span>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <p className="section-hint">Resumen general del inventario de computadoras.</p>

      {/* Métricas principales */}
      <div className="stat-grid">
        <StatCard icon={Laptop} label="Total de computadoras" value={stats.total} tone="accent" />
        <StatCard icon={CircleCheck} label="Disponibles" value={stats.disponibles} tone="success" />
        <StatCard icon={CircleDot} label="Ocupadas" value={stats.ocupadas} tone="warning" />
        <StatCard icon={Wrench} label="Fuera de stock" value={stats.porCategoria.FUERA_DE_STOCK} tone="danger" />
      </div>

      {/* Por categoría */}
      <h2 className="block-title">Por categoría</h2>
      <div className="stat-grid">
        <StatCard icon={GraduationCap} label="Estudiantes" value={stats.porCategoria.ESTUDIANTE} />
        <StatCard icon={Briefcase} label="Staff" value={stats.porCategoria.STAFF} />
        <StatCard icon={Repeat} label="Préstamos" value={stats.porCategoria.PRESTAMO} />
        <StatCard icon={Gift} label="Donaciones" value={stats.porCategoria.DONACION} />
      </div>

      {/* Por sede + alertas */}
      <div className="dash-columns">
        <div>
          <h2 className="block-title">Por sede</h2>
          <div className="stat-grid two">
            <StatCard icon={MapPin} label="El Huerto (Puntarenas)" value={stats.porSede.EL_HUERTO} />
            <StatCard icon={MapPin} label="La Iglesia (Desamparados)" value={stats.porSede.LA_IGLESIA} />
          </div>
        </div>
        <div>
          <h2 className="block-title">Alertas</h2>
          <div className="stat-grid two">
            <StatCard icon={BatteryLow} label="Batería baja (menos de 20%)" value={stats.bateriaBaja} tone="warning" />
            <StatCard icon={KeyRound} label="Contraseña sin verificar" value={stats.passwordSinVerificar} tone="danger" />
          </div>
        </div>
      </div>
    </div>
  );
}
