// Punto de entrada del backend: crea el servidor Express y monta las rutas.
import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { computadorasRouter } from "./routes/computadoras.js";

const app = express();

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API de Inventario FWD escuchando en http://localhost:${PORT}`);
});
