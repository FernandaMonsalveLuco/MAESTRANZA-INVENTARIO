import React from "react";

const Logout = ({ onLogout }) => (
  <button
    type="button"
    onClick={onLogout}
    className="boton-cerrar-sesion"
    aria-label="Cerrar sesión"
    title="Cerrar sesión"
  >
    Cerrar Sesión
  </button>
);

export default Logout;
