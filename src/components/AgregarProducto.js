// src/components/AgregarProducto.js
import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../App.css";

const AgregarProducto = ({
  productoEditar,
  onProductoAgregado,
  onEditarFinalizado,
  cancelarEdicion,
  permisos
}) => {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [unidad, setUnidad] = useState("");
  const [stockActual, setStockActual] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [etiquetas, setEtiquetas] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");

  const tienePermiso = (clave) => permisos?.[clave] === true || permisos?.[clave] === "true";

  const convertirFecha = (timestamp) => {
    try {
      if (timestamp?.toDate) {
        return timestamp.toDate().toISOString().split("T")[0];
      }
    } catch (e) {
      console.warn("Fecha inválida:", timestamp);
    }
    return "";
  };

  useEffect(() => {
    if (productoEditar) {
      setNombre(productoEditar.nombre || "");
      setCodigo(productoEditar.codigo || "");
      setCategoria(productoEditar.categoria || "");
      setUbicacion(productoEditar.ubicacion || "");
      setNumeroSerie(productoEditar.numeroSerie || "");
      setUnidad(productoEditar.unidad || "");
      setStockActual(productoEditar.stockActual || "");
      setStockMinimo(productoEditar.stockMinimo || "");
      setFechaVencimiento(convertirFecha(productoEditar.fechaVencimiento));
      setEtiquetas((productoEditar.etiquetas || []).join(", "));
      setPrecioUnitario(productoEditar.precioUnitario || "");
    } else {
      // Limpiar
      setNombre("");
      setCodigo("");
      setCategoria("");
      setUbicacion("");
      setNumeroSerie("");
      setUnidad("");
      setStockActual("");
      setStockMinimo("");
      setFechaVencimiento("");
      setEtiquetas("");
      setPrecioUnitario("");
    }
  }, [productoEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !codigo || !categoria || !stockActual || !stockMinimo) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    const productoData = {
      nombre,
      codigo,
      categoria,
      ubicacion,
      numeroSerie,
      unidad,
      stockActual: Number(stockActual),
      stockMinimo: Number(stockMinimo),
      fechaVencimiento: fechaVencimiento
        ? Timestamp.fromDate(new Date(fechaVencimiento))
        : null,
      etiquetas: etiquetas
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      precioUnitario: Number(precioUnitario)
    };

    try {
      if (productoEditar && tienePermiso("editar")) {
        const productoRef = doc(db, "productos", productoEditar.id);
        await updateDoc(productoRef, productoData);
        onEditarFinalizado({ id: productoEditar.id, ...productoData });
      } else if (!productoEditar && tienePermiso("agregar")) {
        await addDoc(collection(db, "productos"), {
          ...productoData,
          creado: Timestamp.now(),
        });
        onProductoAgregado();
      } else {
        alert("No tienes permiso para realizar esta acción.");
        return;
      }

      // Reset form
      setNombre("");
      setCodigo("");
      setCategoria("");
      setUbicacion("");
      setNumeroSerie("");
      setUnidad("");
      setStockActual("");
      setStockMinimo("");
      setFechaVencimiento("");
      setEtiquetas("");
      setPrecioUnitario("");
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert("Error guardando producto. Revisa la consola.");
    }
  };

  // Mostrar mensaje si no tiene permisos para agregar ni editar
  if (!tienePermiso("agregar") && !tienePermiso("editar")) {
    return (
      <div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
        🚫 No tienes permisos para agregar o editar productos.
      </div>
    );
  }

  return (
    <div className="formulario-contenedor">
      <h2>{productoEditar ? "Editar Producto" : "Agregar Producto"}</h2>
      <form onSubmit={handleSubmit} className="formulario-producto">
        <input type="text" placeholder="Nombre*" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input type="text" placeholder="Código*" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        <input type="text" placeholder="Categoría*" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
        <input type="text" placeholder="Ubicación" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
        <input type="text" placeholder="N° Serie" value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)} />
        <input type="text" placeholder="Unidad (kg, lts, etc.)" value={unidad} onChange={(e) => setUnidad(e.target.value)} />
        <input type="number" placeholder="Stock actual*" value={stockActual} onChange={(e) => setStockActual(e.target.value)} />
        <input type="number" placeholder="Stock mínimo*" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
        <input type="date" placeholder="Fecha de vencimiento" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
        <input type="text" placeholder="Etiquetas (separadas por coma)" value={etiquetas} onChange={(e) => setEtiquetas(e.target.value)} />
        <input type="number" placeholder="Precio Unitario" value={precioUnitario} onChange={(e) => setPrecioUnitario(e.target.value)} step="0.01" />
        <div className="botones-formulario">
          <button type="submit" className="boton-primario">
            {productoEditar ? "Actualizar" : "Agregar"}
          </button>
          {productoEditar && (
            <button type="button" className="boton-secundario" onClick={cancelarEdicion}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AgregarProducto;
