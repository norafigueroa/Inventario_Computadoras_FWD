// Cliente único de Prisma reutilizado en toda la aplicación.
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
