import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ==========================================================================
// Firebase Project Configuration
// Replace the values below with your own Firebase app configuration from the
// Firebase Console (Console -> Project Settings -> General -> Web Apps)
// ==========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBVI0hWR5QyGvLUwYZwB0jdEtX-yC2fnYY",
  authDomain: "my-chat-app-51cb2.firebaseapp.com",
  projectId: "my-chat-app-51cb2",
  storageBucket: "my-chat-app-51cb2.firebasestorage.app",
  messagingSenderId: "570056632816",
  appId: "1:570056632816:web:3ed4e9f70a748c9d1e9535",
  measurementId: "G-KS943MRN1Q"
};

// Initialize Firebase app services
const app = initializeApp(firebaseConfig);

// Export Authentication service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Export Firestore Database service
export const db = getFirestore(app);

export { signInWithPopup, signOut, signInAnonymously };
