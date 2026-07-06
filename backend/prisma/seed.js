// Crea (o actualiza) el usuario administrador inicial a partir de las
// variables ADMIN_* del archivo .env. La contraseña se guarda hasheada.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/prismaClient.js";

async function main() {
  const nombre = process.env.ADMIN_NOMBRE;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Faltan ADMIN_EMAIL o ADMIN_PASSWORD en el archivo .env");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: { nombre, passwordHash, rol: "ADMIN" },
    create: { nombre, email, passwordHash, rol: "ADMIN" },
  });

  console.log(`Usuario administrador listo: ${usuario.email} (rol: ${usuario.rol})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
