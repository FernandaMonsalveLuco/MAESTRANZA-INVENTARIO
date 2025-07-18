import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../App.css";

const ListaKits = () => {
  const [kits, setKits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerKits = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "kits"));
        const kitsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setKits(kitsData);
      } catch (error) {
        console.error("Error al obtener los kits:", error);
      }
    };

    obtenerKits();
  }, []);

  const irACrearKit = () => {
    try {
      navigate("/crear-kit");
    } catch (error) {
      console.error("Error navegando a crear kit:", error);
    }
  };

  const eliminarKit = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este kit?")) {
      try {
        await deleteDoc(doc(db, "kits", id));
        setKits((prevKits) => prevKits.filter((kit) => kit.id !== id));
      } catch (error) {
        console.error("Error eliminando kit:", error);
      }
    }
  };

  return (
    <div className="contenedor-tabla">
      <div className="encabezado-kits" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 className="titulo-tabla">Lista de Kits</h2>
        <button className="boton-primario" onClick={irACrearKit}>
          Crear Nuevo Kit
        </button>
      </div>

      {kits.length === 0 ? (
        <p>No hay kits disponibles.</p>
      ) : (
        <table className="tabla-productos">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Stock Disponible</th>
              <th>Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {kits.map((kit) => (
              <tr key={kit.id}>
                <td>{kit.nombre}</td>
                <td>{kit.descripcion || "-"}</td>
                <td>{typeof kit.stockDisponible === "number" ? kit.stockDisponible : "-"}</td>
                <td>
                  {Array.isArray(kit.productos) && kit.productos.length > 0 ? (
                    kit.productos.map((p) => (
                      <div key={p.productoId}>
                        ID: {p.productoId} - Cantidad: {p.cantidad}
                      </div>
                    ))
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <button
                    className="boton-secundario"
                    onClick={() => navigate(`/editar-kit/${kit.id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="boton-rojo"
                    onClick={() => eliminarKit(kit.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListaKits;
