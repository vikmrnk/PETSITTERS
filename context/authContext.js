import { createContext, useContext, useEffect, useState } from "react";
import {onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { auth, db } from "../firebaseConfig";
import {doc, getDoc, setDoc, collection, serverTimestamp} from 'firebase/firestore'

export const AuthContext = createContext();

export const AuthContextProvider = ({children})=>{
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

    useEffect(()=>{
        const unsub = onAuthStateChanged(auth, async (user)=>{
            if(user){
                try {
                    // Отримуємо базові дані користувача
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    
                    if(userDocSnap.exists()){
                        const userData = userDocSnap.data();
                        
                        if(userData.role === 'sitter') {
                            // Для сіттерів
                            const sitterDocRef = doc(db, 'sitters', user.uid);
                            const sitterDocSnap = await getDoc(sitterDocRef);
                            
                            if(sitterDocSnap.exists()) {
                                const sitterData = sitterDocSnap.data();
                                setUser({
                                    ...userData,
                                    username: sitterData.name,
                                    profileUrl: sitterData.imageUrl || '',
                                    userId: user.uid,
                                    name: sitterData.name
                                });
                            }
                        } else {
                            // Для власників тварин
                            const ownerDocRef = doc(db, 'owners', user.uid);
                            const ownerDocSnap = await getDoc(ownerDocRef);
                            
                            if(ownerDocSnap.exists()) {
                                const ownerData = ownerDocSnap.data();
                                setUser({
                                    ...userData,
                                    username: ownerData.name,
                                    profileUrl: ownerData.imageUrl || '',
                                    userId: user.uid,
                                    name: ownerData.name
                                });
                            }
                        }
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }else{
                setIsAuthenticated(false);
                setUser(null);
            }
        });
        return unsub;
    },[]);

    const updateUserData = (newData) => {
        setUser(newData);
    };

    const login = async (email, password)=>{
        try{
            const response = await signInWithEmailAndPassword(auth, email, password);
            return {success: true};
        }catch(e){
            let msg = e.message;
            if(msg.includes('(auth/invalid-email)')) msg='Invalid email'
            if(msg.includes('(auth/invalid-credential)')) msg='Wrong credentials'
            return {success: false, msg};
        }
    }
    const logout = async ()=>{
        try{
            await signOut(auth);
            return {success: true}
        }catch(e){
            return {success: false, msg: e.message, error: e};
        }
    }
    const register = async (email, password, username, role) => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            
            // Базові дані користувача
            const userData = {
                email,
                username,
                role,
                userId: response?.user?.uid,
                createdAt: serverTimestamp()
            };

            await setDoc(doc(db, "users", response?.user?.uid), userData);

            if (role === 'sitter') {
                await setDoc(doc(db, "sitters", response?.user?.uid), {
                    name: username,
                    email,
                    userId: response?.user?.uid,
                    services: [],
                    availability: [],
                    rating: 0,
                    reviews: [],
                    imageUrl: '', // Додаємо порожнє значення для фото
                    location: '', // Додаємо порожнє значення для локації
                    price: 0,    // Додаємо початкову ціну
                    description: '', // Додаємо порожній опис
                    createdAt: serverTimestamp()
                });
            } else {
                await setDoc(doc(db, "owners", response?.user?.uid), {
                    name: username,
                    email,
                    userId: response?.user?.uid,
                    pets: [],
                    imageUrl: '', // Додаємо порожнє значення для фото
                    createdAt: serverTimestamp()
                });
            }

            // Оновлюємо локальний стан користувача
            setUser({
                email,
                username,
                userId: response?.user?.uid,
                role,
                profileUrl: '',
                name: username
            });

            return { success: true, data: response?.user };
        } catch (e) {
            let msg = e.message;
            if(msg.includes('auth/invalid-email')) msg = 'Invalid email';
            if(msg.includes('auth/email-already-in-use')) msg = 'Email already in use';
            return { success: false, msg };
        }
    }

    return (
        <AuthContext.Provider value={{user, isAuthenticated, login, register, logout, updateUserData}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=>{
    const value = useContext(AuthContext);

    if(!value){
        throw new Error('useAuth must be wrapped inside AuthContextProvider');
    }
    return value;
}