import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCufyaN7sSrIis0xfmIYU3DZdkFw9tGIoY",
  authDomain: "points-juaro.firebaseapp.com",
  projectId: "points-juaro",
  storageBucket: "points-juaro.firebasestorage.app",
  messagingSenderId: "367712968407",
  appId: "1:367712968407:web:b176d49373ccff84585a92",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
