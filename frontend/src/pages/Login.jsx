import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Laptop, ShieldCheck, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      {/* Panel de marca */}
      <aside className="login-brand">
        <Logo />
        <div className="login-brand-hero">
          <h1>Inventario de computadoras</h1>
          <p>
            Centraliza y controla el equipo de FWD Costa Rica: asignaciones a
            estudiantes y staff, préstamos, donaciones y estado de cada máquina.
          </p>
          <div className="login-features">
            <div className="login-feature">
              <span className="ic"><Laptop size={18} /></span>
              Todas las computadoras en un solo lugar
            </div>
            <div className="login-feature">
              <span className="ic"><Search size={18} /></span>
              Búsqueda y filtros por sede, categoría y estado
            </div>
            <div className="login-feature">
              <span className="ic"><ShieldCheck size={18} /></span>
              Acceso seguro con control de usuarios
            </div>
          </div>
        </div>
        <div className="login-foot">© {new Date().getFullYear()} FWD Costa Rica</div>
      </aside>

      {/* Formulario */}
      <main className="login-form-wrap">
        <div className="login-card">
          <div className="login-logo">
            <img src="/logo.png" alt="FWD Costa Rica" />
          </div>
          <h2>Bienvenido</h2>
          <p className="subtitle">Ingresa tus credenciales para acceder al sistema.</p>

          {error && (
            <div className="alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">Correo electrónico</label>
              <div className="input-icon">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="tucorreo@fwdcostarica.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <div className="input-icon">
                <Lock size={18} />
                <input
                  id="password"
                  type={verPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-eye"
                  onClick={() => setVerPass((v) => !v)}
                  aria-label={verPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {verPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={enviando}>
              {enviando ? (
                <>
                  <span className="spinner" /> Ingresando…
                </>
              ) : (
                <>
                  <LogIn size={18} /> Iniciar sesión
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
