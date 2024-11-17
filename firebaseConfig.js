import { initializeApp } from "firebase/app";
import {getReactNativePersistence, initializeAuth} from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFirestore, collection} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export const usersRef = collection(db, 'users');
export const roomRef = collection(db, 'rooms');
