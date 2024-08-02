// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"; 
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchatapp-68078.firebaseapp.com",
  projectId: "reactchatapp-68078",
  storageBucket: "reactchatapp-68078.appspot.com",
  messagingSenderId: "331428593426",
  appId: "1:331428593426:web:6e62dd7993a6b34074fdcb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const Storage = getStorage();