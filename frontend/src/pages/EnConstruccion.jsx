import { Construction } from "lucide-react";

export default function EnConstruccion({ titulo }) {
  return (
    <div className="placeholder-box">
      <span className="ic">
        <Construction size={28} />
      </span>
      <h3>{titulo}</h3>
      <p>
        Esta sección se construirá en la siguiente parte: tabla de computadoras
        con búsqueda, filtros y opciones para agregar, editar y eliminar equipos.
      </p>
    </div>
  );
}
