import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import * as XLSX from "xlsx";

const formatearMoneda = (valor) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(valor);
};

const InformeInventario = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarProductos = async () => {
      setCargando(true);
      try {
        const snapshot = await getDocs(collection(db, "productos"));
        const productosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(productosData);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setProductos([]);
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  const valorTotalProducto = (prod) => {
    const stock = Number(prod.stockActual) || 0;
    const precio = Number(prod.precioUnitario) || 0;
    return stock * precio;
  };

  const totalInventario = productos.reduce(
    (acc, p) => acc + valorTotalProducto(p),
    0
  );

  const exportarExcel = () => {
    if (productos.length === 0) return;

    const datos = productos.map((p) => ({
      Nombre: p.nombre || "-",
      Código: p.codigo || "-",
      Categoría: p.categoria || "-",
      "Stock Actual": p.stockActual ?? 0,
      "Precio Unitario": p.precioUnitario ?? 0,
      "Valor Total": valorTotalProducto(p),
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, `InventarioValorizado_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Informe Inventario Valorizado</h2>

      <button
        className="boton-primario mb-4"
        onClick={exportarExcel}
        disabled={cargando || productos.length === 0}
        title={
          cargando
            ? "Cargando productos..."
            : productos.length === 0
            ? "No hay productos disponibles"
            : "Exportar a Excel"
        }
      >
        Exportar a Excel
      </button>

      {cargando ? (
        <p>Cargando productos...</p>
      ) : productos.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <table className="min-w-full border border-gray-300 rounded-md shadow-sm">
          <caption className="text-left text-sm mb-2 text-gray-600">
            Total de productos: {productos.length}
          </caption>
          <thead className="bg-blue-100">
            <tr>
              <th className="border px-3 py-2 text-left">Nombre</th>
              <th className="border px-3 py-2 text-left">Código</th>
              <th className="border px-3 py-2 text-left">Categoría</th>
              <th className="border px-3 py-2 text-right">Stock Actual</th>
              <th className="border px-3 py-2 text-right">Precio Unitario</th>
              <th className="border px-3 py-2 text-right">Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="border px-3 py-1">{p.nombre || "-"}</td>
                <td className="border px-3 py-1">{p.codigo || "-"}</td>
                <td className="border px-3 py-1">{p.categoria || "-"}</td>
                <td className="border px-3 py-1 text-right">{p.stockActual ?? 0}</td>
                <td className="border px-3 py-1 text-right">
                  {p.precioUnitario != null ? formatearMoneda(p.precioUnitario) : "-"}
                </td>
                <td className="border px-3 py-1 text-right">
                  {formatearMoneda(valorTotalProducto(p))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={5} className="text-right px-3 py-2">
                Total Inventario:
              </td>
              <td className="text-right px-3 py-2">
                {formatearMoneda(totalInventario)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export default InformeInventario;
