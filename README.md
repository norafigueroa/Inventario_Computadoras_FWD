# Inventario de Computadoras - FWD Costa Rica

Sistema web para centralizar el inventario de computadoras de FWD Costa Rica,
que reemplaza el control que hoy se lleva en un Google Sheet.

## ¿Qué resuelve?

FWD presta una computadora a cada estudiante durante su curso de 6 meses (además
de a personal de staff, préstamos puntuales y donaciones). Este sistema centraliza
todo ese inventario en un solo lugar, con acceso web y login.

## Arquitectura

- **Frontend:** React + Vite (`/frontend`)
- **Backend:** Node.js + Express (`/backend`)
- **Base de datos:** PostgreSQL en Supabase (gestionada con Prisma)
- **Autenticación:** login propio con JWT

## Modelo de datos

Una tabla central de **computadoras** con: marca, número de serie, categoría
(Estudiante · Staff · Préstamo · Donación · Fuera de stock), sede (El Huerto ·
La Iglesia), responsable actual, disponibilidad, estado, batería, ubicación,
accesorios (mouse, teclado, cargador, audífonos) y campos según categoría
(motivo de préstamo, datos de donación, comentario del daño).

## Cómo correr el proyecto (desarrollo)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # completar DATABASE_URL y JWT_SECRET
npm run dev            # http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Estado del proyecto

- [x] Fase 1 — Base del proyecto (estructura, backend + frontend iniciales)
- [ ] Fase 2 — Base de datos (Supabase + tablas)
- [ ] Fase 3 — Login
- [ ] Fase 4 — CRUD de computadoras
- [ ] Fase 5 — Migración de datos del Excel
- [ ] Fase 6 — Despliegue
