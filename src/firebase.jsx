
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCJo7eUuF3nm8GoTzOrpFBJb_k00I6v1wg",
  authDomain: "original-badabuilder.firebaseapp.com",
  projectId: "original-badabuilder",
  storageBucket: "original-badabuilder.firebasestorage.app",
  messagingSenderId: "988327451876",
  appId: "1:988327451876:web:ee9b8875918495756720f1",
  measurementId: "G-C5014YM6M6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services with optimizations
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Optimize Firebase performance
if (typeof window !== 'undefined') {
  // Enable network for faster connections
  try {
    enableNetwork(db);
  } catch (error) {
    console.warn('Network optimization not applied:', error);
  }
}

export {
  app,
  auth,
  db,
  storage
};