import { useEffect, useState } from "react";
import { Loader2, Backpack, Mouse, Headphones, PlugZap } from "lucide-react";
import { apiFetch } from "../lib/api";
import { ETIQUETA_CATEGORIA } from "../lib/constantes";

const ORDEN_CATEGORIAS = ["ESTUDIANTE", "STAFF", "PRESTAMO", "DONACION", "FUERA_DE_STOCK"];

const COLUMNAS = [
  { campo: "bolso", etiqueta: "Bolso", icono: Backpack },
  { campo: "mouse", etiqueta: "Mouse", icono: Mouse },
  { campo: "audifonos", etiqueta: "Audífonos", icono: Headphones },
  { campo: "cargador", etiqueta: "Cargador", icono: PlugZap },
];

function FilaResumen({ titulo, datos, destacada = false }) {
  return (
    <tr className={destacada ? "acc-fila-total" : undefined}>
      <td className="acc-fila-titulo">{titulo}</td>
      <td className="mono">{datos.total}</td>
      {COLUMNAS.map(({ campo }) => (
        <td key={campo}>
          {datos[campo]}{" "}
          <span className="muted">/ {datos.total}</span>
        </td>
      ))}
    </tr>
  );
}

export default function Accesorios() {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/computadoras/resumen-accesorios")
      .then(setResumen)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert-error">{error}</div>;
  if (!resumen) {
    return (
      <div className="full-loader" style={{ minHeight: "50vh" }}>
        <Loader2 size={26} style={{ animation: "spin 0.7s linear infinite" }} />
        <span>Cargando resumen…</span>
      </div>
    );
  }

  return (
    <div>
      <p className="section-hint">
        Existencias de accesorios por cada categoría del inventario (opciones del menú).
      </p>

      {/* Tarjetas totales generales */}
      <div className="stat-grid">
        {COLUMNAS.map(({ campo, etiqueta, icono: Icono }) => (
          <div className="stat-card" key={campo}>
            <div className="stat-icon tone-accent">
              <Icono size={22} />
            </div>
            <div className="stat-body">
              <div className="stat-value">{resumen.general[campo]}</div>
              <div className="stat-label">{etiqueta} (de {resumen.general.total})</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="block-title">Detalle por categoría</h2>
      <div className="tabla-wrap">
        <table className="tabla">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Total</th>
              {COLUMNAS.map(({ campo, etiqueta }) => (
                <th key={campo}>{etiqueta}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ORDEN_CATEGORIAS.map((cat) => (
              <FilaResumen key={cat} titulo={ETIQUETA_CATEGORIA[cat]} datos={resumen.porCategoria[cat]} />
            ))}
            <FilaResumen titulo="Inventario completo" datos={resumen.general} destacada />
          </tbody>
        </table>
      </div>
    </div>
  );
}
