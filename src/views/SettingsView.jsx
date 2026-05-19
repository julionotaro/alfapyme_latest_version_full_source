export function SettingsView() {
  return (
    <section className="card settings-view">
      <h3>Configuración operativa</h3>
      <p>
        Esta sección queda preparada para concentrar plantillas, canales, reglas de salida e integraciones.
        Por ahora la mantengo simple para no disfrazar de producto terminado lo que todavía está en evolución.
      </p>

      <div className="settings-grid">
        <div>
          <b>Plantillas de trabajo</b>
          <small>Gestoría DGT y futuras verticales.</small>
        </div>
        <div>
          <b>Canales</b>
          <small>Email, WhatsApp, Telegram y exportaciones.</small>
        </div>
        <div>
          <b>Reglas de salida</b>
          <small>CSV, Copilot, mensajería e integraciones.</small>
        </div>
        <div>
          <b>Automatizaciones</b>
          <small>Checkpoint reservado para una segunda fase.</small>
        </div>
      </div>
    </section>
  )
}
