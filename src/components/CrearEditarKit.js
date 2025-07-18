// src/components/CrearEditarKit.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import "../App.css";

const CrearEditarKit = ({ permisos }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  const tienePermiso = (clave) => permisos?.[clave] === true || permisos?.[clave] === "true";

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const productosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(productosData);
      } catch (error) {
        console.error("Error obteniendo productos:", error);
      }
    };

    obtenerProductos();
  }, []);

  useEffect(() => {
    if (id) {
      const obtenerKit = async () => {
        try {
          const kitDoc = await getDoc(doc(db, "kits", id));
          if (kitDoc.exists()) {
            const kitData = kitDoc.data();
            setNombre(kitData.nombre || "");
            setDescripcion(kitData.descripcion || "");
            setProductosSeleccionados(kitData.productos || []);
          }
        } catch (error) {
          console.error("Error obteniendo kit:", error);
        }
      };
      obtenerKit();
    }
  }, [id]);

  const manejarCambioCantidad = (productoId, cantidad) => {
    const cantidadNumerica = Math.max(1, parseInt(cantidad) || 1);
    setProductosSeleccionados((prev) =>
      prev.map((p) =>
        p.productoId === productoId ? { ...p, cantidad: cantidadNumerica } : p
      )
    );
  };

  const alternarSeleccionProducto = (productoId) => {
    setProductosSeleccionados((prev) => {
      const yaSeleccionado = prev.find((p) => p.productoId === productoId);
      if (yaSeleccionado) {
        return prev.filter((p) => p.productoId !== productoId);
      } else {
        return [...prev, { productoId, cantidad: 1 }];
      }
    });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert("El nombre del kit es obligatorio.");
      return;
    }

    if (productosSeleccionados.length === 0) {
      alert("Debes seleccionar al menos un producto para el kit.");
      return;
    }

    const datosKit = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      productos: productosSeleccionados,
      stockDisponible: 0,
    };

    try {
      if (id && tienePermiso("editarKits")) {
        await updateDoc(doc(db, "kits", id), datosKit);
      } else if (!id && tienePermiso("crearKits")) {
        await addDoc(collection(db, "kits"), datosKit);
      } else {
        alert("No tienes permisos para guardar el kit.");
        return;
      }
      navigate("/kits");
    } catch (error) {
      console.error("Error al guardar kit:", error);
      alert("Ocurrió un error al guardar el kit.");
    }
  };

  if ((!id && !tienePermiso("crearKits")) || (id && !tienePermiso("editarKits"))) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#a00" }}>
        🚫 No tienes permisos para {id ? "editar" : "crear"} kits.
      </div>
    );
  }

  return (
    <div className="formulario-contenedor">
      <h2 className="titulo-tabla">{id ? "Editar Kit" : "Crear Kit"}</h2>
      <form onSubmit={manejarSubmit} className="formulario-producto">
        <input
          type="text"
          placeholder="Nombre del Kit"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <div className="productos-lista">
          <h3>Seleccionar Productos</h3>
          {productos.length === 0 ? (
            <p style={{ color: "#666" }}>No hay productos disponibles.</p>
          ) : (
            productos.map((producto) => {
              const seleccionado = productosSeleccionados.find(
                (p) => p.productoId === producto.id
              );
              return (
                <div key={producto.id} className="producto-kit-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={!!seleccionado}
                      onChange={() => alternarSeleccionProducto(producto.id)}
                    />
                    {producto.nombre}
                  </label>
                  {seleccionado && (
                    <input
                      type="number"
                      min={1}
                      value={seleccionado.cantidad}
                      onChange={(e) =>
                        manejarCambioCantidad(producto.id, e.target.value)
                      }
                      placeholder="Cantidad"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        <button type="submit" className="boton-primario">
          {id ? "Actualizar Kit" : "Crear Kit"}
        </button>
      </form>
    </div>
  );
};

export default CrearEditarKit;
