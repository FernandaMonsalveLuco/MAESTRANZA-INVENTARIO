// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Reemplaza los siguientes datos con los de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC_XoUZ9eX5kPhybqhtbOdlbuKtCnj336w",
  authDomain: "maestranzainventario-f2fa7.firebaseapp.com",
  projectId: "maestranzainventario-f2fa7",
  storageBucket: "maestranzainventario-f2fa7.firebasestorage.app",
  messagingSenderId: "244174292766",
  appId: "1:244174292766:web:369bc9ac78042d7d74ab0f",
  measurementId: "G-2Z1QXXZM3X"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Instancias de servicios
const db = getFirestore(app);
const auth = getAuth(app);

// EXPORTAR AMBOS
export { db, auth };
