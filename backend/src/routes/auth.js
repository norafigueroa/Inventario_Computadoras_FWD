// Rutas de autenticación: login y "quién soy".
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

// POST /api/auth/login  -> valida credenciales y devuelve un token
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos" });
  }

  const ok = await bcrypt.compare(password, usuario.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos" });
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  });
});

// GET /api/auth/me  -> devuelve los datos del usuario autenticado
authRouter.get("/me", requireAuth, async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.usuario.id },
    select: { id: true, nombre: true, email: true, rol: true },
  });
  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json({ usuario });
});
