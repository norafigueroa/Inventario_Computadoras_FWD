// Middleware que protege rutas: exige un token JWT válido en el header
// "Authorization: Bearer <token>". Si es válido, agrega req.usuario.
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, email, rol }
    next();
  } catch {
    return res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}
