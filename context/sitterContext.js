import { createContext, useContext } from "react";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "../firebaseConfig";

export const SitterContext = createContext();

export const SitterContextProvider = ({children}) => {
    const createSitter = async (sitterData) => {
        try {
            const docRef = await addDoc(collection(db, "sitters"), {
                ...sitterData,
                createdAt: serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error("Error creating sitter:", error);
            return { success: false, error };
        }
    };

    return (
        <SitterContext.Provider value={{createSitter}}>
            {children}
        </SitterContext.Provider>
    )
}

export const useSitter = () => {
    const value = useContext(SitterContext);
    if(!value) {
        throw new Error('useSitter must be wrapped inside SitterContextProvider');
    }
    return value;
}
