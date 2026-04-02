// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY, 
  authDomain: "interviewiq-5046b.firebaseapp.com",
  projectId: "interviewiq-5046b",
  storageBucket: "interviewiq-5046b.firebasestorage.app",
  messagingSenderId: "382039109748",
  appId: "1:382039109748:web:10cac9f884cb5bc02e2121"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// authentication enabled
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };