import React, { useState } from "react";
import InformeInventario from "./InformeInventario";
import InformeStockCritico from "./InformeStockCritico";
import InformeMovimientos from "./InformeMovimientos";
import InformeConsumo from "./InformeConsumo";

export default function Informes({ permisos = {} }) {
  const [informeSeleccionado, setInformeSeleccionado] = useState("");

  const botones = [
    {
      permiso: permisos.verInventarioValorizado === true || permisos.verInventarioValorizado === "true",
      id: "inventario",
      label: "Inventario Valorizado",
      componente: <InformeInventario />,
    },
    {
      permiso: permisos.verStockCritico === true || permisos.verStockCritico === "true",
      id: "stock",
      label: "Stock Crítico",
      componente: <InformeStockCritico />,
    },
    {
      permiso: permisos.verMovimientos === true || permisos.verMovimientos === "true",
      id: "movimientos",
      label: "Movimientos",
      componente: <InformeMovimientos />,
    },
    {
      permiso: permisos.verInformeConsumo === true || permisos.verInformeConsumo === "true",
      id: "consumo",
      label: "Consumo por Obra",
      componente: <InformeConsumo />,
    },
  ];

  const informeActivo = botones.find((b) => b.id === informeSeleccionado);

  return (
    <div className="contenedor-informes">
      <h2 className="text-xl font-bold mb-4">Panel de Informes</h2>

      <div className="botones-informes mb-4 flex flex-wrap gap-2">
        {botones.map(
          (btn) =>
            btn.permiso && (
              <button
                key={btn.id}
                onClick={() => setInformeSeleccionado(btn.id)}
                className={`btn-informe ${informeSeleccionado === btn.id ? "activo" : ""}`}
              >
                {btn.label}
              </button>
            )
        )}
      </div>

      <div className="seccion-informe">
        {informeActivo ? (
          informeActivo.componente
        ) : (
          <p className="text-gray-600">Selecciona un informe para visualizarlo.</p>
        )}
      </div>
    </div>
  );
}
