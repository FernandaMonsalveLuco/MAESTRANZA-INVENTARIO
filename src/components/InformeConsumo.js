import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { exportarExcel } from "../utils/exportarExcel";
import { exportarPDF } from "../utils/exportarPDF";
import { useSelector } from "react-redux";

export default function InformeConsumo() {
  const [consumos, setConsumos] = useState([]);
  const [tipoAgrupacion, setTipoAgrupacion] = useState("proyecto");
  const [filtros, setFiltros] = useState({
    nombre: "",
    desde: "",
    hasta: "",
  });
  const [cargando, setCargando] = useState(false);

  const permisos = useSelector((state) => state.usuario.permisos || {});
  const tienePermiso = (clave) => permisos?.[clave] === true || permisos?.[clave] === "true";

  const obtenerConsumos = useCallback(async () => {
    setCargando(true);
    try {
      const snapshot = await getDocs(collection(db, "movimientos"));
      const datosFiltrados = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const fecha =
          data.fecha?.toDate?.() || (typeof data.fecha === "string" ? new Date(data.fecha) : new Date());

        const esSalida = data.tipo === "Salida";
        const fechaOK =
          (!filtros.desde || fecha >= new Date(filtros.desde)) &&
          (!filtros.hasta || fecha <= new Date(filtros.hasta + "T23:59:59"));
        const nombreFiltro = filtros.nombre.trim().toLowerCase();
        const agrupador = tipoAgrupacion === "proyecto" ? data.proyecto : data.equipo;
        const nombreOK =
          !nombreFiltro ||
          (typeof agrupador === "string" && agrupador.toLowerCase().includes(nombreFiltro));

        if (esSalida && fechaOK && nombreOK) {
          datosFiltrados.push({
            ...data,
            fecha: fecha.toLocaleDateString(),
            agrupador: agrupador || "No especificado",
            producto: data.producto || "Desconocido",
            unidad: data.unidad || "-",
            cantidad: Number(data.cantidad) || 0,
          });
        }
      });

      // Agrupar por agrupador + producto
      const resumen = {};
      datosFiltrados.forEach((item) => {
        const clave = `${item.agrupador}||${item.producto}`;
        if (!resumen[clave]) {
          resumen[clave] = {
            agrupador: item.agrupador,
            producto: item.producto,
            unidad: item.unidad,
            total: 0,
          };
        }
        resumen[clave].total += item.cantidad;
      });

      setConsumos(Object.values(resumen));
    } catch (error) {
      console.error("Error al obtener consumos:", error);
    } finally {
      setCargando(false);
    }
  }, [filtros, tipoAgrupacion]);

  useEffect(() => {
    obtenerConsumos();
  }, [obtenerConsumos]);

  const columnas = [
    tipoAgrupacion === "proyecto" ? "Obra/Proyecto" : "Equipo",
    "Producto",
    "Cantidad Total",
    "Unidad",
  ];

  const datosExportar = consumos.map((c) => [
    c.agrupador,
    c.producto,
    c.total,
    c.unidad,
  ]);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">
        Informe de Consumo por{" "}
        {tipoAgrupacion === "proyecto" ? "Obra" : "Equipo"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label>Tipo:</label>
          <select
            className="input"
            value={tipoAgrupacion}
            onChange={(e) => setTipoAgrupacion(e.target.value)}
          >
            <option value="proyecto">Obra/Proyecto</option>
            <option value="equipo">Equipo</option>
          </select>
        </div>
        <div>
          <label>{tipoAgrupacion === "proyecto" ? "Obra" : "Equipo"}:</label>
          <input
            type="text"
            className="input"
            value={filtros.nombre}
            onChange={(e) =>
              setFiltros({ ...filtros, nombre: e.target.value })
            }
          />
        </div>
        <div>
          <label>Desde:</label>
          <input
            type="date"
            className="input"
            value={filtros.desde}
            onChange={(e) =>
              setFiltros({ ...filtros, desde: e.target.value })
            }
          />
        </div>
        <div>
          <label>Hasta:</label>
          <input
            type="date"
            className="input"
            value={filtros.hasta}
            onChange={(e) =>
              setFiltros({ ...filtros, hasta: e.target.value })
            }
          />
        </div>
      </div>

      <button onClick={obtenerConsumos} className="boton-primario mb-4">
        Aplicar Filtros
      </button>

      {cargando ? (
        <p>Cargando consumos...</p>
      ) : consumos.length === 0 ? (
        <p>No hay consumos registrados con estos filtros.</p>
      ) : (
        <>
          <table className="w-full text-sm border shadow mb-4">
            <thead className="bg-orange-100">
              <tr>
                {columnas.map((col, i) => (
                  <th key={i} className="border px-2 py-1">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consumos.map((c, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{c.agrupador}</td>
                  <td className="border px-2 py-1">{c.producto}</td>
                  <td className="border px-2 py-1">{c.total}</td>
                  <td className="border px-2 py-1">{c.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {tienePermiso("exportarInformes") && (
            <div className="flex gap-2">
              <button
                className="boton-primario"
                onClick={() =>
                  exportarExcel(
                    consumos,
                    `Consumo_${tipoAgrupacion}_${new Date().toISOString().split("T")[0]}.xlsx`
                  )
                }
              >
                Exportar a Excel
              </button>
              <button
                className="boton-primario"
                onClick={() =>
                  exportarPDF(
                    columnas,
                    datosExportar,
                    `Consumo por ${tipoAgrupacion === "proyecto" ? "Obra" : "Equipo"}`
                  )
                }
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
