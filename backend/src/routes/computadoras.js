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
