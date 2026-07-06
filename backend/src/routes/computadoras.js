// Rutas de computadoras. Todas requieren sesión iniciada.
import { Router } from "express";
import { prisma } from "../prismaClient.js";
import { requireAuth } from "../middleware/auth.js";

export const computadorasRouter = Router();

computadorasRouter.use(requireAuth);

// GET /api/computadoras  -> lista, con filtros opcionales por query string
// Ej: /api/computadoras?categoria=ESTUDIANTE&sede=EL_HUERTO&q=dell
computadorasRouter.get("/", async (req, res) => {
  const { categoria, sede, disponibilidad, q } = req.query;

  const where = {};
  if (categoria) where.categoria = categoria;
  if (sede) where.sede = sede;
  if (disponibilidad) where.disponibilidad = disponibilidad;
  if (q) {
    where.OR = [
      { marca: { contains: q, mode: "insensitive" } },
      { numeroSerie: { contains: q, mode: "insensitive" } },
      { asignadaA: { contains: q, mode: "insensitive" } },
      { ubicacion: { contains: q, mode: "insensitive" } },
    ];
  }

  const computadoras = await prisma.computadora.findMany({
    where,
    orderBy: { creadoEn: "desc" },
  });
  res.json({ computadoras });
});

// GET /api/computadoras/stats  -> resúmenes para el dashboard
computadorasRouter.get("/stats", async (_req, res) => {
  const [total, disponibles, ocupadas, bateriaBaja, passwordSinVerificar, porCategoria, porSede] =
    await Promise.all([
      prisma.computadora.count(),
      prisma.computadora.count({ where: { disponibilidad: "DISPONIBLE" } }),
      prisma.computadora.count({ where: { disponibilidad: "OCUPADA" } }),
      prisma.computadora.count({ where: { bateriaPct: { lt: 20 } } }),
      prisma.computadora.count({ where: { passwordVerificada: false } }),
      prisma.computadora.groupBy({ by: ["categoria"], _count: { _all: true } }),
      prisma.computadora.groupBy({ by: ["sede"], _count: { _all: true } }),
    ]);

  // Convierte los groupBy en objetos simples { CLAVE: cantidad }
  const catMap = Object.fromEntries(porCategoria.map((c) => [c.categoria, c._count._all]));
  const sedeMap = Object.fromEntries(porSede.map((s) => [s.sede, s._count._all]));

  res.json({
    total,
    disponibles,
    ocupadas,
    bateriaBaja,
    passwordSinVerificar,
    porCategoria: {
      ESTUDIANTE: catMap.ESTUDIANTE || 0,
      STAFF: catMap.STAFF || 0,
      PRESTAMO: catMap.PRESTAMO || 0,
      DONACION: catMap.DONACION || 0,
      FUERA_DE_STOCK: catMap.FUERA_DE_STOCK || 0,
    },
    porSede: {
      EL_HUERTO: sedeMap.EL_HUERTO || 0,
      LA_IGLESIA: sedeMap.LA_IGLESIA || 0,
      NINGUNA: sedeMap.NINGUNA || 0,
    },
  });
});

// ---- Validación de valores permitidos ----
const CATEGORIAS = ["ESTUDIANTE", "STAFF", "PRESTAMO", "DONACION", "FUERA_DE_STOCK"];
const SEDES = ["EL_HUERTO", "LA_IGLESIA", "NINGUNA"];
const DISPONIBILIDADES = ["DISPONIBLE", "OCUPADA"];
const ESTADOS = ["EXCELENTE", "BUENO", "REGULAR", "MALO"];

// Limpia y valida el cuerpo recibido para crear/editar una computadora.
function sanitizar(body = {}) {
  const txt = (v) => (v == null || String(v).trim() === "" ? null : String(v).trim());
  const enumOr = (v, lista, def) => (lista.includes(v) ? v : def);

  let bateria = null;
  if (body.bateriaPct !== "" && body.bateriaPct != null) {
    const n = Math.round(Number(body.bateriaPct));
    if (!Number.isNaN(n)) bateria = Math.max(0, Math.min(100, n));
  }

  return {
    marca: txt(body.marca) || "Sin marca",
    numeroSerie: txt(body.numeroSerie),
    categoria: enumOr(body.categoria, CATEGORIAS, "ESTUDIANTE"),
    sede: enumOr(body.sede, SEDES, "NINGUNA"),
    asignadaA: txt(body.asignadaA),
    disponibilidad: enumOr(body.disponibilidad, DISPONIBILIDADES, "DISPONIBLE"),
    estado: enumOr(body.estado, ESTADOS, "BUENO"),
    bateriaPct: bateria,
    ubicacion: txt(body.ubicacion),
    passwordVerificada: Boolean(body.passwordVerificada),
    tieneMouse: Boolean(body.tieneMouse),
    tieneTeclado: Boolean(body.tieneTeclado),
    tieneCargador: Boolean(body.tieneCargador),
    tieneAudifonos: Boolean(body.tieneAudifonos),
    motivoPrestamo: txt(body.motivoPrestamo),
    datosDonacion: txt(body.datosDonacion),
    comentarioDanio: txt(body.comentarioDanio),
    notas: txt(body.notas),
  };
}

// GET /api/computadoras/:id  -> una computadora
computadorasRouter.get("/:id", async (req, res) => {
  const comp = await prisma.computadora.findUnique({ where: { id: Number(req.params.id) } });
  if (!comp) return res.status(404).json({ error: "Computadora no encontrada" });
  res.json({ computadora: comp });
});

// POST /api/computadoras  -> crear
computadorasRouter.post("/", async (req, res) => {
  const datos = sanitizar(req.body);
  if (!datos.numeroSerie) {
    return res.status(400).json({ error: "El número de serie es obligatorio" });
  }
  try {
    const computadora = await prisma.computadora.create({ data: datos });
    res.status(201).json({ computadora });
  } catch (e) {
    if (e.code === "P2002") {
      return res.status(409).json({ error: "Ya existe una computadora con ese número de serie" });
    }
    throw e;
  }
});

// PUT /api/computadoras/:id  -> editar
computadorasRouter.put("/:id", async (req, res) => {
  const datos = sanitizar(req.body);
  if (!datos.numeroSerie) {
    return res.status(400).json({ error: "El número de serie es obligatorio" });
  }
  try {
    const computadora = await prisma.computadora.update({
      where: { id: Number(req.params.id) },
      data: datos,
    });
    res.json({ computadora });
  } catch (e) {
    if (e.code === "P2002") {
      return res.status(409).json({ error: "Ya existe una computadora con ese número de serie" });
    }
    if (e.code === "P2025") {
      return res.status(404).json({ error: "Computadora no encontrada" });
    }
    throw e;
  }
});

// DELETE /api/computadoras/:id  -> eliminar
computadorasRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.computadora.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (e) {
    if (e.code === "P2025") {
      return res.status(404).json({ error: "Computadora no encontrada" });
    }
    throw e;
  }
});
