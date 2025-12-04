
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // optional
import { getFirestore } from "firebase/firestore"; // optional
import { getStorage } from "firebase/storage"; // optional


const firebaseConfig = {
    apiKey: "AIzaSyCR1pStNBMcYziRI8myBUzo-ZDM2lAkQFA",
    authDomain: "badabuilder-64565.firebaseapp.com",
    projectId: "badabuilder-64565",
    storageBucket: "badabuilder-64565.firebasestorage.app",
    messagingSenderId: "564525900895",
    appId: "1:564525900895:web:f2a2629a2127d7fee1a7ea",
    measurementId: "G-QL3Z4KGBQ2"
  };

  // Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);

export {
    app,
    auth,
    // db,
    // storage
};