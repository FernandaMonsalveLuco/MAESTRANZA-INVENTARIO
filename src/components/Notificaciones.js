import React from "react";
import "../App.css";

const Notificaciones = ({ alertas }) => {
  if (!Array.isArray(alertas) || alertas.length === 0) return null;

  return (
    <div className="notificaciones-panel" role="alert" aria-live="polite">
      <h3>Notificaciones</h3>
      <ul>
        {alertas.map((alerta, i) => (
          <li key={i} className="alerta-item">
            {alerta}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notificaciones;
