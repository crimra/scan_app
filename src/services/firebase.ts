// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUFtL75Unc048f9KvjbzMpOY0WIMeDWts",
  authDomain: "pointage-qr.firebaseapp.com",
  projectId: "pointage-qr",
  storageBucket: "pointage-qr.firebasestorage.app",
  messagingSenderId: "240521118045",
  appId: "1:240521118045:web:8d40981be192dc06b228b4",
  measurementId: "G-0R8PKSS2VD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;