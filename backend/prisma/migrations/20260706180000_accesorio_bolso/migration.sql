-- Las laptops traen teclado integrado; se reemplaza ese campo por "bolso".
ALTER TABLE "Computadora" RENAME COLUMN "tieneTeclado" TO "tieneBolso";
