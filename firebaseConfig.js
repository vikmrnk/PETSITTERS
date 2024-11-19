import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth, getAuth } from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC92Ac1IuNPmpHPa1jyrMfDzhLi_OBcUOo",
  authDomain: "petsitters-391a5.firebaseapp.com",
  projectId: "petsitters-391a5",
  storageBucket: "petsitters-391a5.firebasestorage.app",
  messagingSenderId: "687532921824",
  appId: "1:687532921824:web:d9f17d3e787c34c58dd185"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Перевіряємо, чи вже ініціалізована автентифікація
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };
export const db = getFirestore(app);

export const usersRef = collection(db, 'users');
export const sittersRef = collection(db, 'sitters');
export const ownersRef = collection(db, 'owners');
export const roomRef = collection(db, 'rooms');
