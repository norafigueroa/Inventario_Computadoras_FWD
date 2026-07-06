import { useCallback, useEffect, useState } from "react";
import { Search, Plus, Loader2, Laptop, Battery, Backpack, Mouse, Headphones, PlugZap } from "lucide-react";
import { apiFetch } from "../lib/api";
import {
  SEDES,
  DISPONIBILIDADES,
  CATEGORIAS,
  ETIQUETA_CATEGORIA,
  ETIQUETA_SEDE,
  ETIQUETA_DISPONIBILIDAD,
  ETIQUETA_ESTADO,
} from "../lib/constantes";
import ComputadoraModal from "./ComputadoraModal";

const ACCESORIOS_ICONOS = [
  { campo: "tieneBolso", icono: Backpack, titulo: "Bolso" },
  { campo: "tieneMouse", icono: Mouse, titulo: "Mouse" },
  { campo: "tieneAudifonos", icono: Headphones, titulo: "Audífonos" },
  { campo: "tieneCargador", icono: PlugZap, titulo: "Cargador" },
];

function AccesoriosIconos({ comp }) {
  return (
    <div className="accesorios-icons">
      {ACCESORIOS_ICONOS.map(({ campo, icono: Icono, titulo }) => (
        <span
          key={campo}
          title={titulo}
          className={`acc-ico ${comp[campo] ? "acc-si" : "acc-no"}`}
        >
          <Icono size={15} />
        </span>
      ))}
    </div>
  );
}

export default function TablaInventario({ categoriaFija = null }) {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [sede, setSede] = useState("");
  const [disp, setDisp] = useState("");
  const [categoria, setCategoria] = useState("");

  const [modal, setModal] = useState(null); // null | {} (nueva) | computadora

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (categoriaFija) params.set("categoria", categoriaFija);
      else if (categoria) params.set("categoria", categoria);
      if (sede) params.set("sede", sede);
      if (disp) params.set("disponibilidad", disp);
      if (q.trim()) params.set("q", q.trim());
      const data = await apiFetch(`/computadoras?${params.toString()}`);
      setLista(data.computadoras);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [categoriaFija, categoria, sede, disp, q]);

  useEffect(() => {
    const t = setTimeout(cargar, 250); // pequeño retraso para la búsqueda
    return () => clearTimeout(t);
  }, [cargar]);

  async function guardar(form) {
    if (form.id) await apiFetch(`/computadoras/${form.id}`, { method: "PUT", body: form });
    else await apiFetch("/computadoras", { method: "POST", body: form });
    setModal(null);
    cargar();
  }

  async function eliminar(comp) {
    if (!confirm(`¿Eliminar la computadora ${comp.numeroSerie}? Esta acción no se puede deshacer.`)) return;
    await apiFetch(`/computadoras/${comp.id}`, { method: "DELETE" });
    setModal(null);
    cargar();
  }

  const nueva = () => setModal(categoriaFija ? { categoria: categoriaFija } : {});

  return (
    <div>
      {/* Barra de herramientas */}
      <div className="toolbar">
        <div className="search">
          <Search size={18} />
          <input
            placeholder="Buscar por nombre, serie, marca o ubicación…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {!categoriaFija && (
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
          </select>
        )}
        <select value={sede} onChange={(e) => setSede(e.target.value)}>
          <option value="">Todas las sedes</option>
          {SEDES.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
        </select>
        <select value={disp} onChange={(e) => setDisp(e.target.value)}>
          <option value="">Disponibilidad</option>
          {DISPONIBILIDADES.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
        </select>

        <button className="btn btn-primary btn-auto" onClick={nueva}>
          <Plus size={18} /> Agregar
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {cargando ? (
        <div className="full-loader" style={{ minHeight: "40vh" }}>
          <Loader2 size={24} style={{ animation: "spin 0.7s linear infinite" }} /> Cargando…
        </div>
      ) : lista.length === 0 ? (
        <div className="placeholder-box">
          <span className="ic"><Laptop size={26} /></span>
          <h3>No hay computadoras</h3>
          <p>No se encontraron registros con estos filtros. Prueba con otra búsqueda o agrega una nueva.</p>
        </div>
      ) : (
        <>
          <div className="tabla-info">{lista.length} computadora{lista.length !== 1 ? "s" : ""}</div>
          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nº de serie</th>
                  <th>Marca</th>
                  {!categoriaFija && <th>Categoría</th>}
                  <th>Sede</th>
                  <th>Responsable</th>
                  <th>Disponibilidad</th>
                  <th>Estado</th>
                  <th>Batería</th>
                  <th>Accesorios</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((c) => (
                  <tr key={c.id} onClick={() => setModal(c)}>
                    <td className="mono">{c.numeroSerie}</td>
                    <td>{c.marca}</td>
                    {!categoriaFija && <td>{ETIQUETA_CATEGORIA[c.categoria]}</td>}
                    <td>{c.sede === "NINGUNA" ? "—" : ETIQUETA_SEDE[c.sede]}</td>
                    <td>{c.asignadaA || <span className="muted">Sin asignar</span>}</td>
                    <td>
                      <span className={`badge ${c.disponibilidad === "DISPONIBLE" ? "badge-green" : "badge-amber"}`}>
                        {ETIQUETA_DISPONIBILIDAD[c.disponibilidad]}
                      </span>
                    </td>
                    <td>
                      <span className={`badge estado-${c.estado.toLowerCase()}`}>{ETIQUETA_ESTADO[c.estado]}</span>
                    </td>
                    <td>
                      {c.bateriaPct == null ? "—" : (
                        <span className="bateria"><Battery size={15} /> {c.bateriaPct}%</span>
                      )}
                    </td>
                    <td><AccesoriosIconos comp={c} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modal && (
        <ComputadoraModal
          computadora={modal.id ? modal : modal}
          onCerrar={() => setModal(null)}
          onGuardar={guardar}
          onEliminar={eliminar}
        />
      )}
    </div>
  );
}
