// Configura la aplicación Express (rutas, middlewares) sin arrancar el servidor.
// Se reutiliza tanto en desarrollo local (src/index.js) como en Vercel (api/index.js).
import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { computadorasRouter } from "./routes/computadoras.js";

export const app = express();

app.use(cors());
app.use(express.json());

// Ruta de salud: sirve para comprobar que el servidor está vivo.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, servicio: "Inventario FWD API", hora: new Date().toISOString() });
});

// Rutas de autenticación (login)
app.use("/api/auth", authRouter);

// Rutas de computadoras (inventario y estadísticas)
app.use("/api/computadoras", computadorasRouter);
