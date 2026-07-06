// Importación única de las computadoras del Excel a la base de datos.
// Lee _datos_migracion.json (generado desde el Google Sheet) y crea los registros.
//
// Estrategia:
// - Lista base: pestaña "Inventario Completo" (identificador = número de serie).
// - NOMBRES REALES, marca detallada, estado, accesorios y comentario de daño:
//   se toman de las pestañas de grupo (más completas y confiables), cruzando por serie.
// - La pestaña "Computadoras en préstamo" tiene las columnas desordenadas, así que
//   de ahí solo se usa el nombre; los detalles salen de "Inventario Completo".
import fs from "fs";
import { prisma } from "../src/prismaClient.js";

const JSON_PATH = new URL("../../_datos_migracion.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8").replace(/^﻿/, ""));

const norm = (s) => (s == null ? "" : String(s).trim());
const serieKey = (s) => norm(s).toUpperCase().replace(/\s+/g, "");
const findCol = (cols, re) => cols.find((c) => re.test(c));

// Interpreta accesorios: "1"/"1.0" = sí, "0"/"0.0" = no
const numFlag = (v) => { const n = parseFloat(norm(v).replace(",", ".")); return Number.isNaN(n) ? null : n > 0; };
// Interpreta "Sí/si/No" de la pregunta "¿Cuenta con...?"
const esSi = (v) => /^(s|x)/i.test(norm(v));

// ---------- Info desde las pestañas de grupo ----------
const catHoja = {
  "GRUPO IGLESIA": { cat: "ESTUDIANTE", sede: "LA_IGLESIA" },
  "Grupo El Huerto": { cat: "ESTUDIANTE", sede: "EL_HUERTO" },
  "Computadoras Staff": { cat: "STAFF", sede: "NINGUNA" },
  "Computadoras en préstamo": { cat: "PRESTAMO", sede: "NINGUNA" },
  "Computadoras donación": { cat: "DONACION", sede: "NINGUNA" },
  "Computadoras fuera de stock (re": { cat: "FUERA_DE_STOCK", sede: "NINGUNA" },
};
const prio = { FUERA_DE_STOCK: 5, PRESTAMO: 4, DONACION: 3, STAFF: 2, ESTUDIANTE: 1 };

const infoCat = new Map();
for (const hoja of Object.keys(catHoja)) {
  const d = data[hoja];
  if (!d) continue;
  const cS = findCol(d.columnas, /serie/i);
  const cResp = findCol(d.columnas, /responsable/i);
  const cMarca = d.columnas.find((c) => /^marca$/i.test(c)) || d.columnas.find((c) => /marca/i.test(c) && !/temporal/i.test(c));
  const cEstado = findCol(d.columnas, /estado de computadora/i);
  const cBat = findCol(d.columnas, /bater/i);
  const cDanio = findCol(d.columnas, /mal estado/i);
  const cMouse = findCol(d.columnas, /^mouse/i);
  const cAud = findCol(d.columnas, /^audifonos/i) || findCol(d.columnas, /audifonos\s*$/i);
  const cCuenta = findCol(d.columnas, /cuenta con/i);
  for (const fila of d.filas) {
    const s = serieKey(fila[cS]);
    if (!s) continue;
    const nuevo = catHoja[hoja];
    const prev = infoCat.get(s);
    const registro = {
      cat: nuevo.cat,
      sede: nuevo.sede,
      hoja,
      nombre: cResp ? norm(fila[cResp]) : "",
      marca: cMarca ? norm(fila[cMarca]) : "",
      estado: cEstado ? norm(fila[cEstado]) : "",
      bateria: cBat ? norm(fila[cBat]) : "",
      danio: cDanio ? norm(fila[cDanio]) : "",
      mouse: cMouse ? numFlag(fila[cMouse]) : null,
      audifonos: cAud ? numFlag(fila[cAud]) : null,
      cuenta: cCuenta ? norm(fila[cCuenta]) : "",
    };
    if (!prev || prio[nuevo.cat] > prio[prev.cat]) infoCat.set(s, registro);
  }
}

// ---------- Helpers de mapeo ----------
function mapEstado(txt) {
  const t = norm(txt).toLowerCase();
  if (!t) return null;
  if (t.includes("excelente")) return "EXCELENTE";
  if (t.includes("buen")) return "BUENO";
  if (t.includes("regular")) return "REGULAR";
  if (t.includes("mal") || t.includes("repuesto")) return "MALO";
  return null;
}
function mapBateria(txt) {
  const n = parseFloat(norm(txt).replace("%", "").replace(",", "."));
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}
function mapPassword(txt) {
  const v = norm(txt);
  if (!v) return { verificada: false, fecha: null };
  const n = parseFloat(v.replace(",", "."));
  if (!Number.isNaN(n) && n > 40000 && n < 60000) {
    return { verificada: true, fecha: new Date(Date.UTC(1899, 11, 30) + n * 86400000) };
  }
  if (/^(no|n\/a|pendiente|falta)/i.test(v)) return { verificada: false, fecha: null };
  return { verificada: true, fecha: null };
}
const esNombreReal = (r) => {
  const v = norm(r);
  if (!v) return false;
  return !/^(n\/a|na|ad|donaci|en reparaci|no aplica|computadora )/i.test(v);
};

// ---------- Inventario Completo = lista base + detalles ----------
const inv = data["Inventario Completo"];
const cSerie = findCol(inv.columnas, /serie/i);
const cResp = findCol(inv.columnas, /responsable/i);
const cMarca = inv.columnas.find((c) => /^marca$/i.test(c)) || inv.columnas.find((c) => /marca/i.test(c) && !/temporal/i.test(c));
const cLugar = findCol(inv.columnas, /lugar/i);
const cEstado = findCol(inv.columnas, /estado de computadora/i);
const cBat = findCol(inv.columnas, /bater/i);
const cAccBulto = findCol(inv.columnas, /accesorios en bulto/i);
const cAccPregunta = findCol(inv.columnas, /cuenta con/i);
const cAccFalta = findCol(inv.columnas, /no pren?sentar|no presentar/i);
const cPass = findCol(inv.columnas, /contrase/i);

const BASURA = new Set(["AUDIFONOS", "23.0", "23", "8C8D"]);

function construir(serie, fila) {
  const info = infoCat.get(serie);
  const confiable = info && info.cat !== "PRESTAMO"; // el préstamo tiene columnas desordenadas
  const lugar = norm(fila?.[cLugar]);
  const respInv = norm(fila?.[cResp]);
  const lugarL = lugar.toLowerCase();

  let categoria = "ESTUDIANTE";
  let sede = "NINGUNA";
  let asignadaA = null;
  let disponibilidad = "DISPONIBLE";
  let comentarioDanio = null;
  let datosDonacion = null;
  const notas = [];

  const nombreReal = info && esNombreReal(info.nombre) ? info.nombre : null;

  if (/en reparaci/i.test(respInv) || (info && info.cat === "FUERA_DE_STOCK")) {
    categoria = "FUERA_DE_STOCK";
    comentarioDanio = (info && info.danio) || (/en reparaci/i.test(respInv) ? "En reparación" : null);
  } else if (/donaci/i.test(respInv) || (info && info.cat === "DONACION")) {
    categoria = "DONACION";
    datosDonacion = /funda|fundaci/i.test(respInv + " " + (info?.nombre || "")) ? "Donación Fundación" : (info?.nombre || respInv || "Donación");
  } else if (lugarL.includes("san jos") || lugar.toUpperCase() === "AD") {
    categoria = "ESTUDIANTE";
    disponibilidad = "DISPONIBLE";
    notas.push(`Ubicación original en Excel: "${lugar}". Por confirmar clasificación.`);
  } else if (info) {
    categoria = info.cat;
    sede = info.sede;
    if (nombreReal) { asignadaA = nombreReal; disponibilidad = "OCUPADA"; }
  } else {
    if (lugarL.includes("iglesia")) { categoria = "ESTUDIANTE"; sede = "LA_IGLESIA"; }
    else if (lugarL.includes("puntarena")) { categoria = "ESTUDIANTE"; sede = "EL_HUERTO"; }
    else if (lugarL.includes("staff")) categoria = "STAFF";
    else if (lugarL.includes("préstamo") || lugarL.includes("prestamo")) categoria = "PRESTAMO";
    else if (lugar) notas.push(`Ubicación original en Excel: "${lugar}".`);
    if (esNombreReal(respInv)) { asignadaA = respInv; disponibilidad = "OCUPADA"; }
  }

  if (info?.danio && !comentarioDanio) comentarioDanio = info.danio;

  // Marca: para Staff se prefiere el modelo detallado de la pestaña de grupo
  let marca;
  if (categoria === "STAFF" && info?.marca) marca = info.marca;
  else marca = norm(fila?.[cMarca]) || info?.marca || "";

  // Estado: se prefiere el de la pestaña de grupo (salvo préstamo)
  let estado = (confiable && mapEstado(info.estado)) || mapEstado(fila?.[cEstado]) || "BUENO";

  // Batería: la del grupo si es válida, si no la de Inventario
  let bateriaPct = confiable ? mapBateria(info.bateria) : null;
  if (bateriaPct == null) bateriaPct = mapBateria(fila?.[cBat]);

  const { verificada, fecha } = mapPassword(fila?.[cPass]);

  // Accesorios: columnas Mouse/Audífonos de la pestaña de grupo, o la pregunta "¿Cuenta con...?"
  const cuentaTxt = info?.cuenta || norm(fila?.[cAccPregunta]);
  const cuentaTodos = esSi(cuentaTxt);
  const tieneMouse = info?.mouse ?? cuentaTodos;
  const tieneAudifonos = info?.audifonos ?? cuentaTodos;
  const tieneCargador = cuentaTodos;

  const accBulto = norm(fila?.[cAccBulto]);
  if (accBulto) notas.push(`Accesorios en bulto: ${accBulto}`);
  const accFalta = norm(fila?.[cAccFalta]);
  if (accFalta) notas.push(`Falta explicado: ${accFalta}`);

  return {
    marca,
    numeroSerie: norm(fila?.[cSerie]) || serie,
    categoria,
    sede,
    asignadaA,
    disponibilidad,
    estado,
    bateriaPct,
    ubicacion: lugar || null,
    passwordVerificada: verificada,
    passwordVerificadaFecha: fecha,
    // El bolso no existía en el Excel. Por defecto se asume que sí lo llevan
    // las computadoras de Estudiante/Staff/Préstamo; Donación y Fuera de stock no.
    tieneBolso: ["ESTUDIANTE", "STAFF", "PRESTAMO"].includes(categoria),
    tieneMouse,
    tieneCargador,
    tieneAudifonos,
    motivoPrestamo: null,
    datosDonacion,
    comentarioDanio,
    notas: notas.length ? notas.join(" | ") : null,
  };
}

async function main() {
  const registros = [];
  const vistos = new Set();
  let descartadas = 0;

  const filaInvPorSerie = new Map();
  for (const f of inv.filas) {
    const s = serieKey(f[cSerie]);
    if (s && !filaInvPorSerie.has(s)) filaInvPorSerie.set(s, f);
  }

  const todasSeries = new Set([...filaInvPorSerie.keys(), ...infoCat.keys()]);

  for (const s of todasSeries) {
    if (!s || BASURA.has(s) || /^\d+(\.\d+)?$/.test(s)) { descartadas++; continue; }
    if (vistos.has(s)) continue;
    vistos.add(s);
    registros.push(construir(s, filaInvPorSerie.get(s)));
  }

  console.log(`Series únicas: ${todasSeries.size} | descartadas: ${descartadas} | a importar: ${registros.length}`);

  await prisma.computadora.deleteMany();
  await prisma.computadora.createMany({ data: registros });

  const porCat = {};
  registros.forEach((r) => (porCat[r.categoria] = (porCat[r.categoria] || 0) + 1));
  console.log("Por categoría:", porCat);
  console.log(`Con nombre asignado: ${registros.filter((r) => r.asignadaA).length}`);
  console.log(`Total en la base: ${await prisma.computadora.count()}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
