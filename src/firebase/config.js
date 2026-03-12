import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCJbhuaFvh03ZHmVNBveukPfGRkSr1W-ss",
  authDomain: "criador-de-legendas-f5430.firebaseapp.com",
  projectId: "criador-de-legendas-f5430",
  storageBucket: "criador-de-legendas-f5430.firebasestorage.app",
  messagingSenderId: "46715602267",
  appId: "1:46715602267:web:2f4e97fa9d0f1866f0c67e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();