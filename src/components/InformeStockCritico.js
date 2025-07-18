import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { exportarExcel } from "../utils/exportarExcel";
import { exportarPDF } from "../utils/exportarPDF";
import { useSelector } from "react-redux";

export default function InformeStockCritico() {
  const [productosCriticos, setProductosCriticos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const permisos = useSelector((state) => state.usuario.permisos || {});

  useEffect(() => {
    const obtenerProductosCriticos = async () => {
      setCargando(true);
      try {
        const snapshot = await getDocs(collection(db, "productos"));
        const productos = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

          const stock = Number(data.stockActual) || 0;
          const stockCritico = Number(data.stockCritico);
          const stockMinimo = Number(data.stockMinimo);

          const tieneStockCriticoValido = !isNaN(stockCritico);
          const tieneStockMinimoValido = !isNaN(stockMinimo);

          if (
            (tieneStockCriticoValido && stock <= stockCritico) ||
            (tieneStockMinimoValido && stock <= stockMinimo)
          ) {
            productos.push({
              id: doc.id,
              nombre: data.nombre || "Sin nombre",
              stock,
              unidad: data.unidad || "u",
              stockCritico: tieneStockCriticoValido ? stockCritico : "-",
              stockMinimo: tieneStockMinimoValido ? stockMinimo : "-",
              categoria: data.categoria || "Sin categoría",
            });
          }
        });

        setProductosCriticos(productos);
      } catch (error) {
        console.error("Error al cargar productos críticos:", error);
        setProductosCriticos([]);
      } finally {
        setCargando(false);
      }
    };

    obtenerProductosCriticos();
  }, []);

  const columnas = ["Nombre", "Categoría", "Stock", "Unidad", "Stock Crítico", "Stock Mínimo"];

  const datosParaExportar = productosCriticos.map((p) => [
    p.nombre,
    p.categoria,
    p.stock,
    p.unidad,
    p.stockCritico,
    p.stockMinimo,
  ]);

  const puedeExportar =
    permisos.exportarInformes === true || permisos.exportarInformes === "true";

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Informe: Stock Crítico y Bajo</h3>

      {cargando ? (
        <p>Cargando datos...</p>
      ) : productosCriticos.length === 0 ? (
        <p>No hay productos con stock crítico o bajo.</p>
      ) : (
        <>
          <table className="w-full text-sm border shadow mb-4">
            <thead className="bg-yellow-100">
              <tr>
                {columnas.map((col) => (
                  <th key={col} className="px-2 py-1 border">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productosCriticos.map((producto) => (
                <tr key={producto.id}>
                  <td className="border px-2 py-1">{producto.nombre}</td>
                  <td className="border px-2 py-1">{producto.categoria}</td>
                  <td className="border px-2 py-1">{producto.stock}</td>
                  <td className="border px-2 py-1">{producto.unidad}</td>
                  <td className="border px-2 py-1">{producto.stockCritico}</td>
                  <td className="border px-2 py-1">{producto.stockMinimo}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {puedeExportar && (
            <div className="flex gap-2">
              <button
                className="boton-primario"
                onClick={() => exportarExcel(productosCriticos, "StockCritico.xlsx")}
                disabled={cargando || productosCriticos.length === 0}
              >
                Exportar a Excel
              </button>
              <button
                className="boton-primario"
                onClick={() => exportarPDF(columnas, datosParaExportar, "Stock Crítico")}
                disabled={cargando || productosCriticos.length === 0}
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
