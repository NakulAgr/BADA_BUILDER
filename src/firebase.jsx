
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAruIz1wMmd6JXT3DAWVRym7N3vxPWo94A",
  authDomain: "badabuilder-8cfae.firebaseapp.com",
  projectId: "badabuilder-8cfae",
  storageBucket: "badabuilder-8cfae.firebasestorage.app",
  messagingSenderId: "830903995718",
  appId: "1:830903995718:web:c8f5839c5b5e501c1da947",
  measurementId: "G-5W8ZNRYWGP"
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