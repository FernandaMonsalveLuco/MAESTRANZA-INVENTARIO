import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../App.css";

export default function Movimientos({ permisos }) {
  const [tipo, setTipo] = useState("entrada");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [movimientos, setMovimientos] = useState([]);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    if (permisos?.verMovimientos) {
      cargarMovimientos();
    } else {
      setMovimientos([]);
    }
  }, [permisos]);

  const cargarMovimientos = async () => {
    try {
      const q = query(collection(db, "movimientos"), orderBy("fecha", "desc"), limit(20));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMovimientos(lista);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
      setMensaje("Error al cargar movimientos.");
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setMensaje(null);

    if (!productoId.trim() || !cantidad || !motivo.trim()) {
      setMensaje("Por favor completa todos los campos.");
      return;
    }

    const cantidadNum = parseInt(cantidad, 10);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      setMensaje("La cantidad debe ser un número entero positivo.");
      return;
    }

    const nuevoMovimiento = {
      tipo,
      productoId: productoId.trim().toUpperCase(),
      cantidad: cantidadNum,
      motivo: motivo.trim(),
      fecha: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, "movimientos"), nuevoMovimiento);
      setProductoId("");
      setCantidad("");
      setMotivo("");
      setMensaje("Movimiento registrado correctamente.");
      cargarMovimientos();
    } catch (error) {
      console.error("Error registrando movimiento:", error);
      setMensaje("Error registrando movimiento.");
    }
  };

  if (!permisos?.verMovimientos) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Acceso denegado
      </div>
    );
  }

  return (
    <div className="formulario-contenedor">
      <h2>Registrar Movimiento</h2>

      {permisos?.registrarMovimientos ? (
        <form onSubmit={handleRegistro} className="formulario-producto" noValidate>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
            <option value="transferencia">Transferencia</option>
          </select>

          <input
            type="text"
            placeholder="ID Producto"
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            autoComplete="off"
          />

          <input
            type="number"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            min="1"
          />

          <input
            type="text"
            placeholder="Motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />

          <div className="botones-formulario">
            <button type="submit" className="boton-primario">
              Registrar
            </button>
          </div>

          {mensaje && <p style={{ color: mensaje.includes("error") ? "red" : "green" }}>{mensaje}</p>}
        </form>
      ) : (
        <p style={{ color: "gray", marginTop: "1rem" }}>
          No tienes permisos para registrar movimientos.
        </p>
      )}

      <h2 style={{ marginTop: "2rem" }}>Historial de Movimientos (últimos 20)</h2>
      <ul>
        {movimientos.length > 0 ? (
          movimientos.map((mov) => (
            <li key={mov.id}>
              [{mov.tipo.toUpperCase()}] {mov.productoId} - {mov.cantidad} - {mov.motivo} (
              {new Date(mov.fecha.seconds * 1000).toLocaleString()})
            </li>
          ))
        ) : (
          <li>No hay movimientos registrados.</li>
        )}
      </ul>
    </div>
  );
}
