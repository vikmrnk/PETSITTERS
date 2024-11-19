import { createContext, useContext, useEffect, useState } from "react";
import {onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { auth, db } from "../firebaseConfig";
import {doc, getDoc, setDoc} from 'firebase/firestore'

export const AuthContext = createContext();

export const AuthContextProvider = ({children})=>{
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

    useEffect(()=>{
        const unsub = onAuthStateChanged(auth, async (user)=>{
            console.log('Auth state changed:', user);
            if(user){
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    
                    if(docSnap.exists()){
                        const userData = docSnap.data();
                        setUser({
                            ...user,
                            username: userData.username,
                            profileUrl: userData.profileUrl,
                            userId: userData.userId,
                            role: userData.role
                        });
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

    const updateUserData = async (userId)=>{
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){
            let data = docSnap.data();
            setUser({...user, username: data.username, profileUrl: data.profileUrl, userId: data.userId})
        }
    }

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
    const register = async (email, password, userData, role) => {
        try {
            // Створюємо користувача
            const response = await createUserWithEmailAndPassword(auth, email, password);
            
            // Зберігаємо базову інформацію
            await setDoc(doc(db, "users", response?.user?.uid), {
                email,
                role,
                userId: response?.user?.uid
            });

            // Зберігаємо специфічну інформацію залежно від ролі
            if (role === 'sitter') {
                await setDoc(doc(db, "sitters", response?.user?.uid), {
                    ...userData,
                    userId: response?.user?.uid,
                    services: [],
                    availability: [],
                    rating: 0,
                    reviews: []
                });
            } else {
                await setDoc(doc(db, "owners", response?.user?.uid), {
                    ...userData,
                    userId: response?.user?.uid,
                    pets: []
                });
            }

            return { success: true, data: response?.user };
        } catch (e) {
            let msg = e.message;
            if(msg.includes('auth/invalid-email')) msg = 'Invalid email';
            if(msg.includes('auth/email-already-in-use')) msg = 'Email already in use';
            return { success: false, msg };
        }
    }

    return (
        <AuthContext.Provider value={{user, isAuthenticated, login, register, logout}}>
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