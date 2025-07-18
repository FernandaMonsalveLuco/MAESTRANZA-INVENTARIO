// src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import ProductosList from "./components/ProductosList";
import AgregarProducto from "./components/AgregarProducto";
import Login from "./components/Login";
import Logout from "./components/LogOut";
import Movimientos from "./components/Movimientos";
import ListaKits from "./components/ListaKits";
import DetalleProducto from "./components/DetalleProducto";
import Informes from "./components/Informes";
import CrearEditarKit from "./components/CrearEditarKit";
import {
  getDoc,
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

function AccesoDenegado() {
  return (
    <div style={{ padding: "2rem", color: "red", textAlign: "center" }}>
      <h2>Acceso Denegado</h2>
      <p>No tienes permisos para acceder a esta sección.</p>
    </div>
  );
}

function App() {
  const [productos, setProductos] = useState([]);
  const [productoEditar, setProductoEditar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [hayMas, setHayMas] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [permisos, setPermisos] = useState({});
  const [rol, setRol] = useState(null);

  const LIMITE = 5;

  const handleCerrarSesion = () => {
    auth
      .signOut()
      .then(() => {
        setUsuario(null);
        setRol(null);
        setPermisos({});
      })
      .catch((error) => console.error("Error cerrando sesión:", error));
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        const docRef = doc(db, "usuarios", user.uid);
        let docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          await setDoc(docRef, {
            nombre: user.displayName || "Admin",
            rol: "Administrador",
            permisos: {
              agregar: "true",
              aprobar: "true",
              crearKits: "true",
              editar: "true",
              editarKits: "true",
              eliminar: "true",
              exportar: "true",
              exportarInformes: "true",
              registrarMovimientos: "true",
              ver: "true",
              verInformeConsumo: "true",
              verInformes: "true",
              verInventarioValorizado: "true",
              verKits: "true",
              verMovimientos: "true",
              verStockCritico: "true",
            },
          });
          docSnap = await getDoc(docRef);
        }

        const datos = docSnap.data();
        setRol(datos.rol);
        setPermisos(datos.permisos || {});
      } else {
        setUsuario(null);
        setRol(null);
        setPermisos({});
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (usuario) {
      cargarPrimerosProductos();
      detectarAlertas();
    } else {
      setProductos([]);
      setAlertas([]);
      setUltimoDoc(null);
      setHayMas(true);
    }
  }, [usuario]);

  async function cargarPrimerosProductos() {
    const q = query(collection(db, "productos"), orderBy("nombre"), limit(LIMITE));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProductos(docs);
    setUltimoDoc(snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null);
    setHayMas(snapshot.docs.length === LIMITE);
  }

  async function detectarAlertas() {
    const snapshot = await getDocs(collection(db, "productos"));
    const nuevasAlertas = [];

    snapshot.forEach((doc) => {
      const p = doc.data();
      if (p.stockActual < p.stockMinimo) {
        nuevasAlertas.push(`Stock bajo: ${p.nombre}`);
      }
      if (p.fechaVencimiento?.toDate) {
        const vencimiento = p.fechaVencimiento.toDate();
        const dias = (vencimiento - new Date()) / (1000 * 60 * 60 * 24);
        if (dias <= 7) {
          nuevasAlertas.push(`Vencimiento próximo: ${p.nombre} (${Math.round(dias)} días)`);
        }
      }
    });

    setAlertas(nuevasAlertas);
  }

  async function cargarMasProductos() {
    if (!ultimoDoc) return;
    const q = query(
      collection(db, "productos"),
      orderBy("nombre"),
      startAfter(ultimoDoc),
      limit(LIMITE)
    );
    const snapshot = await getDocs(q);
    const nuevos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProductos((prev) => [...prev, ...nuevos]);
    setUltimoDoc(snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null);
    setHayMas(snapshot.docs.length === LIMITE);
  }

  async function eliminarProducto(id) {
    if (permisos.eliminar !== "true") {
      alert("No tienes permiso para eliminar productos.");
      return;
    }
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      await deleteDoc(doc(db, "productos", id));
      await cargarPrimerosProductos();
    }
  }

  async function editarProducto(productoActualizado) {
    if (permisos.editar !== "true") {
      alert("No tienes permiso para editar productos.");
      return;
    }
    const productoRef = doc(db, "productos", productoActualizado.id);
    await updateDoc(productoRef, {
      nombre: productoActualizado.nombre,
      stockActual: Number(productoActualizado.stockActual),
      // Agrega aquí otros campos si es necesario actualizar
    });
    setProductoEditar(null);
    await cargarPrimerosProductos();
  }

  if (!usuario) {
    return <Login onLoginSuccess={() => setUsuario(auth.currentUser)} />;
  }

  return (
    <div>
      <header className="header">
        <div className="header-left">
          <h1>Maestranzas Unidas S.A</h1>
        </div>
        <div className="header-right">
          <span>{usuario.displayName || rol || "Invitado"}</span>
          <Logout onLogout={handleCerrarSesion} />
        </div>
      </header>

      <nav className="nav-links">
        <Link to="/" className="nav-link-btn">Inventario</Link>
        {permisos.verMovimientos === "true" && (
          <Link to="/movimientos" className="nav-link-btn">Movimientos</Link>
        )}
        {permisos.verKits === "true" && (
          <Link to="/kits" className="nav-link-btn">Kits</Link>
        )}
        {permisos.verInformes === "true" && (
          <Link to="/informes" className="nav-link-btn">Informes</Link>
        )}
      </nav>

      {alertas.length > 0 && (
        <div className="notificaciones-panel">
          <h3>Notificaciones</h3>
          <ul>
            {alertas.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="buscador-container">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="buscador-input"
        />
      </div>

      <Routes>
        <Route
          path="/"
          element={
            <div className="seccion-maestranza-inventario">
              <section className="contenedor-seccion">
                <h2>Inventario</h2>

                <AgregarProducto
                  onProductoAgregado={cargarPrimerosProductos}
                  productoEditar={productoEditar}
                  onEditarFinalizado={editarProducto}
                  cancelarEdicion={() => setProductoEditar(null)}
                  permisos={permisos}
                />

                <ProductosList
                  productos={productos.filter((p) =>
                    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
                  )}
                  onEditar={setProductoEditar}
                  onEliminar={eliminarProducto}
                  onVerDetalle={setProductoDetalle}
                  permisos={permisos}
                />

                {productoDetalle && (
                  <DetalleProducto
                    producto={productoDetalle}
                    onCerrar={() => setProductoDetalle(null)}
                  />
                )}

                {hayMas && (
                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <button onClick={cargarMasProductos} className="boton-primario">
                      Cargar más
                    </button>
                  </div>
                )}
              </section>
            </div>
          }
        />
        <Route
          path="/movimientos"
          element={
            permisos.verMovimientos === "true" ? (
              <Movimientos permisos={permisos} />
            ) : (
              <AccesoDenegado />
            )
          }
        />
        <Route
          path="/kits"
          element={
            permisos.verKits === "true" ? (
              <ListaKits permisos={permisos} />
            ) : (
              <AccesoDenegado />
            )
          }
        />
        <Route
          path="/crear-kit"
          element={
            permisos.crearKits === "true" ? (
              <CrearEditarKit permisos={permisos} />
            ) : (
              <AccesoDenegado />
            )
          }
        />
        <Route
          path="/informes"
          element={
            permisos.verInformes === "true" ? (
              <Informes permisos={permisos} />
            ) : (
              <AccesoDenegado />
            )
          }
        />
        <Route
          path="/editar-kit/:id"
          element={
            permisos.editarKits === "true" ? (
              <CrearEditarKit permisos={permisos} />
            ) : (
              <AccesoDenegado />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
