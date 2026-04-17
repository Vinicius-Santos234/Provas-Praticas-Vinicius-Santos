import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbpuR74prsycajh6GzNYmNftK8Kug9DJA",
  authDomain: "prova-bd-vinicius.firebaseapp.com",
  projectId: "prova-bd-vinicius",
  storageBucket: "prova-bd-vinicius.firebasestorage.app",
  messagingSenderId: "690096143824",
  appId: "1:690096143824:web:fcef9fc02deecc1a384dd5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);