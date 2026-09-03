import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Client-side Firebase configuration with fallback values
// When environment variables or config files are provided, they take precedence.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForNoveliaCloud2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "novelia-library.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "novelia-library",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "novelia-library.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "634661747997",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:634661747997:web:9fa42b26715fbc9a"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

export default app;
