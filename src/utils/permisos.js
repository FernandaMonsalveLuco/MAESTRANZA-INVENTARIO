// utils/permisos.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const obtenerPermisosUsuario = async (uid) => {
  if (!uid) {
    console.warn("UID no proporcionado para obtener permisos");
    return {};
  }

  try {
    const docRef = doc(db, "usuarios", uid);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      return data.permisos || {};
    } else {
      console.warn(`No existe el documento para usuario con UID: ${uid}`);
      return {};
    }
  } catch (error) {
    console.error("Error obteniendo permisos:", error);
    return {};
  }
};
