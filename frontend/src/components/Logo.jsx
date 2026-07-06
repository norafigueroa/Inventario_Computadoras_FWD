// Logo de FWD Costa Rica (PNG transparente en /public/logo.png).

export default function Logo({ showName = true }) {
  return (
    <div className="brand-mark">
      <img className="brand-logo" src="/logo.png" alt="FWD Costa Rica" />
      {showName && <span className="brand-tag">Inventario</span>}
    </div>
  );
}
