import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      // Crear perfil si no existe
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          nombre: user.displayName || "Usuario",
          rol: "Administrador",
          permisos: {
            ver: true,
            editar: true,
            eliminar: true,
            exportar: true,
            aprobar: true,
          },
        });
      }

      onLoginSuccess();
    } catch (err) {
      console.error("Error de login:", err);
      setError("Correo o contraseña incorrectos.");
    }
  };

  // Limpia error al modificar inputs
  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h2 className="login-title">Iniciar sesión</h2>

        <label className="login-label" htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          className="login-input"
          placeholder="Correo electrónico"
          value={email}
          onChange={handleChangeEmail}
          autoComplete="username"
          required
        />

        <label className="login-label" htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          className="login-input"
          placeholder="Contraseña"
          value={password}
          onChange={handleChangePassword}
          autoComplete="current-password"
          required
        />

        {error && <div className="login-error">{error}</div>}

        <button type="submit" className="login-button">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
