// Etiquetas en español y opciones para los campos de tipo lista.

export const CATEGORIAS = [
  { valor: "ESTUDIANTE", etiqueta: "Estudiante" },
  { valor: "STAFF", etiqueta: "Staff" },
  { valor: "PRESTAMO", etiqueta: "Préstamo" },
  { valor: "DONACION", etiqueta: "Donación" },
  { valor: "FUERA_DE_STOCK", etiqueta: "Fuera de stock" },
];

export const SEDES = [
  { valor: "EL_HUERTO", etiqueta: "El Huerto (Puntarenas)" },
  { valor: "LA_IGLESIA", etiqueta: "La Iglesia (Desamparados)" },
  { valor: "NINGUNA", etiqueta: "Sin sede" },
];

export const DISPONIBILIDADES = [
  { valor: "DISPONIBLE", etiqueta: "Disponible" },
  { valor: "OCUPADA", etiqueta: "Ocupada" },
];

export const ESTADOS = [
  { valor: "EXCELENTE", etiqueta: "Excelente" },
  { valor: "BUENO", etiqueta: "Bueno" },
  { valor: "REGULAR", etiqueta: "Regular" },
  { valor: "MALO", etiqueta: "Malo" },
];

const mapear = (lista) => Object.fromEntries(lista.map((o) => [o.valor, o.etiqueta]));
export const ETIQUETA_CATEGORIA = mapear(CATEGORIAS);
export const ETIQUETA_SEDE = mapear(SEDES);
export const ETIQUETA_DISPONIBILIDAD = mapear(DISPONIBILIDADES);
export const ETIQUETA_ESTADO = mapear(ESTADOS);

// Textos que no cuentan como un nombre real de responsable (igual que en el backend).
const NOMBRE_PLACEHOLDERS = new Set(["n/a", "na", "ninguno", "ninguna", "no aplica", "-"]);
export function esNombreValido(v) {
  const t = (v || "").trim();
  if (!t) return false;
  return !NOMBRE_PLACEHOLDERS.has(t.toLowerCase());
}
