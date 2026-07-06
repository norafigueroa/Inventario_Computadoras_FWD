// Arranque del servidor para desarrollo local (`npm run dev`).
// En producción (Vercel), la app se sirve como función serverless desde api/index.js.
import { app } from "./app.js";

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API de Inventario FWD escuchando en http://localhost:${PORT}`);
});
