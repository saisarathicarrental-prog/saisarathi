import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

// Firebase configuration using Vite environment variables (VITE_ prefix required by Vite)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

/**
 * Returns true if valid Firebase configuration credentials have been provided.
 */
export const isFirebaseConfigured = (): boolean => {
  const { apiKey, projectId } = firebaseConfig;
  return Boolean(
    apiKey &&
    apiKey.trim() !== "" &&
    !apiKey.includes("your_api_key") &&
    projectId &&
    projectId.trim() !== "" &&
    !projectId.includes("your_project_id")
  );
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (typeof window !== "undefined" && isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
}

export { app, db };
