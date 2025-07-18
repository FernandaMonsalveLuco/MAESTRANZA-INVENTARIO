import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { exportarExcel } from "../utils/exportarExcel";
import { exportarPDF } from "../utils/exportarPDF";
import { useSelector } from "react-redux";

export default function InformeMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [filtros, setFiltros] = useState({
    desde: "",
    hasta: "",
    usuario: "",
    proyecto: "",
  });
  const [cargando, setCargando] = useState(false);

  const permisos = useSelector((state) => state.usuario.permisos || {});
  const puedeExportar = permisos.exportarInformes === true || permisos.exportarInformes === "true";

  const obtenerMovimientos = useCallback(async () => {
    setCargando(true);
    try {
      const coleccionRef = collection(db, "movimientos");
      const condiciones = [];

      if (filtros.desde) {
        condiciones.push(where("fecha", ">=", new Date(filtros.desde)));
      }

      if (filtros.hasta) {
        const hastaFecha = new Date(filtros.hasta);
        hastaFecha.setHours(23, 59, 59, 999);
        condiciones.push(where("fecha", "<=", hastaFecha));
      }

      const consulta = condiciones.length
        ? query(coleccionRef, ...condiciones, orderBy("fecha", "desc"))
        : query(coleccionRef, orderBy("fecha", "desc"));

      const snapshot = await getDocs(consulta);
      let resultados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filtros locales
      if (filtros.usuario.trim()) {
        resultados = resultados.filter((m) =>
          m.usuario?.toLowerCase().includes(filtros.usuario.toLowerCase())
        );
      }

      if (filtros.proyecto.trim()) {
        resultados = resultados.filter((m) =>
          m.proyecto?.toLowerCase().includes(filtros.proyecto.toLowerCase())
        );
      }

      const datos = resultados.map((m) => {
        let fecha = m.fecha;
        if (fecha?.toDate) fecha = fecha.toDate();
        else if (!(fecha instanceof Date)) fecha = new Date(fecha);
        return {
          ...m,
          fecha: fecha.toLocaleDateString("es-CL"),
        };
      });

      setMovimientos(datos);
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
      setMovimientos([]);
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    obtenerMovimientos();
  }, [obtenerMovimientos]);

  const columnas = ["Fecha", "Usuario", "Proyecto", "Producto", "Cantidad", "Unidad", "Tipo"];
  const datosExportar = movimientos.map((m) => [
    m.fecha,
    m.usuario || "-",
    m.proyecto || "-",
    m.producto || "-",
    m.cantidad ?? 0,
    m.unidad || "-",
    m.tipo || "-",
  ]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const nombreArchivo = `Movimientos_${new Date().toISOString().split("T")[0]}`;

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">Informe de Movimientos</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label htmlFor="desde" className="block text-sm font-medium text-gray-700">Desde:</label>
          <input type="date" id="desde" name="desde" value={filtros.desde} onChange={handleFiltroChange} className="input" />
        </div>
        <div>
          <label htmlFor="hasta" className="block text-sm font-medium text-gray-700">Hasta:</label>
          <input type="date" id="hasta" name="hasta" value={filtros.hasta} onChange={handleFiltroChange} className="input" />
        </div>
        <div>
          <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">Usuario:</label>
          <input
            type="text"
            id="usuario"
            name="usuario"
            value={filtros.usuario}
            onChange={handleFiltroChange}
            className="input"
            placeholder="Ej: Juan"
          />
        </div>
        <div>
          <label htmlFor="proyecto" className="block text-sm font-medium text-gray-700">Proyecto:</label>
          <input
            type="text"
            id="proyecto"
            name="proyecto"
            value={filtros.proyecto}
            onChange={handleFiltroChange}
            className="input"
            placeholder="Ej: Obra Sur"
          />
        </div>
      </div>

      <button onClick={obtenerMovimientos} className="boton-primario mb-4">
        Aplicar Filtros
      </button>

      {cargando ? (
        <p>Cargando movimientos...</p>
      ) : movimientos.length === 0 ? (
        <p>No hay movimientos con los filtros actuales.</p>
      ) : (
        <>
          <table className="w-full text-sm border shadow mb-4">
            <thead className="bg-blue-100">
              <tr>
                {columnas.map((col, i) => (
                  <th key={i} className="border px-2 py-1">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id}>
                  <td className="border px-2 py-1">{m.fecha}</td>
                  <td className="border px-2 py-1">{m.usuario || "-"}</td>
                  <td className="border px-2 py-1">{m.proyecto || "-"}</td>
                  <td className="border px-2 py-1">{m.producto || "-"}</td>
                  <td className="border px-2 py-1 text-right">{m.cantidad ?? 0}</td>
                  <td className="border px-2 py-1">{m.unidad || "-"}</td>
                  <td className="border px-2 py-1">{m.tipo || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {puedeExportar && (
            <div className="flex gap-2">
              <button
                className="boton-primario"
                onClick={() => exportarExcel(movimientos, `${nombreArchivo}.xlsx`)}
              >
                Exportar a Excel
              </button>
              <button
                className="boton-primario"
                onClick={() => exportarPDF(columnas, datosExportar, "Movimientos")}
              >
                Exportar a PDF
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
