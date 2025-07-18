// src/components/DetalleProducto.js
import React from "react";
import "../App.css"; // Asegúrate de tener los estilos de modal en App.css

const DetalleProducto = ({ producto, onCerrar }) => {
  if (!producto) return null;

  const formatearFecha = (fecha) => {
    try {
      return fecha?.toDate ? fecha.toDate().toLocaleDateString() : "Sin fecha";
    } catch {
      return "Sin fecha";
    }
  };

  return (
    <div className="modal-fondo">
      <div className="modal-contenedor">
        <h2>📝 Detalle de Producto</h2>
        <div className="detalle-linea"><strong>Nombre:</strong> {producto.nombre}</div>
        <div className="detalle-linea"><strong>Código:</strong> {producto.codigo}</div>
        <div className="detalle-linea"><strong>Categoría:</strong> {producto.categoria}</div>
        <div className="detalle-linea"><strong>Ubicación:</strong> {producto.ubicacion || "-"}</div>
        <div className="detalle-linea"><strong>Stock Actual:</strong> {producto.stockActual}</div>
        <div className="detalle-linea"><strong>Stock Mínimo:</strong> {producto.stockMinimo}</div>
        <div className="detalle-linea"><strong>Unidad:</strong> {producto.unidad || "-"}</div>
        <div className="detalle-linea"><strong>N° Serie:</strong> {producto.numeroSerie || "-"}</div>
        <div className="detalle-linea"><strong>Etiquetas:</strong> {(producto.etiquetas || []).join(", ") || "-"}</div>
        <div className="detalle-linea"><strong>Fecha Vencimiento:</strong> {formatearFecha(producto.fechaVencimiento)}</div>

        <button className="boton-secundario" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default DetalleProducto;
