// src/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCCIONES:
// 1. Ve a https://console.firebase.google.com
// 2. Crea un proyecto (ej: "quiniela-mundial-2026")
// 3. En el proyecto: Firestore Database → Crear base de datos → Modo de prueba
// 4. En Configuración del proyecto → Tus apps → Web (</>)
// 5. Registra la app y copia los valores de firebaseConfig aquí abajo
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJTqz9jZ9_fhUkZnvS8RrwEWtYL3HugwM",
  authDomain: "quiniela-mundial-2026-927c4.firebaseapp.com",
  projectId: "quiniela-mundial-2026-927c4",
  storageBucket: "quiniela-mundial-2026-927c4.firebasestorage.app",
  messagingSenderId: "1072344152401",
  appId: "1:1072344152401:web:012ccc9a500f1045543b70"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
