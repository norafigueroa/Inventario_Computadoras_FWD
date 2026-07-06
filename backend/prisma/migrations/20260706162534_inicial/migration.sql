-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('ESTUDIANTE', 'STAFF', 'PRESTAMO', 'DONACION', 'FUERA_DE_STOCK');

-- CreateEnum
CREATE TYPE "Sede" AS ENUM ('EL_HUERTO', 'LA_IGLESIA', 'NINGUNA');

-- CreateEnum
CREATE TYPE "Disponibilidad" AS ENUM ('DISPONIBLE', 'OCUPADA');

-- CreateEnum
CREATE TYPE "EstadoComputadora" AS ENUM ('EXCELENTE', 'BUENO', 'REGULAR', 'MALO');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'STAFF');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'ADMIN',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Computadora" (
    "id" SERIAL NOT NULL,
    "marca" TEXT NOT NULL,
    "numeroSerie" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL DEFAULT 'ESTUDIANTE',
    "sede" "Sede" NOT NULL DEFAULT 'NINGUNA',
    "asignadaA" TEXT,
    "disponibilidad" "Disponibilidad" NOT NULL DEFAULT 'DISPONIBLE',
    "estado" "EstadoComputadora" NOT NULL DEFAULT 'BUENO',
    "bateriaPct" INTEGER,
    "ubicacion" TEXT,
    "passwordVerificada" BOOLEAN NOT NULL DEFAULT false,
    "passwordVerificadaFecha" TIMESTAMP(3),
    "tieneMouse" BOOLEAN NOT NULL DEFAULT false,
    "tieneTeclado" BOOLEAN NOT NULL DEFAULT false,
    "tieneCargador" BOOLEAN NOT NULL DEFAULT false,
    "tieneAudifonos" BOOLEAN NOT NULL DEFAULT false,
    "motivoPrestamo" TEXT,
    "datosDonacion" TEXT,
    "comentarioDanio" TEXT,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Computadora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Computadora_numeroSerie_key" ON "Computadora"("numeroSerie");
