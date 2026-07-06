// Maneja el estado de sesión (usuario logueado) en toda la app.
import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, setToken, getToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al iniciar, si hay token guardado, recupera el usuario.
  useEffect(() => {
    async function cargar() {
      if (!getToken()) {
        setCargando(false);
        return;
      }
      try {
        const { usuario } = await apiFetch("/auth/me");
        setUsuario(usuario);
      } catch {
        setToken(null);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  async function login(email, password) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    setToken(data.token);
    setUsuario(data.usuario);
  }

  function logout() {
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
