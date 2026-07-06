import { useState } from "react";
import { X, Save, Trash2, Loader2, AlertCircle } from "lucide-react";
import { CATEGORIAS, SEDES, DISPONIBILIDADES, ESTADOS } from "../lib/constantes";

const VACIA = {
  marca: "",
  numeroSerie: "",
  categoria: "ESTUDIANTE",
  sede: "NINGUNA",
  asignadaA: "",
  disponibilidad: "DISPONIBLE",
  estado: "BUENO",
  bateriaPct: "",
  ubicacion: "",
  passwordVerificada: false,
  tieneMouse: false,
  tieneTeclado: false,
  tieneCargador: false,
  tieneAudifonos: false,
  motivoPrestamo: "",
  datosDonacion: "",
  comentarioDanio: "",
  notas: "",
};

export default function ComputadoraModal({ computadora, onCerrar, onGuardar, onEliminar }) {
  const esNueva = !computadora?.id;
  const [form, setForm] = useState({ ...VACIA, ...(computadora || {}), bateriaPct: computadora?.bateriaPct ?? "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const set = (campo) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [campo]: v }));
  };

  async function guardar(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await onGuardar(form);
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={onCerrar}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h3>{esNueva ? "Agregar computadora" : "Editar computadora"}</h3>
          <button className="icon-btn" onClick={onCerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={guardar} className="modal-body">
          {error && (
            <div className="alert-error">
              <AlertCircle size={18} /> <span>{error}</span>
            </div>
          )}

          <div className="form-grid">
            <div className="field">
              <label>Número de serie *</label>
              <input value={form.numeroSerie} onChange={set("numeroSerie")} required />
            </div>
            <div className="field">
              <label>Marca</label>
              <input value={form.marca} onChange={set("marca")} placeholder="Dell, HP, Lenovo…" />
            </div>
            <div className="field">
              <label>Categoría</label>
              <select value={form.categoria} onChange={set("categoria")}>
                {CATEGORIAS.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Sede</label>
              <select value={form.sede} onChange={set("sede")}>
                {SEDES.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Asignada a (responsable)</label>
              <input value={form.asignadaA || ""} onChange={set("asignadaA")} placeholder="Nombre de la persona" />
            </div>
            <div className="field">
              <label>Disponibilidad</label>
              <select value={form.disponibilidad} onChange={set("disponibilidad")}>
                {DISPONIBILIDADES.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Estado de la computadora</label>
              <select value={form.estado} onChange={set("estado")}>
                {ESTADOS.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Batería (%)</label>
              <input type="number" min="0" max="100" value={form.bateriaPct} onChange={set("bateriaPct")} />
            </div>
            <div className="field field-full">
              <label>Lugar donde se encuentra</label>
              <input value={form.ubicacion || ""} onChange={set("ubicacion")} />
            </div>
          </div>

          {/* Campos según categoría */}
          {form.categoria === "PRESTAMO" && (
            <div className="field field-full">
              <label>Motivo del préstamo</label>
              <input value={form.motivoPrestamo || ""} onChange={set("motivoPrestamo")} placeholder="Trabajo, curso de inglés…" />
            </div>
          )}
          {form.categoria === "DONACION" && (
            <div className="field field-full">
              <label>Datos de la donación</label>
              <input value={form.datosDonacion || ""} onChange={set("datosDonacion")} placeholder="Quién donó, fecha…" />
            </div>
          )}
          {form.categoria === "FUERA_DE_STOCK" && (
            <div className="field field-full">
              <label>Comentario del daño</label>
              <input value={form.comentarioDanio || ""} onChange={set("comentarioDanio")} placeholder="Descripción del problema" />
            </div>
          )}

          {/* Accesorios */}
          <div className="field field-full">
            <label>Accesorios</label>
            <div className="checks">
              <label className="check"><input type="checkbox" checked={form.tieneMouse} onChange={set("tieneMouse")} /> Mouse</label>
              <label className="check"><input type="checkbox" checked={form.tieneTeclado} onChange={set("tieneTeclado")} /> Teclado</label>
              <label className="check"><input type="checkbox" checked={form.tieneCargador} onChange={set("tieneCargador")} /> Cargador</label>
              <label className="check"><input type="checkbox" checked={form.tieneAudifonos} onChange={set("tieneAudifonos")} /> Audífonos</label>
              <label className="check"><input type="checkbox" checked={form.passwordVerificada} onChange={set("passwordVerificada")} /> Contraseña verificada</label>
            </div>
          </div>

          <div className="field field-full">
            <label>Notas</label>
            <textarea rows="2" value={form.notas || ""} onChange={set("notas")} />
          </div>

          <footer className="modal-foot">
            {!esNueva && (
              <button type="button" className="btn btn-danger" onClick={() => onEliminar(computadora)}>
                <Trash2 size={17} /> Eliminar
              </button>
            )}
            <div className="modal-foot-right">
              <button type="button" className="btn btn-ghost" onClick={onCerrar}>Cancelar</button>
              <button type="submit" className="btn btn-primary btn-auto" disabled={guardando}>
                {guardando ? <><Loader2 size={17} style={{ animation: "spin 0.7s linear infinite" }} /> Guardando…</> : <><Save size={17} /> Guardar</>}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
