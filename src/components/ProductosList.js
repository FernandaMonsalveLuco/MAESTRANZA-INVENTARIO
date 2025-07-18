import React from "react";
import "../App.css";

const ProductosList = ({ productos = [], onVerDetalle, onEditar, onEliminar, permisos = {} }) => {
  const formatearFecha = (timestamp) => {
    if (!timestamp) return "Sin fecha";
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    try {
      const d = new Date(timestamp);
      if (!isNaN(d)) return d.toLocaleDateString();
    } catch {
      // ignore
    }
    return "Sin fecha";
  };

  // Renderiza botón con permiso o disabled con tooltip y accesibilidad
  const renderBoton = (permiso, texto, clase, onClickHandler, tituloDisabled) => {
    return permiso ? (
      <button className={clase} onClick={onClickHandler}>
        {texto}
      </button>
    ) : (
      <button className={clase} disabled aria-disabled="true" title={tituloDisabled}>
        {texto}
      </button>
    );
  };

  return (
    <div className="contenedor-tabla">
      <h2 className="titulo-tabla">Lista de Productos</h2>
      <table className="tabla-productos">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>Categoría</th>
            <th>Ubicación</th>
            <th>Stock Actual</th>
            <th>Stock Mínimo</th>
            <th>Unidad</th>
            <th>N° Serie</th>
            <th>Etiquetas</th>
            <th>Fecha Vencimiento</th>
            <th>Creado</th>
            <th colSpan={3}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(productos) && productos.length > 0 ? (
            productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{producto.codigo}</td>
                <td>{producto.categoria}</td>
                <td>{producto.ubicacion || "-"}</td>
                <td>{producto.stockActual}</td>
                <td>{producto.stockMinimo}</td>
                <td>{producto.unidad || "-"}</td>
                <td>{producto.numeroSerie || "-"}</td>
                <td>{(producto.etiquetas || []).join(", ")}</td>
                <td>{formatearFecha(producto.fechaVencimiento)}</td>
                <td>{formatearFecha(producto.creado)}</td>

                <td>
                  {renderBoton(
                    permisos?.ver === "true",
                    "Ver",
                    "boton-primario",
                    () => onVerDetalle(producto),
                    "Sin permiso para ver"
                  )}
                </td>
                <td>
                  {renderBoton(
                    permisos?.editar === "true",
                    "Editar",
                    "boton-secundario",
                    () => onEditar(producto),
                    "Sin permiso para editar"
                  )}
                </td>
                <td>
                  {renderBoton(
                    permisos?.eliminar === "true",
                    "Eliminar",
                    "boton-rojo",
                    () => onEliminar(producto.id),
                    "Sin permiso para eliminar"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={14} style={{ textAlign: "center" }}>
                No hay productos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductosList;
