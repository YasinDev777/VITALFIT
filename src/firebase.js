import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyC3eGX2mYKjhwBRAUSeEvJcd1NiEQqkbkM",
  authDomain: "vitalfit-6db88.firebaseapp.com",
  projectId: "vitalfit-6db88",
  storageBucket: "vitalfit-6db88.firebasestorage.app",
  messagingSenderId: "217609591811",
  appId: "1:217609591811:web:5754d6fd7636c5b1628236",
  measurementId: "G-53QZT0RVTV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };