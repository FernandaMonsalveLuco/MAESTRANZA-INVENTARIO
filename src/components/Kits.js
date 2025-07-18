import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Kits() {
  const [kits, setKits] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);

  // Cargar kits y productos
  useEffect(() => {
    async function cargarDatos() {
      try {
        const kitsSnap = await getDocs(collection(db, "kits"));
        setKits(kitsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const productosSnap = await getDocs(collection(db, "productos"));
        setProductos(productosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        setMensaje("Error cargando datos: " + error.message);
      }
    }
    cargarDatos();
  }, []);

  // Verifica si el kit está disponible (seguro y robusto)
  const esKitDisponible = (kit) => {
    if (!kit?.productos || !Array.isArray(kit.productos)) return false;
    return kit.productos.every(({ productoId, cantidad }) => {
      const producto = productos.find(p => p.id === productoId);
      return producto && producto.stockActual >= cantidad;
    });
  };

  // Manejar salida de kit (descontar stock)
  const registrarSalidaKit = async (kit) => {
    if (!esKitDisponible(kit)) {
      setMensaje("No hay suficiente stock para este kit.");
      return;
    }
    setProcesando(true);
    setMensaje("");
    try {
      for (const { productoId, cantidad } of kit.productos) {
        const producto = productos.find(p => p.id === productoId);
        if (!producto) throw new Error(`Producto ${productoId} no encontrado`);
        const productoRef = doc(db, "productos", productoId);
        await updateDoc(productoRef, {
          stockActual: producto.stockActual - cantidad,
        });
      }
      setMensaje(`Salida del kit "${kit.nombre}" registrada.`);
      // Actualizar productos localmente
      setProductos(prev =>
        prev.map(p =>
          kit.productos.some(kp => kp.productoId === p.id)
            ? { ...p, stockActual: p.stockActual - kit.productos.find(kp => kp.productoId === p.id).cantidad }
            : p
        )
      );
    } catch (error) {
      setMensaje("Error al registrar salida: " + error.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div>
      <h2>Kits disponibles</h2>
      {kits.length === 0 && <p>No hay kits disponibles.</p>}
      {kits.map(kit => {
        const disponible = esKitDisponible(kit);
        return (
          <div key={kit.id} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
            <h3>{kit.nombre}</h3>
            <p>{kit.descripcion || "Sin descripción"}</p>
            <ul>
              {kit.productos && kit.productos.length > 0 ? (
                kit.productos.map(({ productoId, cantidad }) => {
                  const producto = productos.find(p => p.id === productoId);
                  return (
                    <li key={productoId}>
                      {producto ? producto.nombre : "Producto no encontrado"} x {cantidad}
                    </li>
                  );
                })
              ) : (
                <li>No hay productos en este kit.</li>
              )}
            </ul>
            <button
              disabled={!disponible || procesando}
              onClick={() => registrarSalidaKit(kit)}
            >
              {procesando ? "Procesando..." : "Registrar salida"}
            </button>
            {!disponible && <p style={{ color: "red" }}>No disponible por stock insuficiente</p>}
          </div>
        );
      })}
      {mensaje && <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{mensaje}</p>}
    </div>
  );
}
